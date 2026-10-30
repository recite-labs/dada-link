import { MAX_QUESTION_LENGTH } from "@dadalink/domain"
import { type FormEvent, type KeyboardEvent, useState } from "react"
import { useI18n } from "../../i18n/index.ts"
import { SendIcon } from "../../ui/icons.tsx"

/** Question input. Enter sends, Shift+Enter adds a line; disabled while Dada is answering. */
export const Composer = ({
  onSend,
  disabled
}: {
  readonly onSend: (question: string) => void
  readonly disabled: boolean
}) => {
  const { t } = useI18n()
  const [question, setQuestion] = useState("")
  const empty = question.trim() === ""

  const send = () => {
    if (empty || disabled) return
    onSend(question)
    setQuestion("")
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    send()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 rounded-[26px] bg-surface p-1.5 pl-4">
      <label htmlFor="ask-question" className="sr-only">
        {t.ask.placeholder}
      </label>
      <textarea
        id="ask-question"
        rows={1}
        value={question}
        maxLength={MAX_QUESTION_LENGTH}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t.ask.placeholder}
        className="field-sizing-content max-h-40 min-h-10 flex-1 resize-none bg-transparent py-2 text-[16px] placeholder:text-muted focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || empty}
        aria-label={t.ask.send}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo text-ground transition-opacity hover:bg-deep disabled:opacity-40"
      >
        <SendIcon size={18} strokeWidth={2.4} />
      </button>
    </form>
  )
}
