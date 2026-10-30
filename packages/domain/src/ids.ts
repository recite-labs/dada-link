import { Schema } from "effect"

/** Lower-case alphanumeric words separated by single dashes (URL-safe path segment). */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const Slug = Schema.String.check(
  Schema.isMaxLength(120),
  Schema.isPattern(SLUG, { message: "Expected a lower-case slug such as `abroad-unpaid-wages`" })
)

export const ContentId = Slug.pipe(Schema.brand("ContentId")).annotate({ identifier: "ContentId" })
export type ContentId = typeof ContentId.Type

export const DirectoryEntryId = Slug.pipe(Schema.brand("DirectoryEntryId")).annotate({
  identifier: "DirectoryEntryId"
})
export type DirectoryEntryId = typeof DirectoryEntryId.Type

export const AgencyId = Slug.pipe(Schema.brand("AgencyId")).annotate({ identifier: "AgencyId" })
export type AgencyId = typeof AgencyId.Type

/**
 * Random UUID generated on the device. It is never linked to a person and is
 * only used (hashed) as a rate-limiting key.
 */
export const DeviceId = Schema.String.check(Schema.isUUID()).pipe(Schema.brand("DeviceId")).annotate({
  identifier: "DeviceId",
  description: "Client-generated random UUID used only for rate limiting"
})
export type DeviceId = typeof DeviceId.Type

export const TelegramChatId = Schema.Int.pipe(Schema.brand("TelegramChatId")).annotate({
  identifier: "TelegramChatId"
})
export type TelegramChatId = typeof TelegramChatId.Type
