import { type DirectoryEntry, dialableNumber, displayName } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { CallButton, CopyButton } from "../../ui/CallActions.tsx"

const ExternalLink = ({ href, children }: { readonly href: string; readonly children: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-indigo underline-offset-2 hover:underline"
  >
    {children}
  </a>
)

/** One service: name, what it helps with, number and hours, with copy and call actions. */
export const DirectoryEntryRow = ({ entry }: { readonly entry: DirectoryEntry }) => {
  const { t, locale } = useI18n()
  const name = displayName(entry, locale)
  const number = dialableNumber(entry)
  const secondary = entry.shortCode !== null && entry.phone !== null ? entry.phone : null
  const helpsWith = entry.helpsWith.map((topic) => t.topics[topic]).join(", ")

  return (
    <li className="flex gap-3 border-b border-line py-4 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-[16px] leading-[22px] font-bold">
          {name}
          {entry.city === undefined ? null : <span className="font-normal text-muted"> · {entry.city}</span>}
        </p>
        {helpsWith === "" ? null : (
          <p className="text-[14px] leading-[20px] text-muted first-letter:uppercase">{helpsWith}</p>
        )}
        <p className="flex flex-wrap items-baseline gap-x-2 text-[14px] text-muted">
          {number === null ? (
            <span>{t.help.noNumber}</span>
          ) : (
            <span className="text-[16px] font-bold text-ink tabular-nums" dir="ltr">
              {number}
            </span>
          )}
          {secondary === null ? null : (
            <span className="tabular-nums" dir="ltr">
              {secondary}
            </span>
          )}
          {entry.hours === undefined ? null : (
            <span>
              <span className="sr-only">{t.help.hours}: </span>
              {entry.hours}
            </span>
          )}
          {entry.verified ? null : <span className="text-[13px] italic">· {t.common.notVerified}</span>}
        </p>
        <p className="flex flex-wrap gap-x-3 text-[14px]">
          {entry.url === undefined ? null : <ExternalLink href={entry.url}>{t.help.website}</ExternalLink>}
          {entry.whatsapp === undefined ? null : (
            <ExternalLink href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}>{t.help.whatsapp}</ExternalLink>
          )}
          {entry.email === undefined ? null : (
            <a href={`mailto:${entry.email}`} className="font-semibold text-indigo underline-offset-2 hover:underline">
              {t.help.email}
            </a>
          )}
        </p>
        {entry.notes === undefined ? null : (
          <details className="mt-1 text-[14px] text-muted">
            <summary className="cursor-pointer font-semibold text-indigo">{t.help.details}</summary>
            <p lang="en" className="mt-1">
              {entry.notes}
            </p>
          </details>
        )}
      </div>
      {number === null ? null : (
        <div className="flex shrink-0 items-start gap-2 pt-0.5">
          <CopyButton value={number} label={t.help.copyNumber(name)} />
          <CallButton number={number} label={t.help.callNumber(name)} tone={entry.emergency ? "sos" : "indigo"} />
        </div>
      )}
    </li>
  )
}
