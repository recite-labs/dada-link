import { describe, expect, it } from "vitest"
import { chatReducer, initialChatState, isBusy } from "../../src/features/assistant/chatReducer.ts"
import { citation, emergencyNotice } from "../fixtures.ts"

const asked = chatReducer(initialChatState, { type: "asked", id: "t1", question: "He hits me" })

describe("chatReducer", () => {
  it("adds a waiting turn", () => {
    expect(asked.turns).toHaveLength(1)
    expect(asked.turns[0]).toMatchObject({ question: "He hits me", status: "waiting", answer: "" })
    expect(isBusy(asked)).toBe(true)
  })

  it("applies stream events in order", () => {
    const notice = emergencyNotice()
    const events = [
      { _tag: "Emergency", notice },
      { _tag: "Citations", citations: [citation("abuse-what-to-do", "If someone hurts you")], grounded: true },
      { _tag: "Delta", text: "You are " },
      { _tag: "Delta", text: "not alone." },
      { _tag: "Done" }
    ] as const
    const state = events.reduce((s, event) => chatReducer(s, { type: "event", id: "t1", event }), asked)
    const turn = state.turns[0]
    expect(turn?.emergency).toBe(notice)
    expect(turn?.citations.map((c) => c.contentId)).toEqual(["abuse-what-to-do"])
    expect(turn?.grounded).toBe(true)
    expect(turn?.answer).toBe("You are not alone.")
    expect(turn?.status).toBe("done")
    expect(isBusy(state)).toBe(false)
  })

  it("marks streaming once text arrives", () => {
    const state = chatReducer(asked, { type: "event", id: "t1", event: { _tag: "Delta", text: "Hi" } })
    expect(state.turns[0]?.status).toBe("streaming")
  })

  it("records failures on the right turn", () => {
    const two = chatReducer(asked, { type: "asked", id: "t2", question: "Second" })
    const state = chatReducer(two, { type: "failed", id: "t2", error: "rate-limited" })
    expect(state.turns.map((t) => t.status)).toEqual(["waiting", "failed"])
    expect(state.turns[1]?.error).toBe("rate-limited")
  })

  it("resets the conversation", () => {
    expect(chatReducer(asked, { type: "reset" })).toEqual(initialChatState)
  })
})
