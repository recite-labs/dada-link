import { useEffect, useState } from "react"
import { useI18n } from "../i18n/index.ts"
import { cx } from "./cx.ts"
import { CheckIcon, CopyIcon, PhoneIcon } from "./icons.tsx"

/** `tel:` URI for a number as published (spaces and dashes removed). */
export const telHref = (number: string): string => `tel:${number.replace(/[\s-]/g, "")}`

export const CallButton = ({
  number,
  label,
  tone = "indigo"
}: {
  readonly number: string
  readonly label: string
  readonly tone?: "indigo" | "sos"
}) => (
  <a
    href={telHref(number)}
    aria-label={label}
    className={cx(
      "flex size-11 shrink-0 items-center justify-center rounded-full text-ground transition-colors",
      tone === "sos" ? "bg-sos hover:bg-[#b81f33]" : "bg-indigo hover:bg-deep"
    )}
  >
    <PhoneIcon size={19} />
  </a>
)

/** Copies a number to the clipboard and confirms for a moment. */
export const CopyButton = ({ value, label }: { readonly value: string; readonly label: string }) => {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = () => {
    navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t.common.copied : label}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-indigo"
    >
      {copied ? <CheckIcon size={18} className="text-safe" /> : <CopyIcon size={18} />}
      <span aria-live="polite" className="sr-only">
        {copied ? t.common.copied : ""}
      </span>
    </button>
  )
}
