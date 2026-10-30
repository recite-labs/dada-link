import { Schema } from "effect"

/** Text that is trimmed on decode, then required to be non-empty and bounded. */
export const Text = (maxLength: number) => Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(maxLength))

/** Absolute http(s) URL kept as a string (stable JSON representation). */
export const HttpUrl = Schema.String.check(
  Schema.isPattern(/^https?:\/\/[^\s]+$/, { message: "Expected an http(s) URL" })
).annotate({ identifier: "HttpUrl" })
export type HttpUrl = typeof HttpUrl.Type

/** ISO-8601 calendar date `YYYY-MM-DD`. */
export const IsoDate = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { message: "Expected a date formatted as YYYY-MM-DD" })
).annotate({ identifier: "IsoDate" })
export type IsoDate = typeof IsoDate.Type

/**
 * Dialable phone number as published: short codes (`911`) or international
 * numbers with optional spaces/dashes (`+966 11 482 3919`).
 */
export const PhoneNumber = Schema.String.check(
  Schema.isPattern(/^\+?[0-9][0-9 -]{1,22}[0-9]$/, { message: "Expected a dialable phone number" })
).annotate({ identifier: "PhoneNumber" })
export type PhoneNumber = typeof PhoneNumber.Type

/** Strict E.164 number, used where we send SMS. */
export const E164PhoneNumber = Schema.String.check(
  Schema.isPattern(/^\+[1-9][0-9]{6,14}$/, { message: "Expected an international number such as +251911000000" })
).annotate({ identifier: "E164PhoneNumber" })
export type E164PhoneNumber = typeof E164PhoneNumber.Type

/** Local short code dialled inside a country: 2 to 8 digits (`911`, `999`, `8007283`). */
export const ShortCode = Schema.String.check(
  Schema.isPattern(/^\d{2,8}$/, { message: "Expected a short code of 2 to 8 digits" })
).annotate({ identifier: "ShortCode" })
export type ShortCode = typeof ShortCode.Type
