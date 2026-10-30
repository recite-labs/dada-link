/** Maximum number of distinct terms sent to FTS5 (keeps queries cheap). */
const MAX_TERMS = 24

/**
 * Splits free text into searchable terms: Unicode letters/marks/digits only,
 * lower-cased, de-duplicated. Works for Latin and Ethiopic scripts.
 */
export const tokenize = (text: string): ReadonlyArray<string> => {
  const matches =
    text
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  return [...new Set(matches.filter((t) => t.length >= 2))].slice(0, MAX_TERMS)
}

/**
 * Builds an FTS5 MATCH expression that treats user input as plain terms:
 * every term is double-quoted (no operators can be injected) and terms of
 * three or more characters use prefix matching to cope with inflection.
 * Returns `undefined` when there is nothing to search for.
 */
export const toFtsMatch = (text: string): string | undefined => {
  const terms = tokenize(text)
  if (terms.length === 0) return undefined
  return terms
    .map((t) => (t.length >= 3 ? `"${t.replaceAll('"', '""')}"*` : `"${t.replaceAll('"', '""')}"`))
    .join(" OR ")
}
