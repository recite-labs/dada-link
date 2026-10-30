import type { ContentItem } from "@dadalink/domain"
import { type ContentIssue, error, warning } from "./issues.ts"

/**
 * FAQ items must link to existing articles (the assistant relies on them);
 * other `related` links that point nowhere are only warnings.
 */
export const crossReferenceIssues = (
  items: ReadonlyArray<ContentItem>,
  fileOf: (item: ContentItem) => string
): ReadonlyArray<ContentIssue> => {
  const ids = new Set<string>(items.map((i) => i.id))
  return items.flatMap((item) =>
    item.related
      .filter((id) => !ids.has(id))
      .map((id) =>
        item.kind === "faq"
          ? error(fileOf(item), `${item.id} links to unknown article ${id}`)
          : warning(fileOf(item), `${item.id} lists unknown related item ${id}`)
      )
  )
}
