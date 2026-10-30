#!/usr/bin/env node
// Dependency-free validator for DadaLink content files.
// Shapes are documented in content/README.md.
//
//   node content/scripts/validate.mjs            validate everything
//   node content/scripts/validate.mjs --sources  also regenerate content/SOURCES.md

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), "..")
const ROOT = join(CONTENT, "..")

// ---------------------------------------------------------------------------
// Enums and patterns
// ---------------------------------------------------------------------------
const LOCALES = ["am", "om", "en", "sw", "ti"]
const COUNTRIES = ["SA", "AE", "KW", "QA", "LB", "JO", "ET"]
const PHASES = ["before", "abroad", "return"]
const STATUSES = ["draft-ai", "reviewed"]
const KINDS = [
  "emergency",
  "embassy",
  "consulate",
  "labour-hotline",
  "police",
  "ambulance",
  "iom",
  "shelter",
  "ngo",
  "returnee-service",
  "helpline"
]
const TOPICS = [
  "emergency",
  "abuse",
  "sexual-violence",
  "wages",
  "passport",
  "documents",
  "labour-complaint",
  "shelter",
  "repatriation",
  "legal",
  "health",
  "mental-health",
  "trafficking",
  "detention",
  "returnee-support",
  "fire"
]
const LICENCE_STATUSES = ["licensed", "suspended", "revoked", "unknown"]
const SLUGS = {
  before: [
    "licensed-agencies-vs-brokers",
    "your-contract",
    "documents-to-copy",
    "health-preparation",
    "contraception-and-srh-before-you-go",
    "legal-risks-abroad",
    "trusted-contact-and-safety-plan",
    "money-fees-and-debt"
  ],
  abroad: [
    "passport-taken",
    "unpaid-wages",
    "rest-and-working-hours",
    "sick-or-injured",
    "abuse-what-to-do",
    "sexual-violence-what-to-do",
    "pregnancy-abroad",
    "loneliness-and-mental-health",
    "leaving-a-bad-employer",
    "contacting-your-embassy"
  ],
  return: [
    "preparing-to-return",
    "arriving-home",
    "claiming-unpaid-wages-after-return",
    "mental-health-after-return",
    "health-check-after-return",
    "family-and-community-after-return",
    "money-and-work-after-return",
    "detention-and-deportation"
  ]
}
const REQUIRED_LOCALES = ["en", "am", "om"]
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const URL_RE = /^https?:\/\/[^\s]+$/
const E164_RE = /^\+[1-9]\d{6,14}$/
const SHORT_RE = /^\d{2,8}$/
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const TELEGRAM_RE = /^(@[A-Za-z0-9_]{4,}|https:\/\/t\.me\/\S+)$/

// ---------------------------------------------------------------------------
// Restricted YAML subset parser (see README "Restricted YAML subset")
// ---------------------------------------------------------------------------
class YamlError extends Error {}

export function parseYaml(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n")
  let i = 0
  let cur = 0 // line currently being parsed, for error messages

  const indentOf = (l) => l.length - l.trimStart().length
  const isBlank = (l) => l.trim() === "" || l.trimStart().startsWith("#")
  const fail = (msg, at = cur) => {
    throw new YamlError(`line ${at + 1}: ${msg}`)
  }

  function skip() {
    while (i < lines.length && isBlank(lines[i])) i++
    cur = i
    if (i < lines.length && /^ *\t/.test(lines[i])) fail("tabs are not allowed for indentation")
  }

  function stripComment(s) {
    let q = null
    for (let k = 0; k < s.length; k++) {
      const c = s[k]
      if (q) {
        if (q === '"' && c === "\\") k++
        else if (c === q) q = null
      } else if (c === '"' || c === "'") {
        if (k === 0 || /[\s[,]/.test(s[k - 1])) q = c
      } else if (c === "#" && (k === 0 || /\s/.test(s[k - 1]))) {
        return s.slice(0, k).trimEnd()
      }
    }
    return s.trimEnd()
  }

  function splitFlow(inner) {
    const parts = []
    let cur = ""
    let q = null
    for (let k = 0; k < inner.length; k++) {
      const c = inner[k]
      if (q) {
        cur += c
        if (q === '"' && c === "\\") cur += inner[++k] ?? ""
        else if (c === q) q = null
      } else if (c === '"' || c === "'") {
        q = c
        cur += c
      } else if (c === ",") {
        parts.push(cur.trim())
        cur = ""
      } else if (c === "[" || c === "{") {
        fail("nested flow collections are not supported")
      } else cur += c
    }
    if (q) fail("unterminated quote in flow sequence")
    if (cur.trim() !== "") parts.push(cur.trim())
    return parts
  }

  function scalar(raw) {
    const s = raw.trim()
    if (s === "" || s === "null" || s === "~") return null
    if (s === "true") return true
    if (s === "false") return false
    if (s.startsWith('"')) {
      if (s.length < 2 || !s.endsWith('"')) fail("unterminated double-quoted string")
      const body = s.slice(1, -1)
      let out = ""
      for (let k = 0; k < body.length; k++) {
        const c = body[k]
        if (c === "\\") {
          const n = body[++k]
          if (n === "n") out += "\n"
          else if (n === "t") out += "\t"
          else if (n === '"' || n === "\\" || n === "/") out += n
          else fail(`unsupported escape \\${n}`)
        } else if (c === '"') fail("unescaped double quote inside string")
        else out += c
      }
      return out
    }
    if (s.startsWith("'")) {
      if (s.length < 2 || !s.endsWith("'")) fail("unterminated single-quoted string")
      const body = s.slice(1, -1)
      if (/(^|[^'])'([^']|$)/.test(body.replace(/''/g, ""))) fail("unescaped single quote")
      return body.replace(/''/g, "'")
    }
    if (s.startsWith("[")) {
      if (!s.endsWith("]")) fail("flow sequence must be on one line and end with ]")
      return splitFlow(s.slice(1, -1)).map((p) => {
        if (p === "") fail("empty item in flow sequence")
        return scalar(p)
      })
    }
    if (s === "{}") return {}
    if (/^-?\d+$/.test(s)) return Number(s)
    if (/^[{>|*&!%@`]/.test(s)) fail(`plain value may not start with "${s[0]}"; quote it`)
    if (/:\s/.test(s) || s.endsWith(":")) fail(`plain value contains ": "; quote it: ${s}`)
    return s
  }

  function blockScalar(header, parentIndent) {
    const m = /^([|>])([-+]?)$/.exec(header)
    if (!m) fail(`bad block scalar header "${header}"`)
    const [, style, chomp] = m
    const body = []
    let blockIndent = null
    while (i < lines.length) {
      const l = lines[i]
      if (l.trim() === "") {
        body.push("")
        i++
        continue
      }
      const ind = indentOf(l)
      if (ind <= parentIndent) break
      if (blockIndent === null) blockIndent = ind
      if (ind < blockIndent) fail("block scalar line is less indented than its first line")
      body.push(l.slice(blockIndent))
      i++
    }
    while (body.length && body[body.length - 1] === "") body.pop()
    let text
    if (style === "|") text = body.join("\n")
    else {
      text = ""
      for (let k = 0; k < body.length; k++) {
        const line = body[k]
        if (line === "") text += "\n"
        else if (k > 0 && body[k - 1] !== "" && !text.endsWith("\n")) text += ` ${line}`
        else text += line
      }
    }
    if (chomp === "-") return text
    return text === "" ? "" : `${text}\n`
  }

  const KEY_RE = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'#\-[\]{}][^:]*?|-[^\s:][^:]*?)\s*:(?:\s+(.*)|)$/

  function parseValueAfterKey(rest, keyIndent) {
    const v = stripComment(rest ?? "")
    if (v === "") {
      skip()
      if (i >= lines.length) return null
      const ind = indentOf(lines[i])
      const t = lines[i].trimStart()
      if (ind > keyIndent) return parseNode(ind)
      if (ind === keyIndent && (t === "-" || t.startsWith("- "))) return parseSequence(ind)
      return null
    }
    if (/^[|>][-+]?$/.test(v)) return blockScalar(v, keyIndent)
    return scalar(v)
  }

  function parseMapping(ind) {
    const obj = {}
    for (;;) {
      skip()
      if (i >= lines.length) break
      const l = lines[i]
      const li = indentOf(l)
      if (li < ind) break
      if (li > ind) fail("unexpected indentation")
      const t = l.slice(ind)
      if (t === "-" || t.startsWith("- ")) break
      if (t.includes("\t")) fail("tabs are not allowed")
      const m = KEY_RE.exec(t)
      if (!m) fail(`expected "key: value", got: ${t}`)
      let key = m[1]
      if (key.startsWith('"') || key.startsWith("'")) key = scalar(key)
      if (Object.hasOwn(obj, key)) fail(`duplicate key "${key}"`)
      const at = i
      i++
      try {
        obj[key] = parseValueAfterKey(m[2], ind)
      } catch (e) {
        if (e instanceof YamlError) throw e
        fail(String(e), at)
      }
    }
    return obj
  }

  function parseSequence(ind) {
    const arr = []
    for (;;) {
      skip()
      if (i >= lines.length) break
      const l = lines[i]
      const li = indentOf(l)
      if (li < ind) break
      if (li > ind) fail("unexpected indentation in sequence")
      const t = l.slice(ind)
      if (!(t === "-" || t.startsWith("- "))) break
      const after = t.slice(1)
      const content = after.trimStart()
      const contentIndent = ind + 1 + (after.length - content.length)
      const c = stripComment(content)
      if (c === "") {
        i++
        skip()
        if (i < lines.length && indentOf(lines[i]) > ind) arr.push(parseNode(indentOf(lines[i])))
        else arr.push(null)
      } else if (!/^["'[{]/.test(c) && KEY_RE.test(c)) {
        // "- key: value" -> mapping whose keys align with "key"
        lines[i] = " ".repeat(contentIndent) + content
        arr.push(parseMapping(contentIndent))
      } else if (/^[|>][-+]?$/.test(c)) {
        i++
        arr.push(blockScalar(c, ind))
      } else {
        i++
        arr.push(scalar(c))
      }
    }
    return arr
  }

  function parseNode(ind) {
    skip()
    if (i >= lines.length) return null
    const t = lines[i].trimStart()
    if (t === "-" || t.startsWith("- ")) return parseSequence(ind)
    return parseMapping(ind)
  }

  skip()
  if (i >= lines.length) return null
  if (indentOf(lines[i]) !== 0) fail("document must start at column 0")
  const doc = parseNode(0)
  skip()
  if (i < lines.length) fail("could not parse remaining content")
  return doc
}

export function parseFrontMatter(text) {
  const t = text.replace(/\r\n?/g, "\n")
  if (!t.startsWith("---\n")) throw new YamlError("missing front matter (file must start with ---)")
  const end = t.indexOf("\n---\n", 4)
  const endAtEof = t.endsWith("\n---") ? t.length - 4 : -1
  const stop = end >= 0 ? end : endAtEof
  if (stop < 0) throw new YamlError("front matter is not closed with ---")
  const data = parseYaml(t.slice(4, stop + 1))
  const body = end >= 0 ? t.slice(end + 5) : ""
  return { data, body }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const errors = []
const warnings = []
const sourceIndex = new Map() // url -> { title, publisher, files:Set }

function err(file, msg) {
  errors.push(`${relative(ROOT, file)}: ${msg}`)
}
function warn(file, msg) {
  warnings.push(`${relative(ROOT, file)}: ${msg}`)
}

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v)
const isStr = (v) => typeof v === "string" && v.trim() !== ""

function check(file, cond, msg) {
  if (!cond) err(file, msg)
  return cond
}

function allowedKeys(file, obj, keys, where) {
  for (const k of Object.keys(obj)) if (!keys.includes(k)) err(file, `${where}: unknown field "${k}"`)
}

function str(file, obj, key, where, { nullable = false } = {}) {
  const v = obj[key]
  if (v === null || v === undefined) {
    if (!nullable) err(file, `${where}.${key} is required (string)`)
    else if (v === undefined) err(file, `${where}.${key} is required (string or null)`)
    return null
  }
  if (!isStr(v)) err(file, `${where}.${key} must be a non-empty string`)
  return v
}

function oneOf(file, obj, key, values, where) {
  const v = obj[key]
  check(file, values.includes(v), `${where}.${key} must be one of ${values.join("|")} (got ${JSON.stringify(v)})`)
  return v
}

function date(file, obj, key, where) {
  const v = obj[key]
  check(file, typeof v === "string" && DATE_RE.test(v), `${where}.${key} must be a date YYYY-MM-DD`)
}

function verifiedFalseOrBool(file, obj, where) {
  check(file, typeof obj.verified === "boolean", `${where}.verified must be a boolean`)
}

function listOf(file, obj, key, where, values, { min = 0 } = {}) {
  const v = obj[key]
  if (!check(file, Array.isArray(v), `${where}.${key} must be a list`)) return []
  check(file, v.length >= min, `${where}.${key} needs at least ${min} item(s)`)
  for (const x of v) {
    if (values) check(file, values.includes(x), `${where}.${key}: "${x}" is not one of ${values.join("|")}`)
    else check(file, isStr(x), `${where}.${key}: items must be non-empty strings`)
  }
  return v
}

function urlOrNull(file, obj, key, where, { required = false } = {}) {
  const v = obj[key]
  if (v === null || v === undefined) {
    if (required) err(file, `${where}.${key} is required (URL)`)
    else if (v === undefined) err(file, `${where}.${key} is required (URL or null)`)
    return
  }
  check(file, typeof v === "string" && URL_RE.test(v), `${where}.${key} must be a URL (got ${JSON.stringify(v)})`)
}

function localized(file, obj, key, where, required = ["en"]) {
  const v = obj[key]
  if (!check(file, isObj(v), `${where}.${key} must be a mapping of locale -> text`)) return
  for (const [loc, text] of Object.entries(v)) {
    check(file, LOCALES.includes(loc), `${where}.${key}: unknown locale "${loc}"`)
    check(file, isStr(text), `${where}.${key}.${loc} must be a non-empty string`)
  }
  for (const loc of required) check(file, isStr(v[loc]), `${where}.${key}.${loc} is required`)
}

function sources(file, obj, key, where, { min = 0 } = {}) {
  const v = obj[key]
  if (v === undefined && min === 0) return
  if (!check(file, Array.isArray(v), `${where}.${key} must be a list of sources`)) return
  check(file, v.length >= min, `${where}.${key} needs at least ${min} source(s)`)
  v.forEach((s, n) => {
    const w = `${where}.${key}[${n}]`
    if (!check(file, isObj(s), `${w} must be a mapping`)) return
    allowedKeys(file, s, ["url", "title", "accessed", "publisher", "note"], w)
    urlOrNull(file, s, "url", w, { required: true })
    str(file, s, "title", w)
    date(file, s, "accessed", w)
    if (s.publisher !== undefined) str(file, s, "publisher", w, { nullable: true })
    if (s.note !== undefined) str(file, s, "note", w, { nullable: true })
    if (typeof s.url === "string") addSource(file, s.url, s.title, s.publisher)
  })
}

function addSource(file, url, title, publisher) {
  const e = sourceIndex.get(url) ?? { title: null, publisher: null, files: new Set() }
  if (!e.title && isStr(title)) e.title = title
  if (!e.publisher && isStr(publisher)) e.publisher = publisher
  e.files.add(relative(CONTENT, file))
  sourceIndex.set(url, e)
}

function todoField(file, obj, where, { list }) {
  const v = obj.todo
  if (v === undefined) return
  if (list) {
    check(file, Array.isArray(v) && v.every(isStr), `${where}.todo must be a list of strings`)
  } else {
    check(file, v === null || isStr(v), `${where}.todo must be a string or null`)
  }
}

function listFiles(dir, re) {
  if (!existsSync(dir)) return []
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listFiles(p, re))
    else if (re.test(name)) out.push(p)
  }
  return out
}

function load(file, kind) {
  try {
    const text = readFileSync(file, "utf8")
    return kind === "md" ? parseFrontMatter(text) : { data: parseYaml(text) }
  } catch (e) {
    err(file, e instanceof YamlError ? `YAML: ${e.message}` : String(e))
    return null
  }
}

// ---------------------------------------------------------------------------
// B1 Directory
// ---------------------------------------------------------------------------
const ENTRY_KEYS = [
  "id",
  "country",
  "kind",
  "name",
  "name_status",
  "helps_with",
  "phone",
  "short_code",
  "whatsapp",
  "telegram",
  "email",
  "website",
  "hours",
  "languages",
  "city",
  "address",
  "notes",
  "source_url",
  "sources",
  "verified",
  "todo"
]
const directoryIds = new Set()
const directoryCounts = {}

function validateDirectory() {
  const dir = join(CONTENT, "directory")
  const files = listFiles(dir, /\.yaml$/)
  for (const cc of COUNTRIES) {
    const f = join(dir, `${cc.toLowerCase()}.yaml`)
    if (!existsSync(f)) err(f, "missing directory file")
  }
  for (const file of files) {
    const cc = basename(file, ".yaml").toUpperCase()
    if (
      !check(
        file,
        COUNTRIES.includes(cc),
        `file name must be one of ${COUNTRIES.map((c) => c.toLowerCase()).join(",")}`
      )
    )
      continue
    const doc = load(file, "yaml")?.data
    if (!doc) continue
    if (!check(file, isObj(doc), "top level must be a mapping")) continue
    allowedKeys(file, doc, ["country", "updated", "entries"], "file")
    check(file, doc.country === cc, `country must be ${cc}`)
    date(file, doc, "updated", "file")
    if (!check(file, Array.isArray(doc.entries), "entries must be a list")) continue
    directoryCounts[cc] = doc.entries.length
    doc.entries.forEach((e, n) => {
      const w = `entries[${n}]${isObj(e) && e.id ? `(${e.id})` : ""}`
      if (!check(file, isObj(e), `${w} must be a mapping`)) return
      allowedKeys(file, e, ENTRY_KEYS, w)
      for (const k of ENTRY_KEYS) {
        if (k !== "sources" && !(k in e)) err(file, `${w}.${k} is missing`)
      }
      if (check(file, typeof e.id === "string" && KEBAB_RE.test(e.id), `${w}.id must be kebab-case`)) {
        check(file, e.id.startsWith(`${cc.toLowerCase()}-`), `${w}.id must start with "${cc.toLowerCase()}-"`)
        check(file, !directoryIds.has(e.id), `${w}.id is duplicated`)
        directoryIds.add(e.id)
      }
      check(file, e.country === cc, `${w}.country must be ${cc}`)
      oneOf(file, e, "kind", KINDS, w)
      localized(file, e, "name", w, REQUIRED_LOCALES)
      oneOf(file, e, "name_status", STATUSES, w)
      listOf(file, e, "helps_with", w, TOPICS, { min: 1 })
      for (const k of ["phone", "whatsapp"]) {
        if (e[k] !== null && e[k] !== undefined)
          check(
            file,
            typeof e[k] === "string" && E164_RE.test(e[k]),
            `${w}.${k} must be E.164 like +966112345678 or null (got ${JSON.stringify(e[k])})`
          )
      }
      if (e.short_code !== null && e.short_code !== undefined)
        check(
          file,
          typeof e.short_code === "string" && SHORT_RE.test(e.short_code),
          `${w}.short_code must be a quoted string of 2-8 digits or null`
        )
      if (e.telegram !== null && e.telegram !== undefined)
        check(
          file,
          typeof e.telegram === "string" && TELEGRAM_RE.test(e.telegram),
          `${w}.telegram must be "@handle" or https://t.me/... or null`
        )
      if (e.email !== null && e.email !== undefined)
        check(
          file,
          typeof e.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email),
          `${w}.email is not a valid address`
        )
      urlOrNull(file, e, "website", w)
      for (const k of ["hours", "city", "address", "notes"]) str(file, e, k, w, { nullable: true })
      listOf(file, e, "languages", w)
      urlOrNull(file, e, "source_url", w, { required: true })
      if (typeof e.source_url === "string")
        addSource(file, e.source_url, e.name?.en ? `${e.name.en} (directory source)` : null, null)
      sources(file, e, "sources", w)
      verifiedFalseOrBool(file, e, w)
      todoField(file, e, w, { list: false })
      const reachable = ["phone", "short_code", "whatsapp", "telegram", "email", "website"].some((k) => e[k])
      check(
        file,
        reachable || isStr(e.todo),
        `${w} has no contact (phone/short_code/whatsapp/telegram/email/website) and no todo`
      )
      if (e.phone === null && e.short_code === null && !isStr(e.todo))
        warn(file, `${w} has no phone or short code; consider adding a todo`)
    })
  }
}

// ---------------------------------------------------------------------------
// B2 / B3 Markdown articles
// ---------------------------------------------------------------------------
const articles = new Map() // id -> Map(locale -> {file, data, body})
const RIGHTS_KEYS = [
  "id",
  "type",
  "country",
  "locale",
  "title",
  "summary",
  "status",
  "verified",
  "translation_of",
  "updated",
  "sources",
  "todo"
]
const JOURNEY_KEYS = [
  "id",
  "type",
  "phase",
  "locale",
  "title",
  "summary",
  "countries",
  "tags",
  "sensitive",
  "status",
  "verified",
  "translation_of",
  "related",
  "updated",
  "sources",
  "todo"
]

function commonArticle(file, d, body, id, locale, keys) {
  allowedKeys(file, d, keys, "front matter")
  for (const k of keys) if (k !== "todo" && !(k in d)) err(file, `front matter.${k} is missing`)
  check(file, d.id === id, `id must be "${id}" (from the file name)`)
  check(file, d.locale === locale, `locale must be "${locale}" (from the file name)`)
  check(file, LOCALES.includes(locale), `locale "${locale}" is not one of ${LOCALES.join("|")}`)
  str(file, d, "title", "front matter")
  str(file, d, "summary", "front matter")
  oneOf(file, d, "status", STATUSES, "front matter")
  verifiedFalseOrBool(file, d, "front matter")
  date(file, d, "updated", "front matter")
  if (locale === "en") check(file, d.translation_of === null, "translation_of must be null for en")
  else check(file, d.translation_of === id, `translation_of must be "${id}"`)
  sources(file, d, "sources", "front matter", { min: 1 })
  todoField(file, d, "front matter", { list: true })
  check(file, body.trim().length > 200, "body is empty or too short")
  const cites = [...body.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]))
  const n = Array.isArray(d.sources) ? d.sources.length : 0
  for (const c of cites) check(file, c >= 1 && c <= n, `citation [${c}] has no matching source (there are ${n})`)
  const entry = articles.get(id) ?? new Map()
  if (entry.has(locale)) err(file, `duplicate article ${id}.${locale}`)
  entry.set(locale, { file, data: d, body })
  articles.set(id, entry)
}

function validateRights() {
  const dir = join(CONTENT, "rights")
  for (const file of listFiles(dir, /\.md$/)) {
    const m = /^([a-z]{2})\.([a-z]{2})\.md$/.exec(basename(file))
    if (!check(file, m, "file name must be <cc>.<locale>.md")) continue
    const [, cc, locale] = m
    const parsed = load(file, "md")
    if (!parsed) continue
    const { data: d, body } = parsed
    if (!check(file, isObj(d), "front matter must be a mapping")) continue
    check(file, COUNTRIES.includes(cc.toUpperCase()), `unknown country "${cc}"`)
    check(file, d.type === "rights", 'type must be "rights"')
    check(file, d.country === cc.toUpperCase(), `country must be ${cc.toUpperCase()}`)
    commonArticle(file, d, body, `rights-${cc}`, locale, RIGHTS_KEYS)
    if (locale === "en")
      check(file, (body.match(/^## /gm) ?? []).length >= 4, "rights article needs at least 4 ## sections")
  }
  for (const cc of COUNTRIES) {
    for (const loc of REQUIRED_LOCALES) {
      const f = join(dir, `${cc.toLowerCase()}.${loc}.md`)
      if (!existsSync(f)) err(f, "missing rights file")
    }
  }
}

const PHONE_IN_TEXT = /(\+\d[\d\s-]{6,}\d)|(\b\d{3}[\s-]\d{3}[\s-]\d{3,4}\b)/

function validateJourney() {
  for (const phase of PHASES) {
    const dir = join(CONTENT, "journey", phase)
    for (const file of listFiles(dir, /\.md$/)) {
      const m = /^([a-z0-9-]+)\.([a-z]{2})\.md$/.exec(basename(file))
      if (!check(file, m, "file name must be <slug>.<locale>.md")) continue
      const [, slug, locale] = m
      check(file, SLUGS[phase].includes(slug), `slug "${slug}" is not in the README list for ${phase}`)
      const parsed = load(file, "md")
      if (!parsed) continue
      const { data: d, body } = parsed
      if (!check(file, isObj(d), "front matter must be a mapping")) continue
      check(file, d.type === "journey", 'type must be "journey"')
      check(file, d.phase === phase, `phase must be "${phase}" (from the folder)`)
      listOf(file, d, "countries", "front matter", COUNTRIES, { min: 1 })
      listOf(file, d, "tags", "front matter", TOPICS, { min: 1 })
      check(file, typeof d.sensitive === "boolean", "sensitive must be a boolean")
      listOf(file, d, "related", "front matter")
      if (PHONE_IN_TEXT.test(body))
        err(file, "journey articles must not contain phone numbers; link to the help directory instead")
      commonArticle(file, d, body, slug, locale, JOURNEY_KEYS)
    }
    for (const slug of SLUGS[phase]) {
      for (const loc of REQUIRED_LOCALES) {
        const f = join(dir, `${slug}.${loc}.md`)
        if (!existsSync(f)) err(f, "missing journey article")
      }
    }
  }
}

function crossCheckArticles() {
  for (const [id, byLoc] of articles) {
    const en = byLoc.get("en")
    for (const [loc, a] of byLoc) {
      if (loc === "en") continue
      if (!en) {
        err(a.file, `translation has no English source ${id}.en.md`)
        continue
      }
      check(a.file, a.data.status === "draft-ai" || a.data.status === "reviewed", "status must be set")
      for (const k of ["phase", "country", "sensitive"]) {
        if (k in en.data)
          check(a.file, JSON.stringify(a.data[k]) === JSON.stringify(en.data[k]), `${k} differs from the English file`)
      }
      for (const k of ["countries", "tags", "related"]) {
        if (k in en.data)
          check(a.file, JSON.stringify(a.data[k]) === JSON.stringify(en.data[k]), `${k} differs from the English file`)
      }
      const enUrls = (en.data.sources ?? []).map((s) => s?.url).join("\n")
      const urls = (a.data.sources ?? []).map((s) => s?.url).join("\n")
      check(a.file, enUrls === urls, "sources must be the same URLs (same order) as the English file")
    }
    if (en?.data.type === "journey") {
      for (const r of en.data.related ?? [])
        check(en.file, articles.has(r) || /^rights-[a-z]{2}$/.test(r), `related "${r}" does not exist`)
    }
  }
  for (const [id] of articles) {
    if (/^rights-/.test(id)) continue
  }
  // related rights ids must exist
  for (const [, byLoc] of articles) {
    const en = byLoc.get("en")
    if (en?.data.type !== "journey") continue
    for (const r of en.data.related ?? []) {
      if (/^rights-[a-z]{2}$/.test(r)) check(en.file, articles.has(r), `related "${r}" does not exist`)
    }
  }
}

// ---------------------------------------------------------------------------
// B4 Agencies
// ---------------------------------------------------------------------------
function validateAgencies() {
  const file = join(CONTENT, "agencies", "ethiopia.yaml")
  if (!existsSync(file)) return err(file, "missing agencies file")
  const doc = load(file, "yaml")?.data
  if (!doc || !check(file, isObj(doc), "top level must be a mapping")) return
  allowedKeys(
    file,
    doc,
    ["country", "authority", "how_to_obtain", "how_to_check_for_users", "last_checked", "sources", "todo", "agencies"],
    "file"
  )
  check(file, doc.country === "ET", "country must be ET")
  if (check(file, isObj(doc.authority), "authority must be a mapping")) {
    allowedKeys(file, doc.authority, ["name", "website"], "authority")
    str(file, doc.authority, "name", "authority")
    urlOrNull(file, doc.authority, "website", "authority")
  }
  str(file, doc, "how_to_obtain", "file")
  str(file, doc, "how_to_check_for_users", "file")
  date(file, doc, "last_checked", "file")
  sources(file, doc, "sources", "file", { min: 1 })
  todoField(file, doc, "file", { list: true })
  if (!check(file, Array.isArray(doc.agencies), "agencies must be a list (may be empty)")) return
  const ids = new Set()
  doc.agencies.forEach((a, n) => {
    const w = `agencies[${n}]`
    if (!check(file, isObj(a), `${w} must be a mapping`)) return
    const keys = [
      "id",
      "name",
      "licence_number",
      "licence_status",
      "city",
      "address",
      "phone",
      "source_url",
      "verified",
      "todo"
    ]
    allowedKeys(file, a, keys, w)
    for (const k of keys) if (!(k in a)) err(file, `${w}.${k} is missing`)
    check(
      file,
      typeof a.id === "string" && /^et-agency-[a-z0-9-]+$/.test(a.id),
      `${w}.id must look like et-agency-<slug>`
    )
    check(file, !ids.has(a.id), `${w}.id is duplicated`)
    ids.add(a.id)
    str(file, a, "name", w)
    str(file, a, "licence_number", w, { nullable: true })
    oneOf(file, a, "licence_status", LICENCE_STATUSES, w)
    str(file, a, "city", w, { nullable: true })
    str(file, a, "address", w, { nullable: true })
    if (a.phone !== null)
      check(file, typeof a.phone === "string" && E164_RE.test(a.phone), `${w}.phone must be E.164 or null`)
    urlOrNull(file, a, "source_url", w, { required: true })
    if (typeof a.source_url === "string") addSource(file, a.source_url, `${a.name} (agency source)`, null)
    verifiedFalseOrBool(file, a, w)
    todoField(file, a, w, { list: false })
  })
  return doc.agencies.length
}

// ---------------------------------------------------------------------------
// B5 FAQ seed
// ---------------------------------------------------------------------------
function validateFaq() {
  const file = join(CONTENT, "assistant", "faq-seed.yaml")
  if (!existsSync(file)) return err(file, "missing FAQ seed file")
  const doc = load(file, "yaml")?.data
  if (!doc || !check(file, isObj(doc), "top level must be a mapping")) return
  allowedKeys(file, doc, ["updated", "items"], "file")
  date(file, doc, "updated", "file")
  if (!check(file, Array.isArray(doc.items), "items must be a list")) return
  check(file, doc.items.length >= 20, `need at least 20 items (got ${doc.items.length})`)
  const ids = new Set()
  const keys = [
    "id",
    "question",
    "answer",
    "status",
    "tags",
    "countries",
    "emergency",
    "articles",
    "sources",
    "verified"
  ]
  doc.items.forEach((q, n) => {
    const w = `items[${n}]${isObj(q) && q.id ? `(${q.id})` : ""}`
    if (!check(file, isObj(q), `${w} must be a mapping`)) return
    allowedKeys(file, q, keys, w)
    for (const k of keys) if (!(k in q)) err(file, `${w}.${k} is missing`)
    check(file, typeof q.id === "string" && /^faq-[a-z0-9-]+$/.test(q.id), `${w}.id must look like faq-<slug>`)
    check(file, !ids.has(q.id), `${w}.id is duplicated`)
    ids.add(q.id)
    localized(file, q, "question", w, REQUIRED_LOCALES)
    localized(file, q, "answer", w, REQUIRED_LOCALES)
    if (isObj(q.answer) && typeof q.answer.en === "string") {
      const words = q.answer.en.trim().split(/\s+/).length
      if (words > 140) warn(file, `${w}.answer.en has ${words} words (aim for under ~120)`)
    }
    oneOf(file, q, "status", STATUSES, w)
    listOf(file, q, "tags", w, TOPICS, { min: 1 })
    listOf(file, q, "countries", w, COUNTRIES)
    check(file, typeof q.emergency === "boolean", `${w}.emergency must be a boolean`)
    const arts = listOf(file, q, "articles", w, null, { min: 1 })
    for (const a of arts) check(file, articles.has(a), `${w}.articles: "${a}" does not exist`)
    sources(file, q, "sources", w)
    verifiedFalseOrBool(file, q, w)
  })
  return doc.items.length
}

// ---------------------------------------------------------------------------
// SOURCES.md
// ---------------------------------------------------------------------------
function writeSources() {
  const byHost = new Map()
  for (const [url, e] of sourceIndex) {
    let host = url
    try {
      host = new URL(url).hostname.replace(/^www\./, "")
    } catch {}
    if (!byHost.has(host)) byHost.set(host, [])
    byHost.get(host).push([url, e])
  }
  const hosts = [...byHost.keys()].sort()
  let out = "# Sources\n\n"
  out += "Generated by `node content/scripts/validate.mjs --sources`. Do not edit by hand.\n\n"
  out += "Every URL cited anywhere under `content/`, grouped by website. First research pass:\n"
  out += "all accessed 2026-10-31. Nothing is verified yet: a human must re-check each source\n"
  out += "before launch.\n\n"
  out += `Total: ${sourceIndex.size} unique URLs on ${hosts.length} websites.\n`
  for (const h of hosts) {
    out += `\n## ${h}\n\n`
    for (const [url, e] of byHost.get(h).sort((a, b) => a[0].localeCompare(b[0]))) {
      const title = (e.title ?? url).replace(/\s+/g, " ")
      const pub = e.publisher ? ` (${e.publisher})` : ""
      const files = [...e.files]
        .sort()
        .map((f) => `\`${f}\``)
        .join(", ")
      out += `- [${title}](${url})${pub}. Used in: ${files}\n`
    }
  }
  writeFileSync(join(CONTENT, "SOURCES.md"), out)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main()

function main() {
  validateDirectory()
  validateRights()
  validateJourney()
  crossCheckArticles()
  const agencyCount = validateAgencies()
  const faqCount = validateFaq()

  if (process.argv.includes("--sources")) writeSources()

  const articleFiles = [...articles.values()].reduce((n, m) => n + m.size, 0)
  const dirTotal = Object.values(directoryCounts).reduce((a, b) => a + b, 0)
  console.log(
    `directory entries: ${dirTotal} ${JSON.stringify(directoryCounts)} | article files: ${articleFiles} | agencies: ${agencyCount ?? "-"} | faq: ${faqCount ?? "-"} | sources: ${sourceIndex.size}`
  )
  for (const w of warnings) console.warn(`warning: ${w}`)
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`)
    console.error(`\n${errors.length} error(s)`)
    process.exit(1)
  }
  console.log("content OK")
}
