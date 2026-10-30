import { ContentFiles, type Country, DirectoryEntry } from "@dadalink/domain"
import { decodeWith, parseYaml } from "../decode.ts"
import { type Checked, type ContentIssue, error, failed, ok } from "../issues.ts"

export interface CountryDirectory {
  readonly country: Country
  readonly entries: ReadonlyArray<DirectoryEntry>
}

/** Kinds whose numbers appear in the assistant's emergency line. */
const EMERGENCY_KINDS = new Set(["emergency", "police", "ambulance"])

const decodeFile = decodeWith(ContentFiles.DirectoryFile)
const decodeEntry = decodeWith(DirectoryEntry)

const optional = <K extends string, V>(key: K, value: V | null | undefined) =>
  (value === null || value === undefined ? {} : { [key]: value }) as Partial<Record<K, V>>

export const toDirectoryEntry = (path: string, entry: ContentFiles.DirectoryFileEntry): Checked<DirectoryEntry> => {
  const { en, ...names } = entry.name
  return decodeEntry(path, {
    id: entry.id,
    country: entry.country,
    kind: entry.kind,
    name: en,
    names,
    phone: entry.phone ?? null,
    shortCode: entry.short_code ?? null,
    ...optional("whatsapp", entry.whatsapp),
    ...optional("telegram", entry.telegram),
    ...optional("email", entry.email),
    ...optional("url", entry.website),
    ...optional("city", entry.city),
    ...optional("address", entry.address),
    ...optional("hours", entry.hours),
    ...optional("notes", entry.notes),
    helpsWith: entry.helps_with,
    languages: entry.languages ?? [],
    emergency: EMERGENCY_KINDS.has(entry.kind),
    sourceUrl: entry.source_url,
    verified: entry.verified
  })
}

const DIRECTORY_PATH = /^directory\/([a-z]{2})\.ya?ml$/

/** `directory/<cc>.yaml` → entries in file order. */
export const parseDirectoryFile = (path: string, text: string): Checked<CountryDirectory> => {
  const yaml = parseYaml(path, text)
  if (yaml.value === undefined) return failed(yaml.issues)
  const file = decodeFile(path, yaml.value)
  if (file.value === undefined) return failed(file.issues)
  const { country, entries } = file.value
  const issues: Array<ContentIssue> = []
  if (DIRECTORY_PATH.exec(path)?.[1] !== country.toLowerCase()) {
    issues.push(error(path, `country ${country} does not match the file name`))
  }
  const mapped: Array<DirectoryEntry> = []
  for (const entry of entries) {
    if (entry.country !== country)
      issues.push(error(path, `entry ${entry.id} has country ${entry.country}, expected ${country}`))
    if (!entry.id.startsWith(`${country.toLowerCase()}-`)) {
      issues.push(error(path, `entry id ${entry.id} must start with ${country.toLowerCase()}-`))
    }
    const decoded = toDirectoryEntry(path, entry)
    issues.push(...decoded.issues)
    if (decoded.value !== undefined) mapped.push(decoded.value)
  }
  return issues.some((i) => i.severity === "error") ? failed(issues) : ok({ country, entries: mapped }, issues)
}
