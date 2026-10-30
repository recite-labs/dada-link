import { AgencyCheck } from "@dadalink/domain"
import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgencyResult } from "../../src/features/agencies/AgencyResult.tsx"
import { renderWithProviders } from "../render.tsx"

describe("AgencyResult", () => {
  it("never calls a missing agency illegal: don't pay, check, report", async () => {
    renderWithProviders(
      <AgencyResult check={new AgencyCheck({ query: "Gulf Jobs Fast", verdict: "not-found", matches: [] })} />
    )
    expect(await screen.findByRole("heading", { name: /Not found/ })).toBeInTheDocument()
    expect(screen.getByText(/Do not pay any fee/)).toBeInTheDocument()
    expect(screen.queryByText(/is illegal/i)).toBeNull()
    expect(screen.getByRole("link", { name: "Report it" })).toHaveAttribute("href", "/en/help/ET")
    expect(screen.getByText("“Gulf Jobs Fast”")).toBeInTheDocument()
  })

  it("shows the licence of a licensed agency and the no-fee rule", async () => {
    const check = new AgencyCheck({
      query: "Selam",
      verdict: "licensed",
      matches: [
        {
          id: "selam-overseas",
          name: "Selam Overseas Employment Agency",
          licenceNumber: "MoLS-123",
          status: "licensed",
          region: "Addis Ababa",
          sourceUrl: "https://mols.gov.et/list"
        } as never
      ]
    })
    renderWithProviders(<AgencyResult check={check} />)
    expect(await screen.findByText("Selam Overseas Employment Agency")).toBeInTheDocument()
    expect(screen.getByText("Licence no. MoLS-123 · Addis Ababa")).toBeInTheDocument()
    expect(screen.getByText(/must not charge you a placement fee/)).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Report it" })).toBeNull()
  })
})
