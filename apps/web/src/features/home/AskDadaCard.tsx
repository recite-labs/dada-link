import { useNavigate } from "@tanstack/react-router"
import { type FormEvent, useState } from "react"
import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { SendIcon } from "../../ui/icons.tsx"
import { RingsDecoration } from "../../ui/Logo.tsx"
import { useChat } from "../assistant/ChatProvider.tsx"

/** Starts a conversation from Home; the question is handed over in memory, never through the URL. */
export const AskDadaCard = () => {
  const { t, locale } = useI18n()
  const { country, journey } = usePreferences()
  const chat = useChat()
  const navigate = useNavigate()
  const [question, setQuestion] = useState("")

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (question.trim() !== "") chat.ask(question, { locale, country, phase: journey })
    void navigate({ to: "/$locale/ask", params: { locale } })
  }

  return (
    <section className="relative isolate overflow-hidden rounded-[var(--radius-panel)] bg-deep p-5 text-ground">
      <RingsDecoration className="absolute -top-8 -right-8 -z-10" />
      <h2 className="text-[22px] leading-[28px] font-extrabold tracking-snug">{t.home.askTitle}</h2>
      <p className="mt-1.5 max-w-[17rem] text-[15px] text-lilac">{t.home.askBody}</p>
      <form onSubmit={submit} className="mt-4 flex h-13 items-center gap-2 rounded-full bg-ground pr-1.5 pl-4">
        <label htmlFor="home-question" className="sr-only">
          {t.home.askTitle}
        </label>
        <input
          id="home-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={t.home.askPlaceholder}
          maxLength={2000}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          aria-label={t.home.askSubmit}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo text-ground hover:bg-deep"
        >
          <SendIcon size={18} strokeWidth={2.4} />
        </button>
      </form>
    </section>
  )
}
