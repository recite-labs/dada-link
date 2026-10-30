import type { EmergencyNotice } from "@dadalink/domain"
import { useI18n } from "../../i18n/index.ts"
import { AlertIcon } from "../../ui/icons.tsx"
import { EmergencyContactList } from "../emergency/EmergencyContactList.tsx"

/** Shown above the answer whenever danger is detected: the server's fixed message plus numbers to call. */
export const EmergencyNoticeCard = ({ notice }: { readonly notice: EmergencyNotice }) => {
  const { t } = useI18n()
  return (
    <section
      role="alert"
      aria-labelledby="emergency-notice"
      className="flex flex-col gap-3 rounded-[var(--radius-panel)] border-2 border-sos bg-ground p-4"
    >
      <div className="flex items-start gap-3">
        <AlertIcon size={22} className="mt-0.5 shrink-0 text-sos" />
        <div className="flex flex-col gap-1">
          <h3 id="emergency-notice" className="text-[17px] font-extrabold text-sos">
            {t.ask.emergencyTitle}
          </h3>
          <p className="text-[16px] font-semibold">{notice.message}</p>
        </div>
      </div>
      {notice.contacts.length > 0 ? <EmergencyContactList contacts={notice.contacts} /> : null}
    </section>
  )
}
