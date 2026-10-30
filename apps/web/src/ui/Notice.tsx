import type { ReactNode } from "react"
import { cx } from "./cx.ts"
import { AlertIcon, CheckIcon, InfoIcon } from "./icons.tsx"

export type NoticeTone = "info" | "warning" | "danger" | "safe"

const TONES: Record<NoticeTone, { readonly box: string; readonly icon: string }> = {
  info: { box: "bg-surface text-ink", icon: "text-indigo" },
  warning: { box: "bg-marigold-tint text-ink", icon: "text-marigold-ink" },
  danger: { box: "bg-sos-tint text-ink", icon: "text-sos" },
  safe: { box: "bg-safe-tint text-ink", icon: "text-safe" }
}

const ICONS: Record<NoticeTone, typeof InfoIcon> = {
  info: InfoIcon,
  warning: AlertIcon,
  danger: AlertIcon,
  safe: CheckIcon
}

/** Calm, tinted callout. Use `danger` only for emergencies. */
export const Notice = ({
  tone = "info",
  title,
  children,
  role
}: {
  readonly tone?: NoticeTone
  readonly title?: ReactNode
  readonly children?: ReactNode
  readonly role?: "note" | "alert" | "status"
}) => {
  const Icon = ICONS[tone]
  return (
    <div role={role ?? "note"} className={cx("flex gap-3 rounded-[var(--radius-card)] p-4", TONES[tone].box)}>
      <Icon size={20} className={cx("mt-0.5 shrink-0", TONES[tone].icon)} />
      <div className="flex min-w-0 flex-col gap-1 text-[15px]">
        {title === undefined ? null : <p className="font-bold">{title}</p>}
        {children === undefined ? null : <div className="text-muted">{children}</div>}
      </div>
    </div>
  )
}
