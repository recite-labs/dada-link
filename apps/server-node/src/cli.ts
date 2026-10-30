import { resolve } from "node:path"
import {
  type ImportSummary,
  importContent,
  type LoadedContent,
  loadContent,
  summarizeContent
} from "@dadalink/content-loader"
import { catalogSeedSql } from "@dadalink/db"
import { DatabaseNode } from "@dadalink/db/node"
import { NodeRuntime, NodeServices } from "@effect/platform-node"
import { Console, Effect, FileSystem } from "effect"
import { Argument, Command, Flag } from "effect/cli"
import { PersistenceLive } from "./AppLayer.ts"

const contentDir = Argument.String("content-dir").pipe(
  Argument.withDescription("Path to the content/ folder (Track B layout, see docs/content-format.md)")
)

const report = (loaded: LoadedContent, summary: ImportSummary) =>
  Effect.gen(function* () {
    yield* Console.log(
      `content items: ${summary.contentItems} (${summary.translations} translations), directory entries: ${summary.directoryEntries} in ${summary.countries} countries, agencies: ${summary.agencies}`
    )
    for (const w of loaded.warnings) yield* Console.log(`warning ${w.file}: ${w.message}`)
  })

const validate = Command.make(
  "validate",
  { dir: contentDir },
  Effect.fn(function* ({ dir }) {
    const loaded = yield* loadContent(resolve(dir))
    yield* report(loaded, summarizeContent(loaded))
    yield* Console.log("ok")
  })
).pipe(Command.withDescription("Validate the content tree against the domain schemas"))

const seed = Command.make(
  "seed",
  {
    dir: contentDir,
    db: Flag.String("db").pipe(
      Flag.withDescription("SQLite database file (created and migrated if missing)"),
      Flag.withDefault("./data/dadalink.db")
    )
  },
  Effect.fn(function* ({ dir, db }) {
    const loaded = yield* loadContent(resolve(dir))
    const summary = yield* importContent(loaded).pipe(Effect.provide(PersistenceLive(resolve(db))))
    yield* report(loaded, summary)
    yield* Console.log(`seeded ${resolve(db)}`)
  })
).pipe(Command.withDescription("Validate and import the content into the self-hosted SQLite database"))

const emitSql = Command.make(
  "emit-sql",
  {
    dir: contentDir,
    out: Flag.String("out").pipe(Flag.withDescription("Where to write the SQL script"))
  },
  Effect.fn(function* ({ dir, out }) {
    const loaded = yield* loadContent(resolve(dir))
    const script = yield* catalogSeedSql(loaded).pipe(
      Effect.provide(DatabaseNode.layer({ filename: ":memory:", migrate: false }))
    )
    yield* (yield* FileSystem.FileSystem).writeFileString(resolve(out), script)
    yield* report(loaded, summarizeContent(loaded))
    yield* Console.log(`wrote ${resolve(out)} (apply with: wrangler d1 execute DB --local --file <it>)`)
  })
).pipe(Command.withDescription("Write a SQL script that seeds D1 with the content"))

Command.make("dadalink-content").pipe(
  Command.withDescription("DadaLink content tools"),
  Command.withSubcommands([validate, seed, emitSql]),
  Command.run({ version: "0.1.0" }),
  Effect.provide(NodeServices.layer),
  NodeRuntime.runMain
)
