import { PREFIX_MIN_LENGTH, searchTerms } from "@dadalink/domain"

const quote = (term: string) => `"${term.replaceAll('"', '""')}"`

/**
 * Builds an FTS5 MATCH expression that treats user input as plain terms:
 * every term is double-quoted (no operators can be injected) and longer terms
 * use prefix matching to cope with inflection. Returns `undefined` when there
 * is nothing to search for.
 */
export const toFtsMatch = (text: string): string | undefined => {
  const terms = searchTerms(text)
  if (terms.length === 0) return undefined
  return terms.map((t) => (t.length >= PREFIX_MIN_LENGTH ? `${quote(t)}*` : quote(t))).join(" OR ")
}
