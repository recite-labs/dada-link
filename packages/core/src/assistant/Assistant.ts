import type { AskRequest, AssistantStreamEvent, EmergencyCategory, EmergencyNotice } from "@dadalink/domain"
import { AskResponse, Citation, RateLimited, UpstreamUnavailable } from "@dadalink/domain"
import { type Passage, type PersistenceError, RateLimiter, Retriever } from "@dadalink/ports"
import { Context, Effect, Layer, Stream } from "effect"
import { type AiError, LanguageModel, Prompt, type Response } from "effect/ai"
import { HelpDirectory } from "../directory/HelpDirectory.ts"
import { Pseudonymizer } from "../privacy/Pseudonymizer.ts"
import { AssistantSettings } from "./AssistantSettings.ts"
import { buildEmergencyNotice, detectEmergency } from "./emergency.ts"
import { MESSAGES } from "./messages.ts"
import { buildSystemPrompt, buildUserMessage } from "./prompt.ts"

const DAY_SECONDS = 24 * 60 * 60

export type AskError = RateLimited | UpstreamUnavailable | PersistenceError

/** A question independent of the channel it came from. */
export type Question = Omit<AskRequest, "deviceId">

/**
 * Who the daily quota is counted for, e.g. `{ namespace: "device", id }` for
 * the app or `{ namespace: "telegram-chat", id }` for the bot. Only a salted
 * hash of it is ever used as a key.
 */
export interface QuotaSubject {
  readonly namespace: string
  readonly id: string
}

/** Everything decided before the model is (possibly) called. */
interface Preparation {
  readonly request: Question
  readonly categories: ReadonlyArray<EmergencyCategory>
  readonly notice: EmergencyNotice | null
  readonly passages: ReadonlyArray<Passage>
  readonly citations: ReadonlyArray<Citation>
}

const toUpstream = (_: AiError.AiError) => new UpstreamUnavailable({ service: "language-model" })

const withNotice = (notice: EmergencyNotice | null, text: string) =>
  notice === null ? text : `${notice.message}\n\n${text}`

/**
 * "Ask Dada": answers only from retrieved reviewed content, cites it, speaks
 * the user's language, and leads with SOS + local emergency numbers when
 * danger is detected. Nothing about the conversation is stored.
 */
export class Assistant extends Context.Service<
  Assistant,
  {
    ask(request: AskRequest): Effect.Effect<AskResponse, AskError>
    /** Same as `ask` for channels without a device id (Telegram). */
    askAs(subject: QuotaSubject, question: Question): Effect.Effect<AskResponse, AskError>
    /** Quota and retrieval run before streaming starts, so they fail as ordinary errors. */
    askStream(
      request: AskRequest
    ): Effect.Effect<Stream.Stream<AssistantStreamEvent, UpstreamUnavailable>, RateLimited | PersistenceError>
  }
>()("@dadalink/core/Assistant") {
  static readonly layer = Layer.effect(
    Assistant,
    Effect.gen(function* () {
      const model = yield* LanguageModel.LanguageModel
      const retriever = yield* Retriever
      const rateLimiter = yield* RateLimiter
      const directory = yield* HelpDirectory
      const pseudonymizer = yield* Pseudonymizer
      const settings = yield* AssistantSettings

      const enforceQuota = Effect.fn("Assistant.enforceQuota")(function* (subject: QuotaSubject) {
        const key = `assistant:${yield* pseudonymizer.hash(subject.namespace, subject.id)}`
        const decision = yield* rateLimiter.consume({ key, limit: settings.dailyLimit, windowSeconds: DAY_SECONDS })
        if (!decision.allowed) {
          return yield* new RateLimited({ scope: "assistant", retryAfterSeconds: decision.retryAfterSeconds })
        }
      })

      const deviceSubject = (request: AskRequest): QuotaSubject => ({ namespace: "device", id: request.deviceId })

      const prepare = Effect.fn("Assistant.prepare")(function* (subject: QuotaSubject, request: Question) {
        yield* enforceQuota(subject)
        const categories = detectEmergency(request.question)
        const contacts =
          categories.length > 0 && request.country !== undefined
            ? yield* directory.emergencyContacts(request.country, request.locale)
            : []
        const notice = categories.length > 0 ? buildEmergencyNotice(categories, contacts, request.locale) : null
        const passages = yield* retriever.retrieve({
          text: request.question,
          locale: request.locale,
          ...(request.country === undefined ? {} : { country: request.country }),
          limit: settings.maxPassages,
          reviewedOnly: settings.reviewedOnly
        })
        const citations = passages.map(
          (p) => new Citation({ contentId: p.contentId, title: p.title, locale: p.locale })
        )
        return { request, categories, notice, passages, citations } satisfies Preparation
      })

      const promptFor = (p: Preparation) =>
        Prompt.make([
          {
            role: "system",
            content: buildSystemPrompt({
              locale: p.request.locale,
              ...(p.request.country === undefined ? {} : { country: p.request.country }),
              ...(p.request.phase === undefined ? {} : { phase: p.request.phase }),
              passages: p.passages,
              emergency: p.categories
            })
          },
          { role: "user", content: buildUserMessage(p.request.question) }
        ])

      const toQuestion = ({ deviceId: _, ...question }: AskRequest): Question => question

      const askAs = Effect.fn("Assistant.askAs")(function* (subject: QuotaSubject, request: Question) {
        const p = yield* prepare(subject, request)
        const grounded = p.passages.length > 0
        const body = grounded
          ? (yield* model.generateText({ prompt: promptFor(p) }).pipe(Effect.mapError(toUpstream))).text
          : MESSAGES[request.locale].fallback
        return new AskResponse({
          locale: request.locale,
          answer: withNotice(p.notice, body),
          citations: p.citations,
          emergency: p.notice,
          grounded
        })
      })

      const ask = (request: AskRequest) => askAs(deviceSubject(request), toQuestion(request))

      const askStream = Effect.fn("Assistant.askStream")(function* (request: AskRequest) {
        const p = yield* prepare(deviceSubject(request), toQuestion(request))
        const grounded = p.passages.length > 0
        const head: Array<AssistantStreamEvent> = [
          ...(p.notice === null ? [] : [{ _tag: "Emergency" as const, notice: p.notice }]),
          { _tag: "Citations", citations: p.citations, grounded }
        ]
        const body: Stream.Stream<AssistantStreamEvent, UpstreamUnavailable> = grounded
          ? model.streamText({ prompt: promptFor(p) }).pipe(
              Stream.filter((part): part is Response.TextDeltaPart => part.type === "text-delta"),
              Stream.map((part): AssistantStreamEvent => ({ _tag: "Delta", text: part.delta })),
              Stream.mapError(toUpstream)
            )
          : Stream.make({ _tag: "Delta", text: MESSAGES[request.locale].fallback })
        return Stream.fromIterable(head).pipe(
          Stream.concat(body),
          Stream.concat(Stream.make({ _tag: "Done" as const }))
        )
      })

      return Assistant.of({ ask, askAs, askStream })
    })
  )
}
