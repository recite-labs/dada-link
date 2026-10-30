import { Agency } from "@dadalink/domain"
import { AgencyRepo } from "@dadalink/ports"
import { asc, eq, sql } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { Database } from "../Database.ts"
import { decodeRow, persistence, withoutNulls } from "../persistence.ts"
import { agencies } from "../schema/index.ts"

type AgencyRow = typeof agencies.$inferSelect

/** Escapes LIKE wildcards so user input only matches literally. */
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`)

export const AgencyRepoDrizzle = Layer.effect(
  AgencyRepo,
  Effect.gen(function* () {
    const db = yield* Database
    const decode = decodeRow(Agency, "AgencyRepo.decode")
    const toDomain = (rows: ReadonlyArray<AgencyRow>) =>
      Effect.forEach(rows, ({ nameNormalized: _, licenceNormalized: __, ...row }) =>
        decode({ ...withoutNulls(row), licenceNumber: row.licenceNumber })
      )

    const findByLicence = Effect.fn("AgencyRepo.findByLicence")((normalizedLicence: string) =>
      db
        .select()
        .from(agencies)
        .where(eq(agencies.licenceNormalized, normalizedLicence))
        .orderBy(asc(agencies.id))
        .pipe(Effect.flatMap(toDomain), persistence("AgencyRepo.findByLicence"))
    )

    const searchByName = Effect.fn("AgencyRepo.searchByName")((normalizedName: string, limit: number) =>
      db
        .select()
        .from(agencies)
        .where(sql`${agencies.nameNormalized} LIKE ${`%${escapeLike(normalizedName)}%`} ESCAPE '\\'`)
        .orderBy(asc(agencies.nameNormalized))
        .limit(limit)
        .pipe(Effect.flatMap(toDomain), persistence("AgencyRepo.searchByName"))
    )

    return AgencyRepo.of({ findByLicence, searchByName })
  })
)
