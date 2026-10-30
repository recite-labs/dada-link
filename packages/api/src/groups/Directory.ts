import { Country, DirectoryEntry, EmergencyContact, Locale } from "@dadalink/domain"
import { Schema } from "effect"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/http-api"

export class DirectoryApi extends HttpApiGroup.make("directory")
  .add(
    HttpApiEndpoint.get("forCountry", "/:country", {
      params: { country: Country },
      success: Schema.Array(DirectoryEntry)
    }),
    HttpApiEndpoint.get("emergency", "/:country/emergency", {
      params: { country: Country },
      query: { locale: Schema.optionalKey(Locale) },
      success: Schema.Array(EmergencyContact)
    })
  )
  .prefix("/directory")
  .annotateMerge(
    OpenApi.annotations({ title: "Help directory", description: "Per-country help and emergency numbers" })
  ) {}
