#!/usr/bin/env node
// Builds the Android offline content bundle from the reviewed content tree.
//
//   node content/scripts/build-android-bundle.mjs            write the bundle
//   node content/scripts/build-android-bundle.mjs --check    fail if the bundle is out of date
//
// Output: apps/android/core/content/src/main/assets/content/bundle.json, in the shape of
// apps/android/core/content/src/main/kotlin/org/recitelabs/dadalink/core/content/ContentBundle.kt.
// Grouping and categories mirror the app's SyncedContentMapper so the offline bundle and synced
// content look the same. Output is deterministic: no wall-clock time, stable ordering.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { parseFrontMatter, parseYaml } from "./validate.mjs"

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), "..")
const ROOT = join(CONTENT, "..")
const OUT = join(ROOT, "apps/android/core/content/src/main/assets/content/bundle.json")

const BUNDLE_VERSION = 2
// Countries the app's Country enum supports, in its order.
const COUNTRIES = ["SA", "AE", "KW", "QA", "LB", "JO", "ET"]
// Locale order inside localized maps (English first: it is the fallback).
const LOCALE_ORDER = ["en", "am", "om", "sw", "ti"]
const PHASES = ["before", "abroad", "return"]
const HEALTH_TOPICS = new Set(["health", "srh", "mental-health"])

// Directory kind -> HelpContactKind (same table as SyncedContentMapper.kindOf), in display order.
const GROUP_ORDER = ["EMERGENCY", "EMBASSY", "LABOUR", "SUPPORT", "HEALTH", "LEGAL", "RETURNEE", "OTHER"]
const GROUP_OF_KIND = {
  emergency: "EMERGENCY",
  police: "EMERGENCY",
  ambulance: "EMERGENCY",
  fire: "EMERGENCY",
  embassy: "EMBASSY",
  consulate: "EMBASSY",
  "labour-ministry": "LABOUR",
  "labour-hotline": "LABOUR",
  shelter: "SUPPORT",
  ngo: "SUPPORT",
  helpline: "SUPPORT",
  iom: "SUPPORT",
  "un-agency": "SUPPORT",
  health: "HEALTH",
  "mental-health": "HEALTH",
  "legal-aid": "LEGAL",
  "returnee-service": "RETURNEE"
}
// Section titles: copies of feature/help res help_group_* (used only if the app cannot map the group).
const GROUP_TITLES = {
  EMERGENCY: { en: "More emergency numbers", am: "ሌሎች የድንገተኛ ቁጥሮች", om: "Lakkoofsota balaa tasaa biroo" },
  EMBASSY: { en: "Ethiopian embassy", am: "የኢትዮጵያ ኤምባሲ", om: "Embaasii Itoophiyaa" },
  LABOUR: { en: "Work problems", am: "የሥራ ችግሮች", om: "Rakkoo hojii" },
  SUPPORT: { en: "Support and shelter", am: "ድጋፍ እና መጠለያ", om: "Deeggarsa fi bakka buufataa" },
  HEALTH: { en: "Health", am: "ጤና", om: "Fayyaa" },
  LEGAL: { en: "Legal help", am: "የሕግ እርዳታ", om: "Gargaarsa seeraa" },
  RETURNEE: { en: "Coming home", am: "ወደ ቤት መመለስ", om: "Gara manaa deebi'uu" },
  OTHER: { en: "Other services", am: "ሌሎች አገልግሎቶች", om: "Tajaajila biroo" }
}

const fail = (msg) => {
  process.stderr.write(`build-android-bundle: ${msg}\n`)
  process.exit(1)
}

const readYaml = (file) => parseYaml(readFileSync(file, "utf8"))
const readMd = (file) => parseFrontMatter(readFileSync(file, "utf8"))
const mdFiles = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => n.endsWith(".md"))
        .sort()
    : []

/** Rebuilds a locale map in LOCALE_ORDER, dropping empty values. */
function ordered(map) {
  const out = {}
  const keys = Object.keys(map).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
  for (const k of keys) if (typeof map[k] === "string") out[k] = map[k]
  return out
}
function rank(locale) {
  const i = LOCALE_ORDER.indexOf(locale)
  return i < 0 ? LOCALE_ORDER.length : i
}

// ---------------------------------------------------------------------------
// Directory
// ---------------------------------------------------------------------------
function buildDirectories() {
  const dirs = []
  for (const cc of COUNTRIES) {
    const file = join(CONTENT, "directory", `${cc.toLowerCase()}.yaml`)
    if (!existsSync(file)) fail(`missing ${relative(ROOT, file)}`)
    const doc = readYaml(file)
    const contacts = doc.entries.map((e) => toContact(e))
    const emergencyAt = contacts.findIndex((c) => GROUP_OF_KIND[c.kind] === "EMERGENCY" && c.phone !== null)
    if (emergencyAt < 0) fail(`${relative(ROOT, file)} has no emergency entry with a number`)
    const emergency = contacts[emergencyAt]
    const rest = contacts.filter((_, n) => n !== emergencyAt)
    const sections = []
    for (const group of GROUP_ORDER) {
      const list = rest.filter((c) => (GROUP_OF_KIND[c.kind] ?? "OTHER") === group)
      if (list.length) sections.push({ title: GROUP_TITLES[group], group, contacts: list })
    }
    dirs.push({ country: cc, last_reviewed: doc.updated, emergency, sections })
  }
  return dirs
}

function toContact(e) {
  const name = ordered(e.name)
  // Notes are English-only: show them to English readers, the city (or nothing) to others,
  // exactly like synced directories do.
  const description = { en: [e.city, e.notes].filter(Boolean).join(" · ") }
  for (const loc of Object.keys(name)) if (loc !== "en") description[loc] = e.city ?? ""
  return {
    id: e.id,
    kind: e.kind,
    name,
    description: ordered(description),
    phone: e.short_code ?? e.phone ?? null,
    hours: e.hours ?? null,
    verified: e.verified === true,
    source_url: e.source_url ?? null
  }
}

// ---------------------------------------------------------------------------
// Articles (rights, journey, FAQ)
// ---------------------------------------------------------------------------

/** Same rules as SyncedContentMapper.categoriesOf; the first entry is the primary category. */
function categoriesOf(kind, phase, topics) {
  const out = []
  const health = topics.some((t) => HEALTH_TOPICS.has(t))
  if (kind === "rights") out.push("rights")
  if (health) out.push("health")
  if (kind === "faq") return out
  if (phase === "before") out.push("before_you_go")
  else if (phase === "return") out.push("return")
  else if (phase === "abroad" && !health) out.push("rights")
  return [...new Set(out)]
}

function article({ id, kind, phase, topics, countries, byLocale }) {
  const en = byLocale.get("en")
  if (!en) fail(`${id} has no English file`)
  const locales = [...byLocale.keys()].sort((a, b) => rank(a) - rank(b))
  const text = (key) => ordered(Object.fromEntries(locales.map((l) => [l, byLocale.get(l)[key]])))
  const statuses = text("status")
  const categories = categoriesOf(kind, phase, topics)
  const sortedCountries = COUNTRIES.filter((c) => countries.includes(c))
  return {
    id,
    category: categories[0] ?? kind,
    categories,
    country: sortedCountries.length === 1 ? sortedCountries[0] : null,
    countries: sortedCountries,
    title: text("title"),
    summary: text("summary"),
    body: text("body"),
    reviewed_by: null,
    status: en.status,
    statuses
  }
}

function translation(file) {
  const { data, body } = readMd(file)
  return { data, title: data.title, summary: data.summary, status: data.status, body: body.trim() }
}

function buildRights() {
  const dir = join(CONTENT, "rights")
  const out = []
  for (const cc of COUNTRIES) {
    const byLocale = new Map()
    for (const name of mdFiles(dir)) {
      const m = /^([a-z]{2})\.([a-z]{2})\.md$/.exec(name)
      if (m && m[1] === cc.toLowerCase()) byLocale.set(m[2], translation(join(dir, name)))
    }
    if (!byLocale.size) continue
    out.push(
      article({
        id: `rights-${cc.toLowerCase()}`,
        kind: "rights",
        phase: null,
        topics: ["rights", "legal"],
        countries: [cc],
        byLocale
      })
    )
  }
  return out
}

function buildJourney() {
  const out = []
  for (const phase of PHASES) {
    const dir = join(CONTENT, "journey", phase)
    const bySlug = new Map()
    for (const name of mdFiles(dir)) {
      const m = /^([a-z0-9-]+)\.([a-z]{2})\.md$/.exec(name)
      if (!m) fail(`unexpected file ${relative(ROOT, join(dir, name))}`)
      const map = bySlug.get(m[1]) ?? new Map()
      map.set(m[2], translation(join(dir, name)))
      bySlug.set(m[1], map)
    }
    for (const [slug, byLocale] of [...bySlug].sort((a, b) => a[0].localeCompare(b[0]))) {
      const en = byLocale.get("en")?.data
      if (!en) fail(`${phase}/${slug} has no English file`)
      out.push(
        article({ id: slug, kind: "journey", phase, topics: en.tags ?? [], countries: en.countries ?? [], byLocale })
      )
    }
  }
  return out
}

/** First sentence of an answer, as the backend does for FAQ summaries. */
function firstSentence(text) {
  const t = text.trim()
  const m = /^.+?[.!?።](\s|$)/su.exec(t)
  return (m ? m[0] : t).trim()
}

function buildFaq() {
  const file = join(CONTENT, "assistant", "faq-seed.yaml")
  if (!existsSync(file)) return []
  return readYaml(file).items.map((q) => {
    const byLocale = new Map()
    for (const loc of Object.keys(q.answer)) {
      const answer = q.answer[loc].trim()
      byLocale.set(loc, {
        title: q.question[loc] ?? q.question.en,
        summary: firstSentence(answer),
        body: answer,
        status: q.status
      })
    }
    return article({ id: q.id, kind: "faq", phase: null, topics: q.tags ?? [], countries: q.countries ?? [], byLocale })
  })
}

// ---------------------------------------------------------------------------
// Agencies
// ---------------------------------------------------------------------------
function buildAgencies() {
  const file = join(CONTENT, "agencies", "ethiopia.yaml")
  if (!existsSync(file)) return []
  return (readYaml(file).agencies ?? [])
    .map((a) => ({
      name: a.name,
      licence: a.licence_number ?? "",
      status: a.licence_status,
      city: a.city ?? null,
      sample: false
    }))
    .sort((a, b) => a.name.localeCompare(b.name) || a.licence.localeCompare(b.licence))
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function latestUpdate(files) {
  let latest = ""
  for (const f of files) {
    const m = /^updated:\s*"?(\d{4}-\d{2}-\d{2})/m.exec(readFileSync(f, "utf8"))
    if (m && m[1] > latest) latest = m[1]
  }
  return latest
}

function allContentFiles() {
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(dir, name.name)
      if (name.isDirectory()) {
        if (name.name !== "scripts") walk(p)
      } else if (/\.(md|yaml)$/.test(name.name) && basename(p) !== "README.md") out.push(p)
    }
  }
  walk(CONTENT)
  return out
}

const directories = buildDirectories()
const articles = [...buildRights(), ...buildJourney(), ...buildFaq()]
const ids = new Set()
for (const a of articles) {
  if (ids.has(a.id)) fail(`duplicate article id ${a.id}`)
  ids.add(a.id)
}
const bundle = {
  version: BUNDLE_VERSION,
  // Date of the newest content change (not the wall clock), so rebuilding is reproducible.
  generated_at: latestUpdate(allContentFiles()),
  directories,
  articles,
  agencies: buildAgencies()
}
const json = `${JSON.stringify(bundle, null, 2)}\n`

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : ""
  if (current !== json) fail(`${relative(ROOT, OUT)} is out of date; run pnpm content:android-bundle`)
} else {
  writeFileSync(OUT, json)
}

const count = (pred) => articles.filter(pred).length
const statusCounts = {}
for (const a of articles)
  for (const [loc, s] of Object.entries(a.statuses)) {
    statusCounts[loc] ??= {}
    statusCounts[loc][s] = (statusCounts[loc][s] ?? 0) + 1
  }
const perCountry = Object.fromEntries(
  directories.map((d) => [d.country, 1 + d.sections.reduce((n, s) => n + s.contacts.length, 0)])
)
const out = (line) => process.stdout.write(`${line}\n`)
out(`${process.argv.includes("--check") ? "up to date" : "wrote"} ${relative(ROOT, OUT)}`)
out(
  `articles: ${articles.length} (rights ${count((a) => a.id.startsWith("rights-"))}, faq ${count((a) => a.id.startsWith("faq-"))}) | statuses per locale: ${JSON.stringify(statusCounts)}`
)
out(
  `directory entries: ${JSON.stringify(perCountry)} | agencies: ${bundle.agencies.length} | generated_at: ${bundle.generated_at}`
)
