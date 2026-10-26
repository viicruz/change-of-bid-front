"use client"

//* Libraries imports
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient()

export const QUERY_KEYS = {
  CARDS: {
    ALL: "cards",
  },
} as const
