import { useI18n } from "../../i18n/index.ts"
import { Markdown } from "../../ui/Markdown.tsx"
import { CitationCards } from "./CitationCards.tsx"
import type { Turn } from "./chatReducer.ts"
import { EmergencyNoticeCard } from "./EmergencyNoticeCard.tsx"
import { TurnError } from "./TurnError.tsx"

const TypingDots = ({ label }: { readonly label: string }) => (
  <span role="status" className="flex items-center gap-1.5 py-1">
    <span className="sr-only">{label}</span>
    {[0, 150, 300].map((delay) => (
      <span
        key={delay}
        className="size-2 animate-bounce rounded-full bg-indigo/60"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </span>
)

/** One exchange: her question on the right, Dada's answer (emergency first) on the left. */
export const TurnView = ({ turn, onRetry }: { readonly turn: Turn; readonly onRetry: (question: string) => void }) => {
  const { t } = useI18n()
  const streaming = turn.status === "waiting" || turn.status === "streaming"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[20px] rounded-br-md bg-indigo px-4 py-3 text-[16px] whitespace-pre-wrap text-ground">
          <span className="sr-only">{t.ask.you}: </span>
          {turn.question}
        </p>
      </div>

      {turn.emergency === null ? null : <EmergencyNoticeCard notice={turn.emergency} />}

      {turn.status === "failed" && turn.error !== undefined ? (
        <TurnError kind={turn.error} onRetry={() => onRetry(turn.question)} />
      ) : (
        <article
          aria-busy={streaming}
          className="flex max-w-[92%] flex-col gap-4 rounded-[20px] rounded-bl-md bg-surface px-4 py-3"
        >
          <span className="sr-only">{t.ask.dada}:</span>
          {turn.answer === "" ? <TypingDots label={t.ask.thinking} /> : <Markdown>{turn.answer}</Markdown>}
          {turn.status === "done" ? <CitationCards citations={turn.citations} /> : null}
        </article>
      )}
    </div>
  )
}
