export interface QuickExitDeps {
  /** In-memory state to forget first (conversation, cached answers). */
  readonly cleanups: ReadonlyArray<() => void>
  readonly history: Pick<History, "replaceState">
  readonly location: Pick<Location, "replace">
  readonly sessionStorage: Pick<Storage, "clear"> | undefined
  readonly neutralUrl: string
}

/**
 * Leaves DadaLink immediately: forgets in-memory data, rewrites the current
 * history entry to a bare path, then replaces the page with a neutral site so
 * "Back" does not return to the page she was reading. Browser history of
 * earlier pages cannot be erased by a website (documented on the About page).
 */
export const quickExit = (deps: QuickExitDeps): void => {
  for (const cleanup of deps.cleanups) {
    try {
      cleanup()
    } catch {
      // Leaving matters more than cleaning up.
    }
  }
  try {
    deps.sessionStorage?.clear()
    deps.history.replaceState(null, "", "/")
  } catch {
    // Ignore: some embedded browsers restrict history and storage.
  }
  deps.location.replace(deps.neutralUrl)
}
