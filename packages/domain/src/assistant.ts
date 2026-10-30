import { Schema } from "effect"
import { PhoneNumber, Text } from "./common.ts"
import { Country } from "./country.ts"
import { DirectoryKind } from "./directory.ts"
import { ContentId, DeviceId } from "./ids.ts"
import { JourneyPhase } from "./journey.ts"
import { Locale } from "./locale.ts"

export const MAX_QUESTION_LENGTH = 2000

/** Request payloads are plain structs: clients send JSON objects, not class instances. */
export const AskRequest = Schema.Struct({
  deviceId: DeviceId,
  locale: Locale,
  country: Schema.optionalKey(Country),
  phase: Schema.optionalKey(JourneyPhase),
  question: Text(MAX_QUESTION_LENGTH)
}).annotate({ identifier: "AskRequest" })
export type AskRequest = typeof AskRequest.Type

export class Citation extends Schema.Class<Citation>("Citation")({
  contentId: ContentId,
  title: Schema.String,
  locale: Locale
}) {}

export const EMERGENCY_CATEGORIES = ["violence", "threat-to-life", "suicidal", "medical"] as const
export const EmergencyCategory = Schema.Literals(EMERGENCY_CATEGORIES).annotate({ identifier: "EmergencyCategory" })
export type EmergencyCategory = typeof EmergencyCategory.Type

export class EmergencyContact extends Schema.Class<EmergencyContact>("EmergencyContact")({
  name: Schema.String,
  kind: DirectoryKind,
  phone: PhoneNumber
}) {}

export class EmergencyNotice extends Schema.Class<EmergencyNotice>("EmergencyNotice")({
  categories: Schema.Array(EmergencyCategory),
  /** Localised first line of the answer, pointing to SOS and local numbers. */
  message: Schema.String,
  contacts: Schema.Array(EmergencyContact)
}) {}

export class AskResponse extends Schema.Class<AskResponse>("AskResponse")({
  locale: Locale,
  answer: Schema.String,
  citations: Schema.Array(Citation),
  emergency: Schema.NullOr(EmergencyNotice),
  /** False when no reviewed content matched and a safe fallback was returned. */
  grounded: Schema.Boolean
}) {}

/** Server-sent events emitted by the streaming assistant endpoint. */
export const AssistantStreamEvent = Schema.Union([
  Schema.TaggedStruct("Emergency", { notice: EmergencyNotice }),
  Schema.TaggedStruct("Citations", { citations: Schema.Array(Citation), grounded: Schema.Boolean }),
  Schema.TaggedStruct("Delta", { text: Schema.String }),
  Schema.TaggedStruct("Done", {})
]).annotate({ identifier: "AssistantStreamEvent" })
export type AssistantStreamEvent = typeof AssistantStreamEvent.Type

/** Opt-in, content-free feedback: no question or answer text is stored. */
export const AssistantFeedback = Schema.Struct({
  helpful: Schema.Boolean,
  locale: Locale,
  contentIds: Schema.Array(ContentId).check(Schema.isMaxLength(20))
}).annotate({ identifier: "AssistantFeedback" })
export type AssistantFeedback = typeof AssistantFeedback.Type
