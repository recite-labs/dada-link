import {
  type AgencyCheck,
  AskRequest,
  type AssistantStreamEvent,
  ContentId,
  type ContentKind,
  type ContentSummary,
  type Country,
  type DirectoryEntry,
  type EmergencyContact,
  type JourneyPhase,
  type Locale,
  type LocalizedContent,
  type Topic
} from "@dadalink/domain"
import { Effect, Exit, ManagedRuntime, Schema, Stream } from "effect"
import { type ApiClientConfig, DadaLinkHttpClient } from "./DadaLinkHttpClient.ts"
import { causeToError } from "./toApiError.ts"

export interface ContentListQuery {
  readonly locale?: Locale
  readonly country?: Country
  readonly phase?: JourneyPhase
  readonly kind?: ContentKind
  readonly topic?: Topic
}

/** Unvalidated question input; validated against the contract before it is sent. */
export interface AskInput {
  readonly deviceId: string
  readonly locale: Locale
  readonly country?: Country
  readonly phase?: JourneyPhase
  readonly question: string
}

export interface CallOptions {
  readonly signal?: AbortSignal
}

/**
 * Promise-based DadaLink API for React code. Every method rejects with an
 * `ApiError` (or an `AbortError` when cancelled through `signal`).
 */
export interface DadaLinkApi {
  readonly content: {
    readonly list: (query: ContentListQuery, options?: CallOptions) => Promise<ReadonlyArray<ContentSummary>>
    readonly get: (id: string, locale: Locale, options?: CallOptions) => Promise<LocalizedContent>
  }
  readonly directory: {
    readonly forCountry: (country: Country, options?: CallOptions) => Promise<ReadonlyArray<DirectoryEntry>>
    readonly emergency: (
      country: Country,
      locale: Locale,
      options?: CallOptions
    ) => Promise<ReadonlyArray<EmergencyContact>>
  }
  readonly agencies: {
    readonly check: (query: string, options?: CallOptions) => Promise<AgencyCheck>
  }
  readonly assistant: {
    /** Streams the answer; resolves after the `Done` event. */
    readonly askStream: (
      input: AskInput,
      onEvent: (event: AssistantStreamEvent) => void,
      options?: CallOptions
    ) => Promise<void>
  }
  /** Releases the underlying runtime (tests). */
  readonly dispose: () => Promise<void>
}

const decodeContentId = Schema.decodeUnknownEffect(ContentId)
const decodeAskRequest = Schema.decodeUnknownEffect(AskRequest)

/** Builds the API facade: the only place where Effect programs are run for the UI. */
export const createApiClient = (config: ApiClientConfig): DadaLinkApi => {
  const runtime = ManagedRuntime.make(DadaLinkHttpClient.layer(config))

  const run = async <A, E>(effect: Effect.Effect<A, E, DadaLinkHttpClient>, options?: CallOptions): Promise<A> => {
    const exit = await runtime.runPromiseExit(effect, { signal: options?.signal })
    if (Exit.isSuccess(exit)) return exit.value
    throw causeToError(exit.cause)
  }

  return {
    content: {
      list: (query, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            return yield* client.content.list({ query })
          }),
          options
        ),
      get: (id, locale, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            const contentId = yield* decodeContentId(id)
            return yield* client.content.get({ params: { id: contentId }, query: { locale } })
          }),
          options
        )
    },
    directory: {
      forCountry: (country, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            return yield* client.directory.forCountry({ params: { country } })
          }),
          options
        ),
      emergency: (country, locale, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            return yield* client.directory.emergency({ params: { country }, query: { locale } })
          }),
          options
        )
    },
    agencies: {
      check: (query, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            return yield* client.agencies.check({ query: { q: query } })
          }),
          options
        )
    },
    assistant: {
      askStream: (input, onEvent, options) =>
        run(
          Effect.gen(function* () {
            const client = yield* DadaLinkHttpClient
            const payload = yield* decodeAskRequest(input)
            const events = yield* client.assistant.askStream({ payload })
            yield* Stream.runForEach(events, (event) => Effect.sync(() => onEvent(event)))
          }),
          options
        )
    },
    dispose: () => runtime.dispose()
  }
}
