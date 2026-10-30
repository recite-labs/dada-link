import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Conversation } from "../../src/features/assistant/Conversation.tsx"
import type { Turn } from "../../src/features/assistant/chatReducer.ts"
import { citation, emergencyNotice } from "../fixtures.ts"
import { renderWithProviders } from "../render.tsx"

const turn = (fields: Partial<Turn>): Turn => ({
  id: "t1",
  question: "He hits me and took my salary",
  status: "done",
  answer: "",
  citations: [],
  grounded: true,
  emergency: null,
  error: undefined,
  ...fields
})

const noop = () => undefined

describe("Conversation", () => {
  it("shows a typing indicator before the first words arrive", async () => {
    renderWithProviders(<Conversation turns={[turn({ status: "waiting" })]} onRetry={noop} />)
    expect(await screen.findByText("Dada is looking for an answer…")).toBeInTheDocument()
  })

  it("renders the streamed answer as Markdown", async () => {
    renderWithProviders(
      <Conversation turns={[turn({ status: "streaming", answer: "You are **not** alone" })]} onRetry={noop} />
    )
    expect((await screen.findByText("not")).tagName).toBe("STRONG")
  })

  it("puts the emergency notice first, with numbers to call", async () => {
    renderWithProviders(
      <Conversation
        turns={[turn({ emergency: emergencyNotice(), answer: "Here is what you can do." })]}
        onRetry={noop}
      />
    )
    const alert = await screen.findByRole("alert")
    expect(within(alert).getByText(/press SOS and call: 999/)).toBeInTheDocument()
    expect(within(alert).getByRole("link", { name: "Call Police: 999" })).toHaveAttribute("href", "tel:999")
    const answer = screen.getByText("Here is what you can do.")
    expect(alert.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("renders citations as numbered source cards linking to the articles", async () => {
    renderWithProviders(
      <Conversation
        turns={[
          turn({ answer: "Keep copies [1].", citations: [citation("passport-taken", "If your passport is taken")] })
        ]}
        onRetry={noop}
      />
    )
    const sources = await screen.findByRole("region", { name: "Sources" })
    const link = within(sources).getByRole("link", { name: /If your passport is taken/ })
    expect(link).toHaveAttribute("href", "/en/articles/passport-taken")
    expect(link).toHaveTextContent("[1]")
  })

  it("does not show sources until the answer is complete", async () => {
    renderWithProviders(
      <Conversation
        turns={[turn({ status: "streaming", answer: "Keep", citations: [citation("passport-taken", "Passport")] })]}
        onRetry={noop}
      />
    )
    await screen.findByText("Keep")
    expect(screen.queryByRole("region", { name: "Sources" })).toBeNull()
  })

  it("explains the daily limit and points to resources that stay open", async () => {
    renderWithProviders(<Conversation turns={[turn({ status: "failed", error: "rate-limited" })]} onRetry={noop} />)
    expect(await screen.findByText("You have used today's questions")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Help numbers" })).toHaveAttribute("href", "/en/help/SA")
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull()
  })

  it("offers a retry when Dada is unavailable", async () => {
    renderWithProviders(<Conversation turns={[turn({ status: "failed", error: "unavailable" })]} onRetry={noop} />)
    expect(await screen.findByText(/Dada cannot answer right now/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
  })
})
