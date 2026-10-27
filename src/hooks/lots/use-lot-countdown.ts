"use client"

//* Libraries imports
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

//* Local imports
import {
  publicLotQueryKey,
  remainingLotTime,
} from "@/src/lib/lots/public-lot-room"

export function useLotCountdown(props: {
  lotId: string
  serverNow: Date
  target: Date | null
}) {
  const queryClient = useQueryClient()
  const serverTime = props.serverNow.getTime()
  const targetTime = props.target?.getTime() ?? null
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const reachedTarget = useRef<string | null>(null)

  useEffect(() => {
    if (targetTime === null) {
      return
    }

    const deadline = targetTime
    const offset = serverTime - Date.now()
    const reachedKey = `${props.lotId}:${deadline}`

    function tick() {
      const remaining = remainingLotTime(new Date(deadline), offset, Date.now())
      setRemainingMs(remaining)

      if (remaining === 0 && reachedTarget.current !== reachedKey) {
        reachedTarget.current = reachedKey
        void queryClient.refetchQueries({
          queryKey: publicLotQueryKey(props.lotId),
        })
      }
    }

    tick()
    const intervalId = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [props.lotId, queryClient, serverTime, targetTime])

  return remainingMs
}
