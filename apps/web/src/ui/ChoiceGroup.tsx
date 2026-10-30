import { useId } from "react"
import { cx } from "./cx.ts"

export interface Choice<T extends string> {
  readonly value: T
  readonly label: string
}

interface ChoiceGroupProps<T extends string> {
  readonly label: string
  readonly choices: ReadonlyArray<Choice<T>>
  readonly value: T
  readonly onChange: (value: T) => void
  /** `segmented`: equal-width tabs (journey); `chips`: scrolling pills (countries). */
  readonly variant: "segmented" | "chips"
}

/**
 * Single choice built on native radio inputs: arrow keys, focus and screen
 * reader semantics come from the browser; only the look is custom.
 */
export const ChoiceGroup = <T extends string>({ label, choices, value, onChange, variant }: ChoiceGroupProps<T>) => {
  const name = useId()
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{label}</legend>
      <div
        className={
          variant === "segmented"
            ? "grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-surface p-1"
            : "scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 py-1"
        }
      >
        {choices.map((choice) => (
          <label key={choice.value} className="relative flex shrink-0">
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={choice.value === value}
              onChange={() => onChange(choice.value)}
              className="peer sr-only"
            />
            <span
              className={cx(
                "flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full px-4 text-[15px] font-semibold whitespace-nowrap transition-colors",
                "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-marigold",
                variant === "segmented"
                  ? "text-muted hover:text-ink peer-checked:bg-ground peer-checked:text-indigo peer-checked:shadow-[0_1px_3px_rgba(23,20,43,0.12)]"
                  : "border border-line bg-ground text-ink hover:border-indigo peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ground"
              )}
            >
              {choice.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
