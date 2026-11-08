import type { LocalizedContent } from "@dadalink/domain"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { useI18n } from "../../i18n/index.ts"
import { ChatIcon } from "../../ui/icons.tsx"
import { Markdown } from "../../ui/Markdown.tsx"
import { Notice } from "../../ui/Notice.tsx"
import { SourcesList } from "./SourcesList.tsx"

/**
 * A reviewed article or rights page. Sensitive topics open with a calm content
 * note; English fallbacks and drafts are labelled honestly.
 */
export const ArticleView = ({
  content,
  eyebrow,
  beforeTitle
}: {
  readonly content: LocalizedContent
  readonly eyebrow?: ReactNode
  readonly beforeTitle?: ReactNode
}) => {
  const { t, locale } = useI18n()
  const fallback = content.locale !== content.requestedLocale

  return (
    <article className="reading-column flex flex-col gap-5 pt-2 lg:pt-6" lang={content.locale}>
      {beforeTitle}
      <header className="flex flex-col gap-2">
        {eyebrow === undefined ? null : (
          <p lang={locale} className="text-[13px] font-bold tracking-[0.06em] text-indigo uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[30px] leading-[36px] font-extrabold tracking-tight text-balance sm:text-[34px] sm:leading-[40px]">
          {content.title}
        </h1>
        <p className="text-[17px] text-muted">{content.summary}</p>
        {content.status === "reviewed" ? null : (
          <p lang={locale} className="text-[13px] text-muted italic">
            {t.content.draft}
          </p>
        )}
      </header>

      <div lang={locale} className="flex flex-col gap-3 empty:hidden">
        {content.sensitive ? (
          <Notice tone="warning" title={t.content.sensitiveTitle}>
            {t.content.sensitiveBody}
          </Notice>
        ) : null}
        {fallback ? <Notice>{t.content.fallbackLanguage}</Notice> : null}
      </div>

      <Markdown className="leading-[1.65]">{content.body}</Markdown>

      <Link
        to="/$locale/ask"
        params={{ locale }}
        lang={locale}
        className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-deep px-5 text-[16px] font-bold text-ground hover:bg-indigo"
      >
        <ChatIcon size={19} className="text-marigold" />
        {t.content.askAbout}
      </Link>

      <div lang={locale}>
        <SourcesList sources={content.sources} />
      </div>
    </article>
  )
}
