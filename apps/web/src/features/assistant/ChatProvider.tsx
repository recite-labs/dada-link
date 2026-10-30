import type { Country, JourneyPhase } from "@dadalink/domain"
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useReducer, useRef } from "react"
import { isAbortError, isApiError } from "../../api/index.ts"
import { useApi } from "../../queries/ApiProvider.tsx"
import type { UiLocale } from "../../i18n/index.ts"
import { usePreferenceStore } from "../../preferences/index.ts"
import { type ChatState, chatReducer, initialChatState, isBusy } from "./chatReducer.ts"

export interface AskContext {
  readonly locale: UiLocale
  readonly country?: Country
  readonly phase?: JourneyPhase
}

interface ChatValue {
  readonly state: ChatState
  readonly busy: boolean
  readonly ask: (question: string, context: AskContext) => void
  /** Stops any answer in progress and forgets the conversation. */
  readonly reset: () => void
}

const ChatContext = createContext<ChatValue | null>(null)

/**
 * Holds the conversation for the session, above the routes, so a question
 * typed on Home continues on the Ask page. Nothing is persisted.
 */
export const ChatProvider = ({ children }: { readonly children: ReactNode }) => {
  const api = useApi()
  const preferences = usePreferenceStore()
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const inFlight = useRef<AbortController | null>(null)
  const nextId = useRef(0)
  const busy = isBusy(state)

  const ask = useCallback(
    (question: string, context: AskContext) => {
      const text = question.trim()
      if (text === "" || inFlight.current !== null) return
      const id = `turn-${++nextId.current}`
      const controller = new AbortController()
      inFlight.current = controller
      dispatch({ type: "asked", id, question: text })
      api.assistant
        .askStream(
          { deviceId: preferences.deviceId(), question: text, ...context },
          (event) => dispatch({ type: "event", id, event }),
          { signal: controller.signal }
        )
        .catch((error: unknown) => {
          if (isAbortError(error)) return
          dispatch({ type: "failed", id, error: isApiError(error) ? error.kind : "unexpected" })
        })
        .finally(() => {
          if (inFlight.current === controller) inFlight.current = null
        })
    },
    [api, preferences]
  )

  const reset = useCallback(() => {
    inFlight.current?.abort()
    inFlight.current = null
    dispatch({ type: "reset" })
  }, [])

  useEffect(() => () => inFlight.current?.abort(), [])

  const value = useMemo(() => ({ state, busy, ask, reset }), [state, busy, ask, reset])
  return <ChatContext value={value}>{children}</ChatContext>
}

export const useChat = (): ChatValue => {
  const value = use(ChatContext)
  if (value === null) throw new Error("useChat must be used inside <ChatProvider>")
  return value
}
