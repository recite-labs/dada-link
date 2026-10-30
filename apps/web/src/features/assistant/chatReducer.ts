import type { AssistantStreamEvent, Citation, EmergencyNotice } from "@dadalink/domain"
import type { ApiErrorKind } from "../../api/index.ts"

export type TurnStatus = "waiting" | "streaming" | "done" | "failed"

/** One question and its (possibly still streaming) answer. Kept in memory only. */
export interface Turn {
  readonly id: string
  readonly question: string
  readonly status: TurnStatus
  readonly answer: string
  readonly citations: ReadonlyArray<Citation>
  /** `false` when no reviewed content matched and Dada gave the safe fallback. */
  readonly grounded: boolean | undefined
  readonly emergency: EmergencyNotice | null
  readonly error: ApiErrorKind | undefined
}

export interface ChatState {
  readonly turns: ReadonlyArray<Turn>
}

export type ChatAction =
  | { readonly type: "asked"; readonly id: string; readonly question: string }
  | { readonly type: "event"; readonly id: string; readonly event: AssistantStreamEvent }
  | { readonly type: "failed"; readonly id: string; readonly error: ApiErrorKind }
  | { readonly type: "reset" }

export const initialChatState: ChatState = { turns: [] }

const newTurn = (id: string, question: string): Turn => ({
  id,
  question,
  status: "waiting",
  answer: "",
  citations: [],
  grounded: undefined,
  emergency: null,
  error: undefined
})

const applyEvent = (turn: Turn, event: AssistantStreamEvent): Turn => {
  switch (event._tag) {
    case "Emergency":
      return { ...turn, emergency: event.notice }
    case "Citations":
      return { ...turn, citations: event.citations, grounded: event.grounded }
    case "Delta":
      return { ...turn, status: "streaming", answer: turn.answer + event.text }
    case "Done":
      return { ...turn, status: "done" }
  }
}

const updateTurn = (state: ChatState, id: string, update: (turn: Turn) => Turn): ChatState => ({
  turns: state.turns.map((turn) => (turn.id === id ? update(turn) : turn))
})

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "asked":
      return { turns: [...state.turns, newTurn(action.id, action.question)] }
    case "event":
      return updateTurn(state, action.id, (turn) => applyEvent(turn, action.event))
    case "failed":
      return updateTurn(state, action.id, (turn) => ({ ...turn, status: "failed", error: action.error }))
    case "reset":
      return initialChatState
  }
}

export const isBusy = (state: ChatState): boolean => {
  const last = state.turns.at(-1)
  return last !== undefined && (last.status === "waiting" || last.status === "streaming")
}
