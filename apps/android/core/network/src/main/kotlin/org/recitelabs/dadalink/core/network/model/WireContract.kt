/*
 * Wire models for the DadaLink HTTP API.
 *
 * Source of truth: packages/api/openapi.json (emitted from the Effect HttpApi in packages/api).
 * Every DTO here is named after its OpenAPI schema (`FooEncoded` -> `FooDto`) and mirrors it
 * field for field:
 *  - required, non-null            -> constructor parameter without default
 *  - required, `anyOf [.., null]`  -> nullable parameter without default (the key is always sent)
 *  - optional (`optionalKey`)      -> nullable parameter `= null` (omitted on encode: explicitNulls = false)
 *  - optional array                -> `List<..> = emptyList()`
 *  - `_tag` discriminators         -> String with the constant literal as default
 * Enum-typed fields (Locale, Country, Topic, DirectoryKind, ...) are kept as String so that a new
 * backend literal never breaks decoding; the data layer maps them to core:model types.
 *
 * OpenApiContractTest parses openapi.json and fails when a schema and its DTO drift apart
 * (missing/extra fields, required-ness, nullability) or when a route the client calls disappears.
 * Update the DTO by hand when it fails: the spec is small, and a hand-written mirror guarded by
 * that test is cheaper to maintain than a generator in the build.
 */
package org.recitelabs.dadalink.core.network.model
