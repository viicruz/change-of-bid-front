"use client"

//* Libraries imports
import { QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

export function QueryProvider(props: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
