import type { ReactNode } from "react"

export const PageHeader = ({
  eyebrow,
  title,
  intro,
  aside
}: {
  readonly eyebrow?: ReactNode
  readonly title: ReactNode
  readonly intro?: ReactNode
  readonly aside?: ReactNode
}) => (
  <header className="flex flex-col gap-2 pt-2 pb-5">
    {eyebrow === undefined ? null : (
      <p className="text-[13px] font-bold tracking-[0.06em] text-indigo uppercase">{eyebrow}</p>
    )}
    <div className="flex flex-wrap items-start justify-between gap-3">
      <h1 className="text-[30px] leading-[36px] font-extrabold tracking-tight text-balance sm:text-[36px] sm:leading-[42px]">
        {title}
      </h1>
      {aside}
    </div>
    {intro === undefined ? null : <p className="max-w-prose text-[16px] text-muted">{intro}</p>}
  </header>
)
