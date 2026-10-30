import type { Source } from "@dadalink/domain"
import { formatIsoDate, useI18n } from "../../i18n/index.ts"

export const SourcesList = ({ sources }: { readonly sources: ReadonlyArray<Source> }) => {
  const { t, locale } = useI18n()
  if (sources.length === 0) return null
  return (
    <section aria-labelledby="sources" className="flex flex-col gap-3 border-t border-line pt-5">
      <h2 id="sources" className="text-[13px] font-bold tracking-[0.06em] text-muted uppercase">
        {t.content.sources}
      </h2>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-[14px] text-muted marker:font-bold">
        {sources.map((source) => (
          <li key={source.url} lang="en">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo underline-offset-2 hover:underline"
            >
              {source.title}
            </a>
            {source.publisher === undefined ? null : <span> · {source.publisher}</span>}
            {source.accessed === undefined ? null : (
              <span lang={locale}> · {t.content.accessed(formatIsoDate(source.accessed, locale))}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
