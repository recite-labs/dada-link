import { Schema } from "effect"
import { AgencyStatus } from "../agency.ts"
import { HttpUrl, IsoDate, PhoneNumber, Text } from "../common.ts"
import { Country } from "../country.ts"
import { AgencyId } from "../ids.ts"
import { FileSource, Nullable, Todo } from "./common.ts"

/** One agency of `agencies/<country>.yaml`. Licence numbers are never invented. */
export const AgencyFileEntry = Schema.Struct({
  id: AgencyId,
  name: Text(300),
  licence_number: Nullable(Text(80)),
  licence_status: AgencyStatus,
  city: Nullable(Text(120)),
  address: Nullable(Text(500)),
  phone: Nullable(PhoneNumber),
  source_url: HttpUrl,
  verified: Schema.Boolean,
  todo: Schema.optionalKey(Todo)
}).annotate({ identifier: "AgencyFileEntry" })
export type AgencyFileEntry = typeof AgencyFileEntry.Type

/** `agencies/<country>.yaml`: the official list plus how to obtain and check it. */
export const AgencyFile = Schema.Struct({
  country: Country,
  authority: Schema.Struct({ name: Text(300), website: Nullable(HttpUrl) }),
  how_to_obtain: Schema.optionalKey(Schema.String),
  how_to_check_for_users: Schema.optionalKey(Schema.String),
  last_checked: Schema.optionalKey(IsoDate),
  sources: Schema.optionalKey(Schema.Array(FileSource)),
  todo: Schema.optionalKey(Todo),
  agencies: Schema.Array(AgencyFileEntry)
}).annotate({ identifier: "AgencyFile" })
export type AgencyFile = typeof AgencyFile.Type
