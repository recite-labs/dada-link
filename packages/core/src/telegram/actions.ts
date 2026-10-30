import type { Country, Locale } from "@dadalink/domain"
import { Country as CountrySchema, Locale as LocaleSchema } from "@dadalink/domain"
import { Schema } from "effect"

export const MENU_ITEMS = ["ask", "help", "rights", "language", "country", "sos"] as const
export type MenuItem = (typeof MENU_ITEMS)[number]

/** What the user asked the bot to do, from a command or a button. */
export type BotAction =
  | { readonly _tag: "Start" }
  | { readonly _tag: "SetLanguage"; readonly locale: Locale }
  | { readonly _tag: "SetCountry"; readonly country: Country }
  | { readonly _tag: "Menu"; readonly item: MenuItem | "main" }
  | { readonly _tag: "Question"; readonly text: string }

const isLocale = Schema.is(LocaleSchema)
const isCountry = Schema.is(CountrySchema)
const isMenuItem = (value: string): value is MenuItem => (MENU_ITEMS as ReadonlyArray<string>).includes(value)

/** Callback data is at most 64 bytes in Telegram; ours are short `kind:value` pairs. */
export const callbackData = {
  language: (locale: Locale) => `lang:${locale}`,
  country: (country: Country) => `country:${country}`,
  menu: (item: MenuItem) => `menu:${item}`
}

export const parseCallbackData = (data: string): BotAction | undefined => {
  const [kind, value = ""] = data.split(":", 2)
  if (kind === "lang" && isLocale(value)) return { _tag: "SetLanguage", locale: value }
  if (kind === "country" && isCountry(value)) return { _tag: "SetCountry", country: value }
  if (kind === "menu" && isMenuItem(value)) return { _tag: "Menu", item: value }
  return undefined
}

const COMMANDS: Readonly<Record<string, BotAction>> = {
  start: { _tag: "Start" },
  menu: { _tag: "Menu", item: "main" },
  ask: { _tag: "Menu", item: "ask" },
  help: { _tag: "Menu", item: "help" },
  rights: { _tag: "Menu", item: "rights" },
  language: { _tag: "Menu", item: "language" },
  country: { _tag: "Menu", item: "country" },
  sos: { _tag: "Menu", item: "sos" }
}

/** `/command[@BotName] [args]` → action; anything else is a question. Unknown commands open the menu. */
export const parseText = (text: string): BotAction | undefined => {
  const trimmed = text.trim()
  if (trimmed.length === 0) return undefined
  const command = /^\/([a-z_]+)(?:@\w+)?(?:\s|$)/i.exec(trimmed)?.[1]?.toLowerCase()
  if (command === undefined) return { _tag: "Question", text: trimmed }
  return COMMANDS[command] ?? { _tag: "Menu", item: "main" }
}

/** Maps a Telegram `language_code` (e.g. `am`, `en-US`) to a supported locale. */
export const localeFromLanguageCode = (code: string | undefined): Locale => {
  const primary = code?.split("-")[0]?.toLowerCase() ?? ""
  return isLocale(primary) ? primary : "en"
}
