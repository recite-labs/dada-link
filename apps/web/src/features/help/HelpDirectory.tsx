import type { DirectoryEntry } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { cx } from "../../ui/cx.ts"
import { Notice } from "../../ui/Notice.tsx"
import { DirectoryEntryRow } from "./DirectoryEntryRow.tsx"
import { groupDirectory } from "./groupDirectory.ts"

/** The directory for one country, grouped by need. Emergency numbers sit in a tinted block on top. */
export const HelpDirectory = ({ entries }: { readonly entries: ReadonlyArray<DirectoryEntry> }) => {
  const { t } = useI18n()
  const sections = groupDirectory(entries)
  if (sections.length === 0) return <Notice title={t.help.empty} />

  return (
    <div className="flex flex-col gap-6 lg:gap-10">
      {sections.map((section) => (
        <section
          key={section.group}
          aria-labelledby={`group-${section.group}`}
          className={
            section.group === "emergency" ? "rounded-[var(--radius-panel)] bg-sos-tint px-4 lg:px-6" : undefined
          }
        >
          <h2
            id={`group-${section.group}`}
            className={
              section.group === "emergency"
                ? "pt-4 text-[13px] font-bold tracking-[0.06em] text-sos uppercase"
                : "text-[13px] font-bold tracking-[0.06em] text-muted uppercase"
            }
          >
            {t.help.groups[section.group]}
          </h2>
          <ul
            className={cx(
              "lg:grid lg:grid-cols-2 lg:gap-x-10 lg:[&>li:nth-last-child(2):nth-child(odd)]:border-b-0",
              section.group === "emergency" && "[&>li]:border-sos/15"
            )}
          >
            {section.entries.map((entry) => (
              <DirectoryEntryRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </section>
      ))}
      <Notice>{t.help.unverifiedNote}</Notice>
    </div>
  )
}
