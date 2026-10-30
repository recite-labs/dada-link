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
