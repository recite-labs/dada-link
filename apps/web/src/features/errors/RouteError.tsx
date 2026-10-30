import { type ErrorComponentProps, useRouter } from "@tanstack/react-router"
import { ErrorState } from "../../ui/States.tsx"

/** Error inside a page: the shell (Hide, SOS) stays usable; retry reloads the route's data. */
export const RouteError = ({ error, reset }: ErrorComponentProps) => {
  const router = useRouter()
  const retry = () => {
    reset()
    void router.invalidate()
  }
  return <ErrorState error={error} onRetry={retry} />
}
