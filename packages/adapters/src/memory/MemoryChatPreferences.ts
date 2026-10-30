import { type ChatPreferences, ChatPreferencesRepo } from "@dadalink/ports"
import { Effect, Layer, Option, Ref } from "effect"

export const MemoryChatPreferences = {
  layer: Layer.effect(
    ChatPreferencesRepo,
    Effect.gen(function* () {
      const store = yield* Ref.make(new Map<string, ChatPreferences>())
      return ChatPreferencesRepo.of({
        get: (hash) => Ref.get(store).pipe(Effect.map((m) => Option.fromNullishOr(m.get(hash)))),
        set: (hash, prefs) => Ref.update(store, (m) => new Map(m).set(hash, prefs))
      })
    })
  )
}
