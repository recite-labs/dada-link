import { Layer } from "effect"
import { RepositoriesLive } from "../src/index.ts"
import { DatabaseNode } from "../src/node.ts"

/** Fresh, migrated in-memory SQLite database with every repository. */
export const makeSqliteTestLayer = () =>
  RepositoriesLive.pipe(Layer.provideMerge(DatabaseNode.layer({ filename: ":memory:" })), Layer.orDie)
