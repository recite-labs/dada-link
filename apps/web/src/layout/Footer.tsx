import { Link } from "@tanstack/react-router"
import { useI18n } from "../i18n/index.ts"
import { LogoMark } from "../ui/Logo.tsx"

export const Footer = () => {
  const { t, locale } = useI18n()
  return (
    <footer className="mx-auto mt-12 flex w-full max-w-(--container-page) flex-col gap-2 px-5 pt-6 pb-28 text-[13px] text-muted md:pb-10">
      <div className="flex items-center gap-2">
        <LogoMark size={22} />
        <span>{t.common.tagline}</span>
      </div>
      <p>
        {t.footer.madeBy} ·{" "}
        <Link to="/$locale/about" params={{ locale }} className="underline underline-offset-2 hover:text-ink">
          {t.nav.about}
        </Link>{" "}
        ·{" "}
        <Link to="/$locale/privacy" params={{ locale }} className="underline underline-offset-2 hover:text-ink">
          {t.nav.privacy}
        </Link>
      </p>
      {t.meta.status === "draft-ai" ? <p>{t.footer.draftNotice}</p> : null}
    </footer>
  )
}
