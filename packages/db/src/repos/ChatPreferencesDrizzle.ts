import { type ChatPreferences, ChatPreferencesRepo } from "@dadalink/ports"
import { eq } from "drizzle-orm"
import { Clock, Effect, Layer, Option } from "effect"
import { Database } from "../Database.ts"
import { persistence } from "../persistence.ts"
import { chatPreferences } from "../schema/index.ts"

export const ChatPreferencesDrizzle = Layer.effect(
  ChatPreferencesRepo,
  Effect.gen(function* () {
    const db = yield* Database

    const get = Effect.fn("ChatPreferencesRepo.get")((chatHash: string) =>
      db
        .select({ locale: chatPreferences.locale, country: chatPreferences.country })
        .from(chatPreferences)
        .where(eq(chatPreferences.chatHash, chatHash))
        .pipe(
          Effect.map(([row]) =>
            Option.fromNullishOr(row).pipe(
              Option.map(
                (r): ChatPreferences =>
                  r.country === null ? { locale: r.locale } : { locale: r.locale, country: r.country }
              )
            )
          ),
          persistence("ChatPreferencesRepo.get")
        )
    )

    const set = Effect.fn("ChatPreferencesRepo.set")((chatHash: string, preferences: ChatPreferences) =>
      Effect.gen(function* () {
        const now = yield* Clock.currentTimeMillis
        const values = { locale: preferences.locale, country: preferences.country ?? null, updatedAtMs: now }
        yield* db
          .insert(chatPreferences)
          .values({ chatHash, ...values })
          .onConflictDoUpdate({ target: chatPreferences.chatHash, set: values })
      }).pipe(persistence("ChatPreferencesRepo.set"))
    )

    return ChatPreferencesRepo.of({ get, set })
  })
)
