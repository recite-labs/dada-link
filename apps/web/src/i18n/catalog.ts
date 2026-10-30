import type { UiLocale } from "./locales.ts"
import { am } from "./messages/am.ts"
import { en, type Messages } from "./messages/en.ts"
import { om } from "./messages/om.ts"

export type { Messages }

/** Every UI locale has a complete catalogue (checked by the `Messages` type). */
export const CATALOG: Readonly<Record<UiLocale, Messages>> = { am, om, en }

export const messagesFor = (locale: UiLocale): Messages => CATALOG[locale]
