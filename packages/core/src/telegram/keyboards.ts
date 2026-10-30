import type { Country } from "@dadalink/domain"
import { COUNTRIES, LOCALES } from "@dadalink/domain"
import type { InlineButton } from "@dadalink/ports"
import { callbackData } from "./actions.ts"
import { type BotTexts, LANGUAGE_LABELS } from "./botTexts.ts"

type Keyboard = ReadonlyArray<ReadonlyArray<InlineButton>>

const rows = <T>(items: ReadonlyArray<T>, size: number): Array<Array<T>> =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size))

export const languageKeyboard = (): Keyboard =>
  rows(
    LOCALES.map((locale) => ({ text: LANGUAGE_LABELS[locale], callbackData: callbackData.language(locale) })),
    3
  )

export const countryKeyboard = (texts: BotTexts): Keyboard =>
  rows(
    COUNTRIES.map((country: Country) => ({
      text: texts.countries[country],
      callbackData: callbackData.country(country)
    })),
    2
  )

export const menuKeyboard = (texts: BotTexts, appUrl: string): Keyboard => [
  [{ text: texts.buttons.ask, callbackData: callbackData.menu("ask") }],
  [
    { text: texts.buttons.help, callbackData: callbackData.menu("help") },
    { text: texts.buttons.rights, callbackData: callbackData.menu("rights") }
  ],
  [{ text: texts.buttons.app, url: appUrl }],
  [
    { text: texts.buttons.language, callbackData: callbackData.menu("language") },
    { text: texts.buttons.country, callbackData: callbackData.menu("country") }
  ]
]

export const helpButton = (texts: BotTexts): Keyboard => [
  [{ text: texts.buttons.help, callbackData: callbackData.menu("help") }]
]
