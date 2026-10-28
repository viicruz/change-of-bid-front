"use client"

//* Libraries imports
import { useSyncExternalStore } from "react"

const subscribeNoop = () => () => {}

//* Things like `resolvedTheme` are only known on the client, so wait for hydration
export function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}
