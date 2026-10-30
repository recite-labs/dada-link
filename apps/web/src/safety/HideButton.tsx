import { useQueryClient } from "@tanstack/react-query"
import { APP_CONFIG } from "../config.ts"
import { useChat } from "../features/assistant/ChatProvider.tsx"
import { useI18n } from "../i18n/index.ts"
import { EyeOffIcon } from "../ui/icons.tsx"
import { quickExit } from "./quickExit.ts"

/** Always-visible quick exit. One tap: no confirmation, no animation. */
export const HideButton = () => {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const chat = useChat()

  const hide = () =>
    quickExit({
      cleanups: [chat.reset, () => queryClient.clear()],
      history: window.history,
      location: window.location,
      sessionStorage: window.sessionStorage,
      neutralUrl: APP_CONFIG.quickExitUrl
    })

  return (
    <button
      type="button"
      onClick={hide}
      title={t.hide.description}
      aria-label={`${t.hide.label} — ${t.hide.description}`}
      className="flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-3.5 text-[14px] font-bold text-ground hover:bg-deep"
    >
      <EyeOffIcon size={16} strokeWidth={2.4} />
      {t.hide.label}
    </button>
  )
}
