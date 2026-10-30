import type { EmergencyContact } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { telHref } from "../../ui/CallActions.tsx"
import { PhoneIcon } from "../../ui/icons.tsx"

/** Big emergency numbers: each row is one large tap target that dials. */
export const EmergencyContactList = ({ contacts }: { readonly contacts: ReadonlyArray<EmergencyContact> }) => {
  const { t } = useI18n()
  return (
    <ul className="flex flex-col gap-2">
      {contacts.map((contact) => (
        <li key={`${contact.kind}-${contact.phone}`}>
          <a
            href={telHref(contact.phone)}
            aria-label={t.emergency.callNumber(contact.name, contact.phone)}
            className="flex items-center gap-3 rounded-[var(--radius-card)] bg-sos-tint p-3 pl-4 transition-colors hover:bg-[#f8d5da]"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[28px] leading-[32px] font-extrabold tracking-tight tabular-nums">
                {contact.phone}
              </span>
              <span className="truncate text-[14px] text-muted">{contact.name}</span>
            </span>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sos text-ground">
              <PhoneIcon size={19} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
