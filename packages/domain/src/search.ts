import { AMHARIC_PROCLITICS, SEARCH_SYNONYMS } from "./searchSynonyms.ts"

/** Maximum number of distinct terms considered per query. */
export const MAX_SEARCH_TERMS = 24

/**
 * Splits free text into searchable terms: Unicode letters/marks/digits only,
 * NFKC-normalised, lower-cased, at least two characters, de-duplicated.
 * Works for Latin and Ethiopic scripts.
 */
export const searchTerms = (text: string): ReadonlyArray<string> => {
  const matches =
    text
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  return [...new Set(matches.filter((t) => t.length >= 2))].slice(0, MAX_SEARCH_TERMS)
}

/** Terms of this length or more match as prefixes (cheap inflection handling). */
export const PREFIX_MIN_LENGTH = 3

/** Upper bound on terms after synonym expansion (keeps FTS queries small). */
export const MAX_EXPANDED_TERMS = 64

const stemsOf = (term: string): ReadonlyArray<string> => [
  term,
  ...AMHARIC_PROCLITICS.filter((p) => term.length > p.length && term.startsWith(p)).map((p) => term.slice(p.length))
]

/**
 * Adds synonym stems (see `SEARCH_SYNONYMS`) for every term that starts with
 * a stem of a group, optionally after an Amharic prepositional prefix. The
 * original terms come first, in order; the result is de-duplicated and capped.
 */
export const expandSearchTerms = (terms: ReadonlyArray<string>): ReadonlyArray<string> => {
  const out = new Set(terms)
  for (const term of terms) {
    const forms = stemsOf(term)
    for (const group of SEARCH_SYNONYMS) {
      if (group.some((stem) => forms.some((form) => form.startsWith(stem)))) {
        for (const stem of group) out.add(stem)
      }
    }
  }
  return [...out].slice(0, MAX_EXPANDED_TERMS)
}

/** `searchTerms` followed by `expandSearchTerms`: what retrievers search for. */
export const queryTerms = (text: string): ReadonlyArray<string> => expandSearchTerms(searchTerms(text))
