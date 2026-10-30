import { screen, waitFor, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ApiError } from "../../src/api/index.ts"
import { makeFakeApi } from "../fakeApi.ts"
import { citation, emergencyNotice } from "../fixtures.ts"
import { renderApp } from "../render.tsx"

describe("Ask Dada", () => {
  it("streams an answer with an emergency notice and sources", async () => {
    const fake = makeFakeApi({
      answers: [
        [
          { _tag: "Emergency", notice: emergencyNotice() },
          { _tag: "Citations", citations: [citation("abuse-what-to-do", "If someone hurts you")], grounded: true },
          { _tag: "Delta", text: "You are not alone. " },
          { _tag: "Delta", text: "Here is what you can do [1]." },
          { _tag: "Done" }
        ]
      ]
    })
    renderApp("/en/ask", { api: fake.api })

    expect(await screen.findByText(/Dada gives information, not legal or medical advice/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Write your question…"), "He hits me{Enter}")

    expect(await screen.findByText(/Here is what you can do/)).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("Your safety first")
    expect(screen.getByRole("link", { name: /If someone hurts you/ })).toHaveAttribute(
      "href",
      "/en/articles/abuse-what-to-do"
    )
    expect(fake.asked).toEqual([
      { question: "He hits me", locale: "en", deviceId: expect.stringMatching(/^[0-9a-f-]{36}$/) }
    ])
  })

  it("hands a question from Home to the Ask page without putting it in the URL", async () => {
    const fake = makeFakeApi({
      answers: [[{ _tag: "Delta", text: "Keep copies of your passport." }, { _tag: "Done" }]]
    })
    const { router } = renderApp("/en", { api: fake.api })
    await userEvent.type(await screen.findByLabelText("Ask Dada"), "passport{Enter}")

    await waitFor(() => expect(router.state.location.pathname).toBe("/en/ask"))
    expect(router.state.location.href).not.toContain("passport")
    expect(await screen.findByText("Keep copies of your passport.")).toBeInTheDocument()
  })

  it("shows the quota state when the daily limit is reached", async () => {
    const fake = makeFakeApi({ answers: [new ApiError("rate-limited", { retryAfterSeconds: 3600 })] })
    renderApp("/en/ask", { api: fake.api })
    await userEvent.click(await screen.findByRole("button", { name: "My salary was not paid" }))
    const alert = await screen.findByRole("alert")
    expect(within(alert).getByText("You have used today's questions")).toBeInTheDocument()
  })

  it("forgets the conversation when she presses Hide", async () => {
    const fake = makeFakeApi({ answers: [[{ _tag: "Delta", text: "Answer" }, { _tag: "Done" }]] })
    const replace = window.location.replace
    const visited: Array<string> = []
    Object.defineProperty(window, "location", {
      value: { ...window.location, replace: (url: string) => visited.push(url) },
      configurable: true
    })
    try {
      renderApp("/en/ask", { api: fake.api })
      await userEvent.type(await screen.findByLabelText("Write your question…"), "salary{Enter}")
      await screen.findByText("Answer")
      await userEvent.click(screen.getByRole("button", { name: /^Hide/ }))
      expect(visited).toEqual(["https://www.bbc.com/weather"])
      await waitFor(() => expect(screen.queryByText("Answer")).toBeNull())
    } finally {
      Object.defineProperty(window, "location", { value: { ...window.location, replace }, configurable: true })
    }
  })
})
