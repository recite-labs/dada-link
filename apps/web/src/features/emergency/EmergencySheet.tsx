import type { Country } from "@dadalink/domain"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { APP_CONFIG } from "../../config.ts"
import { useI18n } from "../../i18n/index.ts"
import { useApi } from "../../queries/ApiProvider.tsx"
import { directoryQueries } from "../../queries/queries.ts"
import { CloseIcon } from "../../ui/icons.tsx"
import { Notice } from "../../ui/Notice.tsx"
import { LoadingState } from "../../ui/States.tsx"
import { EmergencyContactList } from "./EmergencyContactList.tsx"

/**
 * Emergency numbers for the selected country. The web cannot send an SOS
 * message, so it shows numbers to call and points to the app.
 */
export const EmergencySheet = ({ country, onClose }: { readonly country: Country; readonly onClose: () => void }) => {
  const { t, locale } = useI18n()
  const api = useApi()
  const contacts = useQuery(directoryQueries.emergency(api, country, locale))
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<Element | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    returnFocus.current = document.activeElement
    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t.common.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-title"
        className="relative flex max-h-[92dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-[var(--radius-panel)] bg-ground p-5 pb-8 sm:rounded-[var(--radius-panel)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold tracking-[0.06em] text-sos uppercase">SOS</p>
            <h2 id="emergency-title" className="text-[26px] leading-[32px] font-extrabold tracking-tight">
              {t.emergency.title}
            </h2>
            <p className="text-[15px] text-muted">{t.emergency.subtitle(t.countries[country])}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {contacts.isPending ? (
          <LoadingState />
        ) : contacts.isError || contacts.data.length === 0 ? (
          <Notice tone="danger" role="alert" title={t.emergency.noNumbers} />
        ) : (
          <EmergencyContactList contacts={contacts.data} />
        )}

        <Notice tone="info">{t.emergency.webNote}</Notice>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={APP_CONFIG.androidAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center rounded-full bg-indigo px-4 text-center text-[15px] font-bold text-ground hover:bg-deep"
          >
            {t.emergency.getApp}
          </a>
          <Link
            to="/$locale/help/$country"
            params={{ locale, country }}
            onClick={onClose}
            className="flex min-h-12 items-center justify-center rounded-full border border-line px-4 text-center text-[15px] font-bold text-indigo hover:border-indigo"
          >
            {t.emergency.allNumbers}
          </Link>
        </div>
      </div>
    </div>
  )
}
