import type { EmergencyContact } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { CallButton, telHref } from "../../ui/CallActions.tsx"

/** Big, tappable emergency numbers. The whole row dials; the red button is the obvious target. */
export const EmergencyContactList = ({ contacts }: { readonly contacts: ReadonlyArray<EmergencyContact> }) => {
  const { t } = useI18n()
  return (
    <ul className="flex flex-col gap-2">
      {contacts.map((contact) => (
        <li
          key={`${contact.kind}-${contact.phone}`}
          className="flex items-center gap-3 rounded-[var(--radius-card)] bg-sos-tint p-3 pl-4"
        >
          <a href={telHref(contact.phone)} className="flex min-w-0 flex-1 flex-col">
            <span className="text-[28px] leading-[32px] font-extrabold tracking-tight tabular-nums">
              {contact.phone}
            </span>
            <span className="truncate text-[14px] text-muted">{contact.name}</span>
          </a>
          <CallButton tone="sos" number={contact.phone} label={t.emergency.callNumber(contact.name, contact.phone)} />
        </li>
      ))}
    </ul>
  )
}
