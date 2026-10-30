import { ContentFiles, type ContentId, ContentItem, type Topic } from "@dadalink/domain"
import { decodeWith, parseYaml } from "../decode.ts"
import { splitFrontMatter } from "../frontMatter.ts"
import { type Checked, type ContentIssue, error, failed, ok } from "../issues.ts"

export interface ContentFile {
  readonly path: string
  readonly frontMatter: ContentFiles.ContentFrontMatter
  readonly body: string
}

const RIGHTS_PATH = /^rights\/([a-z]{2})\.([a-z]{2})\.md$/
const JOURNEY_PATH = /^journey\/([^/]+)\/([^/]+)\.([a-z]{2})\.md$/

const decodeFrontMatter = decodeWith(ContentFiles.ContentFrontMatter)

/** Checks that the file name agrees with the front matter (Track B naming rules). */
const pathIssues = (path: string, fm: ContentFiles.ContentFrontMatter): ReadonlyArray<ContentIssue> => {
  const issues: Array<ContentIssue> = []
  if (fm.type === "rights") {
    const [, cc, locale] = RIGHTS_PATH.exec(path) ?? []
    if (cc === undefined) return [error(path, "Rights files must be named rights/<cc>.<locale>.md")]
    if (cc !== fm.country.toLowerCase()) issues.push(error(path, `country ${fm.country} does not match the file name`))
    if (locale !== fm.locale) issues.push(error(path, `locale ${fm.locale} does not match the file name`))
    if (fm.id !== `rights-${cc}`) issues.push(error(path, `id must be rights-${cc}`))
  } else {
    const [, phase, slug, locale] = JOURNEY_PATH.exec(path) ?? []
    if (phase === undefined) return [error(path, "Journey files must be named journey/<phase>/<slug>.<locale>.md")]
    if (phase !== fm.phase) issues.push(error(path, `phase ${fm.phase} does not match the folder ${phase}`))
    if (locale !== fm.locale) issues.push(error(path, `locale ${fm.locale} does not match the file name`))
    if (slug !== fm.id) issues.push(error(path, `id ${fm.id} does not match the file name ${slug}`))
  }
  return issues
}

/** Parses one Markdown content file (front matter + body). */
export const parseContentFile = (path: string, text: string): Checked<ContentFile> => {
  const document = splitFrontMatter(text)
  if (document === undefined) return failed([error(path, "Missing YAML front matter (--- ... ---)")])
  const yaml = parseYaml(path, document.frontMatter)
  if (yaml.value === undefined) return failed(yaml.issues)
  const decoded = decodeFrontMatter(path, yaml.value)
  if (decoded.value === undefined) return failed(decoded.issues)
  const issues = pathIssues(path, decoded.value)
  if (document.body.length === 0) return failed([...issues, error(path, "The Markdown body is empty")])
  return issues.length > 0 ? failed(issues) : ok({ path, frontMatter: decoded.value, body: document.body })
}

const decodeItem = decodeWith(ContentItem)

const topicsFor = (fm: ContentFiles.ContentFrontMatter): ReadonlyArray<Topic> =>
  fm.type === "rights" ? ["rights", "legal"] : (fm.tags ?? [])

/**
 * Groups per-locale files into multilingual items. The English file is the
 * source of metadata (kind, phase, countries, tags, sources, related).
 */
export const toContentItems = (files: ReadonlyArray<ContentFile>): Checked<ReadonlyArray<ContentItem>> => {
  const byId = new Map<string, Array<ContentFile>>()
  for (const file of files) byId.set(file.frontMatter.id, [...(byId.get(file.frontMatter.id) ?? []), file])

  const issues: Array<ContentIssue> = []
  const items: Array<ContentItem> = []
  for (const [id, group] of byId) {
    const source = group.find((f) => f.frontMatter.locale === "en")
    if (source === undefined) {
      for (const f of group) issues.push(error(f.path, `No English source file for ${id}`))
      continue
    }
    const duplicates = group.filter(
      (f, i) => group.findIndex((g) => g.frontMatter.locale === f.frontMatter.locale) !== i
    )
    for (const d of duplicates) issues.push(error(d.path, `Duplicate ${d.frontMatter.locale} file for ${id}`))
    for (const f of group) {
      if (f.frontMatter.type !== source.frontMatter.type) issues.push(error(f.path, `type differs from ${source.path}`))
    }
    const fm = source.frontMatter
    if ((fm.sources ?? []).length === 0) issues.push(error(source.path, "English files need at least one source"))
    const item = decodeItem(source.path, {
      id: fm.id,
      kind: fm.type === "rights" ? "rights" : "article",
      phase: fm.type === "rights" ? (fm.country === "ET" ? null : "abroad") : fm.phase,
      countries: fm.type === "rights" ? [fm.country] : fm.countries,
      topics: topicsFor(fm),
      sources: (fm.sources ?? []).map(({ note: _, ...s }) => s),
      translations: group
        .filter((f) => !duplicates.includes(f))
        .map((f) => ({
          locale: f.frontMatter.locale,
          status: f.frontMatter.status,
          title: f.frontMatter.title,
          summary: f.frontMatter.summary,
          body: f.body
        })),
      sensitive: fm.type === "journey" ? (fm.sensitive ?? false) : false,
      related: fm.type === "journey" ? (fm.related ?? []) : [],
      ...(fm.updated === undefined ? {} : { updated: fm.updated })
    })
    issues.push(...item.issues)
    if (item.value !== undefined) items.push(item.value)
  }
  return ok(items, issues)
}

/** Ids every content item may reference. */
export const contentIds = (items: ReadonlyArray<ContentItem>): ReadonlySet<ContentId> => new Set(items.map((i) => i.id))
