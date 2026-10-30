import { Schema } from "effect"
import { HttpUrl, IsoDate, PhoneNumber, Text } from "./common.ts"
import { AgencyId } from "./ids.ts"

export const AGENCY_STATUSES = ["licensed", "suspended", "revoked", "unknown"] as const
export const AgencyStatus = Schema.Literals(AGENCY_STATUSES).annotate({ identifier: "AgencyStatus" })
export type AgencyStatus = typeof AgencyStatus.Type

export class Agency extends Schema.Class<Agency>("Agency")({
  id: AgencyId,
  name: Text(300),
  licenceNumber: Schema.NullOr(Text(80)),
  status: AgencyStatus,
  region: Schema.optionalKey(Text(120)),
  phone: Schema.optionalKey(PhoneNumber),
  address: Schema.optionalKey(Text(500)),
  sourceUrl: HttpUrl,
  verifiedAt: Schema.optionalKey(IsoDate)
}) {}

/**
 * Outcome of an agency check, from the point of view of the woman asking.
 * `not-found` must never be presented as "illegal": the list may be incomplete.
 */
export const AgencyVerdict = Schema.Literals(["licensed", "suspended", "revoked", "unknown", "not-found"]).annotate({
  identifier: "AgencyVerdict"
})
export type AgencyVerdict = typeof AgencyVerdict.Type

export class AgencyCheck extends Schema.Class<AgencyCheck>("AgencyCheck")({
  query: Schema.String,
  verdict: AgencyVerdict,
  matches: Schema.Array(Agency)
}) {}

const LEGAL_SUFFIXES = new Set(["plc", "llc", "ltd", "limited", "sc", "pvt", "co", "inc"])

/**
 * Normalises an agency name for matching: Unicode NFKC, lower case, drops
 * punctuation (keeping letters of every script, digits and spaces), collapses
 * whitespace and strips trailing legal-form suffixes such as "PLC".
 */
export const normalizeAgencyName = (name: string): string => {
  const words = name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, "")
    .split(/\s+/u)
    .filter((w) => w.length > 0)
  while (words.length > 1 && LEGAL_SUFFIXES.has(words[words.length - 1] ?? "")) {
    words.pop()
  }
  return words.join(" ")
}

/** Normalises a licence number to upper-case ASCII letters and digits. */
export const normalizeLicence = (licence: string): string =>
  licence
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
