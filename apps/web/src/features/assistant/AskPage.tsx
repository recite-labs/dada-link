import { useI18n } from "../../i18n/index.ts"
import { usePreferences } from "../../preferences/index.ts"
import { LogoMark } from "../../ui/Logo.tsx"
import { useChat } from "./ChatProvider.tsx"
import { Composer } from "./Composer.tsx"
import { Conversation } from "./Conversation.tsx"
import { Disclaimer } from "./Disclaimer.tsx"

const Suggestions = ({ onPick }: { readonly onPick: (question: string) => void }) => {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-[22px] leading-[28px] font-extrabold tracking-snug">{t.ask.emptyTitle}</h2>
        <p className="text-[15px] text-muted">{t.ask.emptyBody}</p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {t.ask.suggestions.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPick(suggestion)}
              className="rounded-full border border-line px-4 py-2.5 text-left text-[15px] font-semibold text-indigo hover:border-indigo"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const AskPage = () => {
  const { t, locale } = useI18n()
  const { country, journey } = usePreferences()
  const chat = useChat()
  const ask = (question: string) => chat.ask(question, { locale, country, phase: journey })

  return (
    <div className="reading-column flex min-h-[calc(100dvh-10rem)] flex-col">
      <header className="flex items-center gap-3 pt-2 pb-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-deep">
          <LogoMark size={28} />
        </span>
        <div>
          <h1 className="text-[22px] leading-[28px] font-extrabold tracking-snug">{t.ask.title}</h1>
          <p className="flex items-center gap-1.5 text-[14px] text-muted">
            <span className="size-2 rounded-full bg-safe" aria-hidden="true" />
            {t.ask.subtitle}
          </p>
        </div>
      </header>

      <div className="flex-1">
        {chat.state.turns.length === 0 ? (
          <Suggestions onPick={ask} />
        ) : (
          <Conversation turns={chat.state.turns} onRetry={ask} />
        )}
      </div>

      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] mt-6 flex flex-col gap-2 bg-ground pt-2 pb-2 md:bottom-0 md:pb-4">
        <Disclaimer />
        <Composer onSend={ask} disabled={chat.busy} />
      </div>
    </div>
  )
}
