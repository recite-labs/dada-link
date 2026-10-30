import { messagesFor, negotiateLocale } from "../../i18n/index.ts"

/** Last-resort error screen: no providers assumed, so it reads the catalogue directly. */
export const RootError = () => {
  const t = messagesFor(negotiateLocale(typeof navigator === "undefined" ? [] : navigator.languages))
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-5 py-16">
      <h1 className="text-[28px] font-extrabold tracking-tight">{t.errors.title}</h1>
      <p className="text-muted">{t.errors.body}</p>
      <a href="/" className="self-start rounded-full bg-indigo px-6 py-3 font-bold text-ground">
        {t.errors.goHome}
      </a>
    </main>
  )
}
