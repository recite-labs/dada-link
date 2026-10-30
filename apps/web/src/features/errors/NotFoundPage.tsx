import { Link } from "@tanstack/react-router"
import { useI18n } from "../../i18n/index.ts"
import { PageHeader } from "../../ui/PageHeader.tsx"

export const NotFoundPage = () => {
  const { t, locale } = useI18n()
  return (
    <div className="flex flex-col gap-4 py-6">
      <PageHeader eyebrow="404" title={t.errors.notFoundTitle} intro={t.errors.notFoundBody} />
      <Link
        to="/$locale"
        params={{ locale }}
        className="flex min-h-12 items-center justify-center self-start rounded-full bg-indigo px-6 text-[15px] font-bold text-ground hover:bg-deep"
      >
        {t.errors.goHome}
      </Link>
    </div>
  )
}
