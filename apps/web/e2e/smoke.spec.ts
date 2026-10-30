import { expect, type Page, test } from "@playwright/test"

const SHOTS = process.env.DADALINK_SHOTS_DIR

/** Full-page capture, except for overlays (a fixed sheet only covers the viewport). */
const shot = async (page: Page, name: string, projectName: string, fullPage = true) => {
  if (SHOTS === undefined) return
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${SHOTS}/${projectName}-${name}.png`, fullPage })
}

/** Fails the test if the page makes any request to another origin (privacy promise). */
const forbidThirdParty = (page: Page, baseURL: string | undefined) => {
  const origin = new URL(baseURL ?? "http://localhost:5173").origin
  const foreign: Array<string> = []
  page.on("request", (request) => {
    const url = new URL(request.url())
    if (url.protocol.startsWith("http") && url.origin !== origin) foreign.push(request.url())
  })
  return foreign
}

const LOCALES = [
  { locale: "am", greeting: /ሰላም እህቴ/, help: "የእርዳታ ስልኮች" },
  { locale: "om", greeting: /Akkam, obboleettii/, help: "Lakkoofsota gargaarsaa" },
  { locale: "en", greeting: /Selam, sister/, help: "Help numbers" }
] as const

for (const { locale, greeting, help } of LOCALES) {
  test(`click-through in ${locale}`, async ({ page, baseURL }, info) => {
    const foreign = forbidThirdParty(page, baseURL)
    const name = (step: string) => `${locale}-${step}`

    await page.goto(`/${locale}`)
    await expect(page.getByRole("heading", { level: 1 })).toContainText(greeting)
    await shot(page, name("1-home"), info.project.name)

    // SOS sheet with the selected country's emergency numbers
    await page.getByRole("button", { name: "SOS" }).first().click()
    await expect(page.getByRole("dialog").locator('a[href="tel:911"]')).toBeVisible()
    await shot(page, name("2-sos"), info.project.name, false)
    await page.keyboard.press("Escape")

    // Ask Dada (fake model): emergency notice, streamed answer, sources
    await page.goto(`/${locale}/ask`)
    await page.getByRole("textbox").fill(locale === "en" ? "My employer hits me and took my passport" : "passport")
    await page.keyboard.press("Enter")
    await expect(page.locator("article[aria-busy=false]").first()).toBeVisible()
    await shot(page, name("3-ask"), info.project.name)

    // Help directory
    await page.goto(`/${locale}/help/SA`)
    await expect(page.getByRole("heading", { level: 1, name: help })).toBeVisible()
    await expect(page.locator('a[href="tel:911"]').first()).toBeVisible()
    await shot(page, name("4-help"), info.project.name)

    // Rights
    await page.goto(`/${locale}/rights/SA`)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await shot(page, name("5-rights"), info.project.name)

    // Agency check (empty official list: not-found guidance)
    await page.goto(`/${locale}/agencies`)
    await page.getByRole("textbox").fill("Gulf Jobs Fast")
    await page.getByRole("search").getByRole("button").click()
    await expect(page.getByRole("status").filter({ hasText: "Gulf Jobs Fast" })).toBeVisible()
    await shot(page, name("6-agencies"), info.project.name)

    expect(foreign).toEqual([])
  })
}

test("sensitive article, journey list and 404", async ({ page }, info) => {
  await page.goto("/en/journey/abroad")
  await expect(page.getByRole("heading", { level: 1, name: "While you are abroad" })).toBeVisible()
  await shot(page, "en-7-journey", info.project.name)

  await page.goto("/en/articles/sexual-violence-what-to-do")
  await expect(page.getByText("Content note")).toBeVisible()
  await shot(page, "en-8-sensitive-article", info.project.name)

  await page.goto("/am/about")
  await shot(page, "am-9-about", info.project.name)

  await page.goto("/en/nowhere")
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible()
  await shot(page, "en-10-404", info.project.name)
})
