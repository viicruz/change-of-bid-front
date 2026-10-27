"use client"

//* Libraries imports
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient()

export const QUERY_KEYS = {
  CARDS: {
    ALL: "cards",
  },
  LOTS: {
    ALL: "lots",
    SINGLE: "lot",
    PRIVATE: "private",
  },
} as const

export async function queryInvalidator(queryKeys: (string | number)[][]) {
  await Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  )
}
