import { Config, Context, Effect, Layer, Redacted } from "effect"

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("")

/**
 * One-way, salted pseudonyms for identifiers we must key on (device ids for
 * rate limiting, Telegram chat ids for preferences). Raw ids are never stored.
 * Uses WebCrypto, available on Node and Cloudflare Workers.
 */
export class Pseudonymizer extends Context.Service<
  Pseudonymizer,
  {
    /** SHA-256 over `salt:namespace:value`, hex encoded. */
    hash(namespace: string, value: string): Effect.Effect<string>
  }
>()("@dadalink/core/Pseudonymizer") {
  static readonly layer = (salt: Redacted.Redacted<string>) =>
    Layer.succeed(
      Pseudonymizer,
      Pseudonymizer.of({
        hash: (namespace, value) =>
          Effect.promise(() =>
            crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${Redacted.value(salt)}:${namespace}:${value}`))
          ).pipe(Effect.map(toHex))
      })
    )

  /** Salt from `DADALINK_HASH_SALT` (secret, required). */
  static readonly layerConfig = Layer.unwrap(
    Effect.gen(function* () {
      return Pseudonymizer.layer(yield* Config.Redacted("DADALINK_HASH_SALT"))
    })
  )
}
