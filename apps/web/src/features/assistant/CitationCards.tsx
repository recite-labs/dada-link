import type { Citation } from "@dadalink/domain"
import { Link } from "@tanstack/react-router"
import { useI18n } from "../../i18n/index.ts"
import { ChevronRightIcon, ShieldIcon } from "../../ui/icons.tsx"

/** The reviewed articles an answer is based on, numbered like the `[n]` marks in the text. */
export const CitationCards = ({ citations }: { readonly citations: ReadonlyArray<Citation> }) => {
  const { t, locale } = useI18n()
  if (citations.length === 0) return null
  return (
    <section className="flex flex-col gap-2" aria-label={t.ask.sources}>
      <h3 className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">{t.ask.sources}</h3>
      <ol className="flex flex-col gap-2">
        {citations.map((citation, index) => (
          <li key={citation.contentId}>
            <Link
              to="/$locale/articles/$id"
              params={{ locale, id: citation.contentId }}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-ground p-3 hover:border-indigo"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-tint text-indigo">
                <ShieldIcon size={18} />
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-[20px] font-bold">
                <span className="mr-1.5 text-muted tabular-nums">[{index + 1}]</span>
                <span lang={citation.locale}>{citation.title}</span>
              </span>
              <ChevronRightIcon size={18} className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
