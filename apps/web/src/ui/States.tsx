import type { ReactNode } from "react"
import { isApiError } from "../api/index.ts"
import { useI18n } from "../i18n/index.ts"
import { Notice } from "./Notice.tsx"

export const LoadingState = ({ label }: { readonly label?: string }) => {
  const { t } = useI18n()
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3 py-6">
      <span className="sr-only">{label ?? t.common.loading}</span>
      <div className="h-5 w-2/3 animate-pulse rounded-full bg-surface" />
      <div className="h-5 w-full animate-pulse rounded-full bg-surface" />
      <div className="h-5 w-5/6 animate-pulse rounded-full bg-surface" />
    </div>
  )
}

export const ErrorState = ({
  error,
  onRetry,
  children
}: {
  readonly error: unknown
  readonly onRetry?: () => void
  readonly children?: ReactNode
}) => {
  const { t } = useI18n()
  const offline = isApiError(error) && error.kind === "network"
  return (
    <div className="flex flex-col gap-3 py-4">
      <Notice tone="warning" role="alert" title={offline ? t.errors.offline : t.errors.title}>
        {offline ? undefined : t.errors.body}
      </Notice>
      {onRetry === undefined ? null : (
        <button
          type="button"
          onClick={onRetry}
          className="min-h-11 self-start rounded-full bg-indigo px-5 text-[15px] font-bold text-ground hover:bg-deep"
        >
          {t.common.retry}
        </button>
      )}
      {children}
    </div>
  )
}
