import { useEffect, useRef } from "react"
import type { Turn } from "./chatReducer.ts"
import { TurnView } from "./TurnView.tsx"

/** The session's exchanges; scrolls to a new question when it is asked. */
export const Conversation = ({
  turns,
  onRetry
}: {
  readonly turns: ReadonlyArray<Turn>
  readonly onRetry: (question: string) => void
}) => {
  const lastRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (turns.length > 0) lastRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" })
  }, [turns.length])

  return (
    <ol className="flex flex-col gap-6">
      {turns.map((turn, index) => (
        <li key={turn.id} ref={index === turns.length - 1 ? lastRef : undefined} className="scroll-mt-20">
          <TurnView turn={turn} onRetry={onRetry} />
        </li>
      ))}
    </ol>
  )
}
