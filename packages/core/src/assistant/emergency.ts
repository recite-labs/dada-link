import type { EmergencyCategory, EmergencyContact, Locale } from "@dadalink/domain"
import { EMERGENCY_CATEGORIES, EmergencyNotice } from "@dadalink/domain"
import { EMERGENCY_LEXICON } from "./emergencyLexicon.ts"
import { MESSAGES } from "./messages.ts"

const LATIN = /^[\p{Script=Latin}\p{N}\s'-]+$/u

const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[’`]/g, "'").replace(/\s+/gu, " ")

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const compile = (phrase: string): ((text: string) => boolean) => {
  const normalized = normalize(phrase)
  if (!LATIN.test(normalized)) return (text) => text.includes(normalized)
  const pattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(normalized)}`, "u")
  return (text) => pattern.test(text)
}

const MATCHERS: ReadonlyArray<readonly [EmergencyCategory, ReadonlyArray<(text: string) => boolean>]> =
  EMERGENCY_CATEGORIES.map((category) => [category, EMERGENCY_LEXICON[category].map(compile)] as const)

/** Categories of immediate danger mentioned in the text (deterministic, no model involved). */
export const detectEmergency = (text: string): ReadonlyArray<EmergencyCategory> => {
  const normalized = normalize(text)
  return MATCHERS.filter(([, matchers]) => matchers.some((m) => m(normalized))).map(([category]) => category)
}

const formatNumbers = (contacts: ReadonlyArray<EmergencyContact>) =>
  contacts.map((c) => `${c.name} ${c.phone}`).join(" · ")

/** Localised first line pointing to SOS and the local numbers from the directory. */
export const buildEmergencyNotice = (
  categories: ReadonlyArray<EmergencyCategory>,
  contacts: ReadonlyArray<EmergencyContact>,
  locale: Locale
): EmergencyNotice => {
  const messages = MESSAGES[locale]
  const lead =
    contacts.length > 0
      ? messages.emergencyWithNumbers.replace("{numbers}", formatNumbers(contacts))
      : messages.emergencyGeneric
  const message = categories.includes("suicidal") ? `${messages.notAlone} ${lead}` : lead
  return new EmergencyNotice({ categories, message, contacts })
}
