import type { ReactNode } from "react"
import { useI18n } from "../../i18n/index.ts"
import { RingsDecoration } from "../../ui/Logo.tsx"
import { PageHeader } from "../../ui/PageHeader.tsx"

const Section = ({ title, children }: { readonly title: string; readonly children: ReactNode }) => (
  <section className="flex flex-col gap-2">
    <h2 className="text-[20px] leading-[26px] font-extrabold tracking-snug">{title}</h2>
    <div className="text-[16px] text-muted">{children}</div>
  </section>
)

export const AboutPage = () => {
  const { t } = useI18n()
  const about = t.about
  return (
    <div className="reading-column flex flex-col gap-8 lg:pt-6">
      <PageHeader eyebrow={t.common.tagline} title={about.title} intro={about.intro} />
      <Section title={about.whatTitle}>
        <p>{about.whatBody}</p>
        <p className="mt-2">{about.channelsBody}</p>
      </Section>
      <section className="relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-deep p-5 text-ground">
        <RingsDecoration className="absolute -right-10 -bottom-12 -z-10 opacity-60" />
        <h2 className="text-[20px] leading-[26px] font-extrabold tracking-snug">{about.privacyTitle}</h2>
        <ul className="mt-3 flex flex-col gap-2.5 text-[15px] text-lilac">
          {about.privacyItems.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-marigold" />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <Section title={about.whoTitle}>
        <p>{about.whoBody}</p>
      </Section>
      <Section title={about.openSourceTitle}>
        <p>{about.openSourceBody}</p>
      </Section>
      <Section title={about.translationsTitle}>
        <p>{about.translationsBody}</p>
      </Section>
    </div>
  )
}
