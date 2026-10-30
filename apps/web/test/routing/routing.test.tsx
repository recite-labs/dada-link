import { screen, waitFor, within } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { createPreferenceStore } from "../../src/preferences/index.ts"
import { renderApp } from "../render.tsx"

describe("locale routing", () => {
  it("sends / to Amharic when the browser prefers no supported language", async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["fr-FR", "ar"])
    const { router } = renderApp("/")
    await waitFor(() => expect(router.state.location.pathname).toBe("/am"))
    expect(await screen.findByRole("heading", { level: 1, name: /ሰላም እህቴ/ })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe("am")
  })

  it("follows the browser language on a first visit", async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(["om-ET", "en"])
    const { router } = renderApp("/")
    await waitFor(() => expect(router.state.location.pathname).toBe("/om"))
  })

  it("sends / to the language she chose before", async () => {
    const preferences = createPreferenceStore(window.localStorage)
    preferences.update({ locale: "om" })
    const { router } = renderApp("/", { preferences })
    await waitFor(() => expect(router.state.location.pathname).toBe("/om"))
  })

  it("renders each supported language and remembers it", async () => {
    for (const [path, greeting] of [
      ["/en", /Selam, sister/],
      ["/om", /Akkam, obboleettii/]
    ] as const) {
      const { unmount } = renderApp(path)
      expect(await screen.findByRole("heading", { level: 1, name: greeting })).toBeInTheDocument()
      unmount()
    }
    expect(window.localStorage.getItem("dadalink.locale")).toBe("om")
  })

  it("shows the 404 page for unknown locales and paths", async () => {
    vi.spyOn(navigator, "languages", "get").mockReturnValue([])
    renderApp("/fr/help/SA")
    expect(await screen.findByRole("heading", { name: "ገጹ አልተገኘም" })).toBeInTheDocument()
  })

  it("shows the 404 page inside the shell for a missing article", async () => {
    renderApp("/en/articles/does-not-exist")
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Hide/ })).toBeInTheDocument()
  })

  it("accepts lower-case country codes and validates them", async () => {
    renderApp("/en/help/sa")
    expect(await screen.findByRole("heading", { level: 1, name: "Help numbers" })).toBeInTheDocument()
    expect(await screen.findByText("Embassy of Ethiopia, Riyadh")).toBeInTheDocument()
  })

  it("switches language in place, keeping the page", async () => {
    const { router } = renderApp("/en/help/SA")
    await screen.findByText("Embassy of Ethiopia, Riyadh")
    await userEvent.selectOptions(screen.getByLabelText("Language"), "am")
    await waitFor(() => expect(router.state.location.pathname).toBe("/am/help/SA"))
    expect(await screen.findByRole("heading", { level: 1, name: "የእርዳታ ስልኮች" })).toBeInTheDocument()
  })
})

describe("home", () => {
  it("links the tiles to the selected country and journey step", async () => {
    renderApp("/en")
    await screen.findByRole("heading", { level: 1 })
    await userEvent.click(screen.getByRole("radio", { name: "Kuwait" }))
    expect(screen.getByRole("link", { name: /Help numbers/ })).toHaveAttribute("href", "/en/help/KW")
    expect(screen.getByRole("link", { name: /My rights/ })).toHaveAttribute("href", "/en/rights/KW")

    await userEvent.click(screen.getByRole("radio", { name: "Return" }))
    expect(screen.getByRole("radio", { name: "Ethiopia" })).toBeChecked()
    expect(screen.getByRole("link", { name: /Journey guides/ })).toHaveAttribute("href", "/en/journey/return")
    expect(window.localStorage.getItem("dadalink.journey")).toBe("return")
  })

  it("opens the emergency numbers for the selected country from SOS", async () => {
    renderApp("/en")
    await screen.findByRole("heading", { level: 1 })
    await userEvent.click(screen.getByRole("button", { name: /In danger right now/ }))
    const dialog = await screen.findByRole("dialog", { name: "Call for help now" })
    expect(within(dialog).getByText("Emergency numbers in Saudi Arabia")).toBeInTheDocument()
    expect(await within(dialog).findByRole("link", { name: "Call Police: 999" })).toHaveAttribute("href", "tel:999")
    expect(within(dialog).getByText(/cannot send an SOS message/)).toBeInTheDocument()
    expect(within(dialog).getByRole("link", { name: "Get the app" })).toHaveAttribute("rel", "noopener noreferrer")

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})

describe("content pages", () => {
  it("renders a country's rights with sources", async () => {
    renderApp("/en/rights/SA")
    expect(
      await screen.findByRole("heading", { level: 1, name: "Your rights as a domestic worker in Saudi Arabia" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "MHRSD regulation" })).toHaveAttribute(
      "href",
      "https://hrsd.gov.sa/regulation"
    )
    expect(screen.getByText(/not yet reviewed by an expert/)).toBeInTheDocument()
  })

  it("opens sensitive articles with a calm content note and labels English fallbacks", async () => {
    renderApp("/om/articles/abuse-what-to-do")
    expect(await screen.findByRole("heading", { level: 1, name: "If someone hurts you" })).toBeInTheDocument()
    expect(screen.getByText("Hubachiisa")).toBeInTheDocument()
    expect(screen.getByText(/Afaan Ingiliffaan dhiyaate/)).toBeInTheDocument()
    expect(document.querySelector("main script, main img")).toBeNull()
  })

  it("lists journey guides without previewing sensitive ones", async () => {
    renderApp("/en/journey/abroad")
    expect(await screen.findByText("When your salary is not paid")).toBeInTheDocument()
    expect(screen.queryByText("Graphic summary that must not be previewed.")).toBeNull()
    expect(screen.getByText("Content note")).toBeInTheDocument()
  })

  it("checks an agency and guides her when it is not on the list", async () => {
    renderApp("/en/agencies")
    await userEvent.type(await screen.findByLabelText("Agency name or licence number"), "Gulf Jobs Fast")
    await userEvent.click(screen.getByRole("button", { name: "Check" }))
    expect(await screen.findByText(/Do not pay any fee/)).toBeInTheDocument()
  })
})
