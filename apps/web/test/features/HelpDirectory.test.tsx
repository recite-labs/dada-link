import { screen, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { HelpDirectory } from "../../src/features/help/HelpDirectory.tsx"
import { DIRECTORY_FIXTURES } from "../fixtures.ts"
import { renderWithProviders } from "../render.tsx"

describe("HelpDirectory", () => {
  it("groups services under localised headings, emergency first", async () => {
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />)
    const headings = await screen.findAllByRole("heading", { level: 2 })
    expect(headings.map((h) => h.textContent)).toEqual([
      "Emergency",
      "Ethiopian missions",
      "Work and protection",
      "Shelter and support"
    ])
  })

  it("dials the short code inside the country and shows the full number too", async () => {
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />)
    const call = await screen.findByRole("link", { name: "Call Musaned hotline" })
    expect(call).toHaveAttribute("href", "tel:19911")
    expect(screen.getByText("+966 11 000 0000")).toBeInTheDocument()
  })

  it("strips spaces from tel: links and copies the number", async () => {
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />)

    expect(await screen.findByRole("link", { name: "Call Embassy of Ethiopia, Riyadh" })).toHaveAttribute(
      "href",
      "tel:+966114823919"
    )
    await userEvent.click(screen.getByRole("button", { name: "Copy the number of Embassy of Ethiopia, Riyadh" }))
    expect(writeText).toHaveBeenCalledWith("+966 11 482 3919")
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument()
  })

  it("shows the unverified flag subtly and only on unverified entries", async () => {
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />)
    const embassy = (await screen.findByText("Embassy of Ethiopia, Riyadh")).closest("li")
    const police = screen.getByText("Police").closest("li")
    expect(embassy && within(embassy).queryByText(/not yet verified/)).toBeNull()
    expect(police && within(police).getByText(/not yet verified/)).toBeInTheDocument()
  })

  it("uses localised names and topic labels", async () => {
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />, { locale: "am" })
    expect(await screen.findByText("የኢትዮጵያ ኤምባሲ፣ ሪያድ")).toBeInTheDocument()
    expect(screen.getByText("አደጋ ጊዜ, በደል")).toBeInTheDocument()
  })

  it("says so when a service has no public number, offering its website instead", async () => {
    renderWithProviders(<HelpDirectory entries={DIRECTORY_FIXTURES} />)
    const shelter = (await screen.findByText("Women's shelter")).closest("li")
    expect(shelter && within(shelter).getByText("No public number yet")).toBeInTheDocument()
    expect(shelter && within(shelter).queryByRole("link", { name: /^Call/ })).toBeNull()
    expect(shelter && within(shelter).getByRole("link", { name: "Website" })).toHaveAttribute(
      "rel",
      "noopener noreferrer"
    )
  })
})
