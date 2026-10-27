"use client"

//* Libraries imports
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import * as z from "zod"

//* Hooks imports
import { publicLotLiveMessageSchema } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import { ApiError } from "@/src/lib/api"
import {
  applyPublicLotLiveMessage,
  publicLotLiveUrl,
  publicLotQueryKey,
} from "@/src/lib/lots/public-lot-room"

const initialBackoffMs = 1000
const maxBackoffMs = 15_000

export type PublicLotLiveStatus =
  "idle" | "connecting" | "open" | "reconnecting" | "unavailable" | "stopped"

function isTerminalPublicLotError(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 422)
  )
}

function closeCode(event: Event) {
  if ("code" in event && typeof event.code === "number") {
    return event.code
  }

  return 1006
}

function messageData(event: Event) {
  if ("data" in event) {
    return event.data
  }

  return undefined
}

export function usePublicLotLive(lotId: string) {
  const queryClient = useQueryClient()
  const lotIdIsUuid = z.uuid().safeParse(lotId).success
  const [status, setStatus] = useState<PublicLotLiveStatus>(
    lotIdIsUuid ? "connecting" : "idle"
  )
  const [trackedLotId, setTrackedLotId] = useState(lotId)

  if (trackedLotId !== lotId) {
    setTrackedLotId(lotId)
    setStatus(lotIdIsUuid ? "connecting" : "idle")
  }

  useEffect(() => {
    if (!lotIdIsUuid) {
      return
    }

    let disposed = false
    let opened = false
    let attempt = 0
    let socket: WebSocket | null = null
    let retryTimer: number | undefined

    function clearRetry() {
      if (retryTimer === undefined) {
        return
      }

      window.clearTimeout(retryTimer)
      retryTimer = undefined
    }

    function scheduleRetry(nextStatus: "reconnecting" | "unavailable") {
      if (disposed) {
        return
      }

      const delay = Math.min(maxBackoffMs, initialBackoffMs * 2 ** attempt)
      attempt += 1
      setStatus(nextStatus)
      retryTimer = window.setTimeout(() => {
        connect()
      }, delay)
    }

    function branchClosedSocket(
      error: unknown,
      queryStatus: string | undefined
    ) {
      if (disposed) {
        return
      }

      if (queryStatus === "error" && isTerminalPublicLotError(error)) {
        setStatus("stopped")
        return
      }

      scheduleRetry("unavailable")
    }

    async function handleNeverOpened() {
      if (disposed) {
        return
      }

      let queryState = queryClient.getQueryState(publicLotQueryKey(lotId))

      if (queryState === undefined || queryState.status === "pending") {
        await queryClient.refetchQueries({
          queryKey: publicLotQueryKey(lotId),
        })

        if (disposed) {
          return
        }

        queryState = queryClient.getQueryState(publicLotQueryKey(lotId))
      }

      branchClosedSocket(queryState?.error, queryState?.status)
    }

    function connect() {
      if (disposed) {
        return
      }

      const previous = socket
      socket = null
      previous?.close(1000)

      opened = false
      let handled = false
      const currentSocket = new WebSocket(publicLotLiveUrl(lotId))
      socket = currentSocket

      currentSocket.addEventListener("open", () => {
        if (disposed || socket !== currentSocket) {
          return
        }

        opened = true
        attempt = 0
        setStatus("open")
      })

      currentSocket.addEventListener("message", (event) => {
        if (disposed || socket !== currentSocket) {
          return
        }

        const data = messageData(event)

        if (typeof data !== "string") {
          return
        }

        let payload: unknown

        try {
          payload = JSON.parse(data)
        } catch {
          return
        }

        const parsed = publicLotLiveMessageSchema.safeParse(payload)

        if (!parsed.success) {
          return
        }

        applyPublicLotLiveMessage(queryClient, lotId, parsed.data)
      })

      currentSocket.addEventListener("close", (event) => {
        if (disposed || socket !== currentSocket || handled) {
          return
        }

        handled = true

        if (closeCode(event) === 1000) {
          return
        }

        if (!opened) {
          void handleNeverOpened()
          return
        }

        scheduleRetry("reconnecting")
      })
    }

    connect()

    return () => {
      disposed = true
      clearRetry()
      socket?.close(1000)
    }
  }, [lotId, lotIdIsUuid, queryClient])

  return status
}
