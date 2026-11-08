import type { ReactNode } from "react"
import { BottomNav } from "./BottomNav.tsx"
import { Footer } from "./Footer.tsx"
import { Header } from "./Header.tsx"

/** Page frame: sticky header with Hide, centred column, mobile tab bar with SOS. */
export const AppShell = ({ children }: { readonly children: ReactNode }) => (
  <div className="flex min-h-dvh flex-col">
    <Header />
    <main
      id="main"
      className="mx-auto w-full max-w-(--container-page) lg:max-w-(--container-wide) flex-1 px-5 pt-2 lg:px-8"
    >
      {children}
    </main>
    <Footer />
    <BottomNav />
  </div>
)
