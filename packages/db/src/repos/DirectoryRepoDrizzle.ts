import type { Country } from "@dadalink/domain"
import { DirectoryEntry } from "@dadalink/domain"
import { DirectoryRepo } from "@dadalink/ports"
import { asc, eq } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { Database } from "../Database.ts"
import { decodeRow, persistence, withoutNulls } from "../persistence.ts"
import { directoryEntries } from "../schema/index.ts"

export const DirectoryRepoDrizzle = Layer.effect(
  DirectoryRepo,
  Effect.gen(function* () {
    const db = yield* Database
    const decode = decodeRow(DirectoryEntry, "DirectoryRepo.decode")

    const listByCountry = Effect.fn("DirectoryRepo.listByCountry")((country: Country) =>
      db
        .select()
        .from(directoryEntries)
        .where(eq(directoryEntries.country, country))
        .orderBy(asc(directoryEntries.position))
        .pipe(
          Effect.flatMap((rows) =>
            Effect.forEach(rows, ({ position: _, ...row }) => decode({ ...withoutNulls(row), phone: row.phone }))
          ),
          persistence("DirectoryRepo.listByCountry")
        )
    )

    return DirectoryRepo.of({ listByCountry })
  })
)
