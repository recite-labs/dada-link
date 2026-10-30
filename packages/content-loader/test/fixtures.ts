import { fileURLToPath } from "node:url"

export const VALID = fileURLToPath(new URL("./fixtures/valid", import.meta.url))
export const INVALID = fileURLToPath(new URL("./fixtures/invalid", import.meta.url))
