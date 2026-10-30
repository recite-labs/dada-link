import type { Agency, ContentItem } from "@dadalink/domain"
import { Effect, FileSystem, Path } from "effect"
import { crossReferenceIssues } from "./crossReferences.ts"
import { type Checked, type ContentIssue, ContentValidationFailed, error } from "./issues.ts"
import { type AgencyGuide, parseAgencyFile } from "./mappers/agencies.ts"
import { type ContentFile, parseContentFile, toContentItems } from "./mappers/content.ts"
import { type CountryDirectory, parseDirectoryFile } from "./mappers/directory.ts"
import { parseFaqFile } from "./mappers/faq.ts"

export interface LoadedContent {
  readonly items: ReadonlyArray<ContentItem>
  readonly directory: ReadonlyArray<CountryDirectory>
  readonly agencies: ReadonlyArray<Agency>
  readonly agencyGuides: ReadonlyArray<AgencyGuide>
  readonly warnings: ReadonlyArray<ContentIssue>
}

type FileKind = "content" | "directory" | "agencies" | "faq"

/** Which loader handles a path (relative, `/`-separated); `undefined` = not content (README, scripts...). */
export const classify = (path: string): FileKind | "misplaced" | undefined => {
  if (/^directory\/[^/]+\.ya?ml$/.test(path)) return "directory"
  if (/^agencies\/[^/]+\.ya?ml$/.test(path)) return "agencies"
  if (/^assistant\/faq-seed\.ya?ml$/.test(path)) return "faq"
  if (/^(rights|journey)\/.+\.md$/.test(path)) return "content"
  if (/^(directory|agencies|rights|journey)\//.test(path) && /\.(md|ya?ml)$/.test(path)) return "misplaced"
  return undefined
}

/**
 * Reads and validates a Track B content tree. All problems are collected and
 * reported together; warnings are returned with the result.
 */
export const loadContent = Effect.fn("loadContent")(function* (root: string) {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path
  const files = (yield* fs.readDirectory(root, { recursive: true })).map((p) => p.split(path.sep).join("/")).toSorted()

  const issues: Array<ContentIssue> = []
  const collect = <A>(checked: Checked<A>): A | undefined => {
    issues.push(...checked.issues)
    return checked.value
  }

  const contentFiles: Array<ContentFile> = []
  const directory: Array<CountryDirectory> = []
  const agencies: Array<Agency> = []
  const agencyGuides: Array<AgencyGuide> = []
  const faqItems: Array<ContentItem> = []

  for (const file of files) {
    const kind = classify(file)
    if (kind === undefined) continue
    if (kind === "misplaced") {
      issues.push(error(file, "File is not in a recognised place (see docs/content-format.md)"))
      continue
    }
    const text = yield* fs.readFileString(path.join(root, file))
    switch (kind) {
      case "content": {
        const parsed = collect(parseContentFile(file, text))
        if (parsed !== undefined) contentFiles.push(parsed)
        break
      }
      case "directory": {
        const parsed = collect(parseDirectoryFile(file, text))
        if (parsed !== undefined) directory.push(parsed)
        break
      }
      case "agencies": {
        const parsed = collect(parseAgencyFile(file, text))
        if (parsed !== undefined) {
          agencies.push(...parsed.agencies)
          agencyGuides.push(parsed.guide)
        }
        break
      }
      case "faq":
        faqItems.push(...(collect(parseFaqFile(file, text)) ?? []))
        break
    }
  }

  const articles = collect(toContentItems(contentFiles)) ?? []
  const items = [...articles, ...faqItems]
  const sourceFile = new Map<string, string>(contentFiles.map((f) => [f.frontMatter.id, f.path]))
  issues.push(...crossReferenceIssues(items, (item) => sourceFile.get(item.id) ?? "assistant/faq-seed.yaml"))
  issues.push(...duplicateIdIssues(directory))

  if (issues.some((i) => i.severity === "error")) return yield* new ContentValidationFailed({ issues })
  return {
    items,
    directory,
    agencies,
    agencyGuides,
    warnings: issues
  } satisfies LoadedContent
})

const duplicateIdIssues = (directory: ReadonlyArray<CountryDirectory>): ReadonlyArray<ContentIssue> => {
  const seen = new Set<string>()
  const issues: Array<ContentIssue> = []
  for (const { country, entries } of directory) {
    for (const entry of entries) {
      if (seen.has(entry.id)) issues.push(error(`directory/${country.toLowerCase()}.yaml`, `duplicate id ${entry.id}`))
      seen.add(entry.id)
    }
  }
  return issues
}
