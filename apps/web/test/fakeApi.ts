import type { AssistantStreamEvent } from "@dadalink/domain"
import { ApiError, type DadaLinkApi } from "../src/api/index.ts"
import { CONTENT_FIXTURES, DIRECTORY_FIXTURES, EMERGENCY_FIXTURES, JOURNEY_FIXTURES } from "./fixtures.ts"

type Script = ReadonlyArray<AssistantStreamEvent> | ApiError

/**
 * In-memory `DadaLinkApi` for component and routing tests. Assistant answers
 * are scripted per call; `pending` keeps the stream open until released.
 */
export const makeFakeApi = (options: { readonly answers?: Array<Script> } = {}) => {
  const answers = options.answers ?? []
  const asked: Array<{ readonly question: string; readonly locale: string; readonly deviceId: string }> = []

  const api: DadaLinkApi = {
    content: {
      list: async (query) => JOURNEY_FIXTURES.filter((item) => query.phase === undefined || item.phase === query.phase),
      get: async (id) => {
        const content = CONTENT_FIXTURES[id]
        if (content === undefined) throw new ApiError("not-found")
        return content
      }
    },
    directory: {
      forCountry: async (country) => DIRECTORY_FIXTURES.filter((entry) => entry.country === country),
      emergency: async (country) => EMERGENCY_FIXTURES[country] ?? []
    },
    agencies: {
      check: async (query) => ({ query, verdict: "not-found", matches: [] }) as never
    },
    assistant: {
      askStream: async (input, onEvent) => {
        asked.push({ question: input.question, locale: input.locale, deviceId: input.deviceId })
        const script = answers.shift() ?? [{ _tag: "Done" }]
        if (script instanceof ApiError) throw script
        for (const event of script) onEvent(event)
      }
    },
    dispose: async () => undefined
  }
  return { api, asked }
}
