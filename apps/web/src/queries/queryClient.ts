import { QueryClient } from "@tanstack/react-query"
import { shouldRetry } from "./queries.ts"

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false }
    }
  })
