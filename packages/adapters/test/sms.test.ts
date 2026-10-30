import type { E164PhoneNumber } from "@dadalink/domain"
import { SmsSender } from "@dadalink/ports"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Option, Redacted, Ref } from "effect"
import { HttpClient, type HttpClientRequest, HttpClientResponse } from "effect/http"
import {
  AFRICASTALKING_LIVE_URL,
  AFRICASTALKING_SANDBOX_URL,
  africasTalkingSmsSender,
  LogOnlySmsSender,
  maskPhone,
  SentSms,
  SmsSenderLive,
  TwilioSmsSender
} from "../src/index.ts"

const to = "+251911000000" as E164PhoneNumber

interface Captured {
  readonly url: string
  readonly headers: Record<string, string>
  readonly form: URLSearchParams
}

const stubClient = (captured: Array<Captured>, statusCode: number) =>
  HttpClient.make((request: HttpClientRequest.HttpClientRequest, url) =>
    Effect.sync(() => {
      const body = request.body._tag === "Uint8Array" ? new TextDecoder().decode(request.body.body) : ""
      captured.push({ url: url.toString(), headers: { ...request.headers }, form: new URLSearchParams(body) })
      const payload = {
        SMSMessageData: {
          Message: "Sent to 1/1",
          Recipients: [{ status: statusCode === 101 ? "Success" : "InvalidPhoneNumber", statusCode, number: to }]
        }
      }
      return HttpClientResponse.fromWeb(request, new Response(JSON.stringify(payload), { status: 201 }))
    })
  )

const atLayer = (captured: Array<Captured>, statusCode: number, sandbox: boolean) =>
  africasTalkingSmsSender({
    username: "sandbox",
    apiKey: Redacted.make("at-key"),
    senderId: Option.some("DadaLink"),
    sandbox
  }).pipe(Layer.provide(Layer.succeed(HttpClient.HttpClient, stubClient(captured, statusCode))))

describe("Africa's Talking SMS adapter", () => {
  it.effect("posts a form to the sandbox endpoint with the API key header", () => {
    const captured: Array<Captured> = []
    return Effect.gen(function* () {
      yield* (yield* SmsSender).send({ to, text: "DadaLink SOS" })
      expect(captured[0]?.url).toBe(AFRICASTALKING_SANDBOX_URL)
      expect(captured[0]?.headers.apikey).toBe("at-key")
      expect(captured[0]?.form.get("username")).toBe("sandbox")
      expect(captured[0]?.form.get("to")).toBe(to)
      expect(captured[0]?.form.get("message")).toBe("DadaLink SOS")
      expect(captured[0]?.form.get("from")).toBe("DadaLink")
    }).pipe(Effect.provide(atLayer(captured, 101, true)))
  })

  it.effect("uses the live endpoint outside the sandbox", () => {
    const captured: Array<Captured> = []
    return Effect.gen(function* () {
      yield* (yield* SmsSender).send({ to, text: "x" })
      expect(captured[0]?.url).toBe(AFRICASTALKING_LIVE_URL)
    }).pipe(Effect.provide(atLayer(captured, 101, false)))
  })

  it.effect("fails with SmsDeliveryFailed when the recipient is rejected", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* SmsSender).send({ to, text: "x" }))
      expect(error._tag).toBe("SmsDeliveryFailed")
      expect(error.reason).toBe("InvalidPhoneNumber")
    }).pipe(Effect.provide(atLayer([], 403, true)))
  )
})

describe("LogOnly SMS adapter", () => {
  it.effect("records messages without contacting any gateway", () =>
    Effect.gen(function* () {
      const sender = yield* SmsSender
      expect(sender.provider).toBe("log")
      yield* sender.send({ to, text: "hello" })
      expect(yield* Ref.get(yield* SentSms)).toEqual([{ to, text: "hello" }])
    }).pipe(Effect.provide(LogOnlySmsSender.layer))
  )

  it("masks phone numbers for logs", () => {
    expect(maskPhone("+251911000000")).toBe("+2519******00")
  })
})

describe("Twilio SMS adapter (stub)", () => {
  it.effect("fails explicitly until implemented", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip((yield* SmsSender).send({ to, text: "x" }))
      expect(error.provider).toBe("twilio")
    }).pipe(Effect.provide(TwilioSmsSender.layer))
  )
})

describe("SmsSenderLive", () => {
  const withEnv = (env: Record<string, string>) =>
    SmsSenderLive.pipe(Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnvRecord(env))))

  it.effect("defaults to the log-only sender", () =>
    Effect.gen(function* () {
      expect((yield* SmsSender).provider).toBe("log")
    }).pipe(Effect.provide(withEnv({})))
  )

  it.effect("selects Africa's Talking from configuration", () =>
    Effect.gen(function* () {
      expect((yield* SmsSender).provider).toBe("africastalking")
    }).pipe(
      Effect.provide(
        withEnv({ DADALINK_SMS_PROVIDER: "africastalking", AFRICASTALKING_USERNAME: "u", AFRICASTALKING_API_KEY: "k" })
      )
    )
  )
})
