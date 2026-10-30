import { createContext, type ReactNode, use, useCallback, useMemo, useState } from "react"
import { usePreferences } from "../../preferences/index.ts"
import { EmergencySheet } from "./EmergencySheet.tsx"

interface EmergencyValue {
  readonly open: () => void
}

const EmergencyContext = createContext<EmergencyValue | null>(null)

/** Lets any SOS entry (bottom bar, home card, chat) open the emergency numbers. */
export const EmergencyProvider = ({ children }: { readonly children: ReactNode }) => {
  const { country } = usePreferences()
  const [isOpen, setOpen] = useState(false)
  const open = useCallback(() => setOpen(true), [])
  const value = useMemo(() => ({ open }), [open])
  return (
    <EmergencyContext value={value}>
      {children}
      {isOpen ? <EmergencySheet country={country} onClose={() => setOpen(false)} /> : null}
    </EmergencyContext>
  )
}

export const useEmergency = (): EmergencyValue => {
  const value = use(EmergencyContext)
  if (value === null) throw new Error("useEmergency must be used inside <EmergencyProvider>")
  return value
}
