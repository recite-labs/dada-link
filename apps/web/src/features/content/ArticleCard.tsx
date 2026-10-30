import type { ContentSummary } from "@dadalink/domain"
import { Link } from "@tanstack/react-router"
import { useI18n } from "../../i18n/index.ts"
import { ChevronRightIcon } from "../../ui/icons.tsx"

/** Article in a list. Sensitive articles show a content-note tag instead of a preview of the topic. */
export const ArticleCard = ({ item }: { readonly item: ContentSummary }) => {
  const { t, locale } = useI18n()
  return (
    <li>
      <Link
        to="/$locale/articles/$id"
        params={{ locale, id: item.id }}
        className="flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 transition-colors hover:bg-tint"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1" lang={item.locale}>
          <span className="text-[17px] leading-[23px] font-bold">{item.title}</span>
          {item.sensitive ? (
            <span
              lang={locale}
              className="self-start rounded-full bg-marigold-tint px-2.5 py-0.5 text-[12px] font-bold text-marigold-ink"
            >
              {t.journey.sensitive}
            </span>
          ) : (
            <span className="line-clamp-2 text-[14px] leading-[20px] text-muted">{item.summary}</span>
          )}
        </span>
        <ChevronRightIcon size={18} className="shrink-0 text-muted" />
      </Link>
    </li>
  )
}
