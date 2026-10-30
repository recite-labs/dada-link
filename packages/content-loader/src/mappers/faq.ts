import { ContentFiles, ContentItem, LOCALES } from "@dadalink/domain"
import { decodeWith, parseYaml } from "../decode.ts"
import { type Checked, type ContentIssue, failed, ok } from "../issues.ts"

const MAX_SUMMARY = 300

/** First sentence (Latin or Ethiopic full stop), capped for list views. */
export const firstSentence = (text: string): string => {
  const sentence = /^(.+?[.!?።])(?:\s|$)/u.exec(text.trim())?.[1] ?? text.trim()
  return sentence.length <= MAX_SUMMARY ? sentence : `${sentence.slice(0, MAX_SUMMARY - 1)}…`
}

const decodeFile = decodeWith(ContentFiles.FaqFile)
const decodeItem = decodeWith(ContentItem)

/** `assistant/faq-seed.yaml` → `faq` content items (question = title, answer = body). */
export const parseFaqFile = (path: string, text: string): Checked<ReadonlyArray<ContentItem>> => {
  const yaml = parseYaml(path, text)
  if (yaml.value === undefined) return failed(yaml.issues)
  const file = decodeFile(path, yaml.value)
  if (file.value === undefined) return failed(file.issues)

  const issues: Array<ContentIssue> = []
  const items: Array<ContentItem> = []
  for (const faq of file.value.items) {
    const translations = LOCALES.flatMap((locale) => {
      const question = faq.question[locale]
      const answer = faq.answer[locale]
      return question === undefined || answer === undefined
        ? []
        : [{ locale, status: faq.status, title: question, summary: firstSentence(answer), body: answer }]
    })
    const item = decodeItem(path, {
      id: faq.id,
      kind: "faq",
      phase: null,
      countries: faq.countries,
      topics: faq.tags,
      sources: (faq.sources ?? []).map(({ note: _, ...s }) => s),
      translations,
      related: faq.articles,
      ...(file.value.updated === undefined ? {} : { updated: file.value.updated })
    })
    issues.push(...item.issues)
    if (item.value !== undefined) items.push(item.value)
  }
  return ok(items, issues)
}
