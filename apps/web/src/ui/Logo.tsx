/** Two interlocking rings: indigo (her) and marigold (the sister beside her). */
export const LogoMark = ({ size = 30 }: { readonly size?: number }) => (
  <svg width={size} height={(size * 22) / 30} viewBox="0 0 30 22" aria-hidden="true" className="shrink-0">
    <circle cx="11" cy="11" r="8" fill="none" stroke="var(--color-indigo)" strokeWidth="3.2" />
    <circle cx="19" cy="11" r="8" fill="none" stroke="var(--color-marigold)" strokeWidth="3.2" />
  </svg>
)

export const Wordmark = () => (
  <span className="flex items-center gap-2">
    <LogoMark />
    <span className="text-[21px] leading-[26px] font-extrabold tracking-tight text-ink" lang="en">
      DadaLink
    </span>
  </span>
)

/** Large decorative rings used on dark panels (Ask Dada card). */
export const RingsDecoration = ({ className = "" }: { readonly className?: string }) => (
  <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" className={className}>
    <circle cx="60" cy="75" r="48" fill="none" stroke="var(--color-indigo)" strokeWidth="14" />
    <circle cx="95" cy="75" r="48" fill="none" stroke="var(--color-marigold)" strokeWidth="14" opacity="0.9" />
  </svg>
)
