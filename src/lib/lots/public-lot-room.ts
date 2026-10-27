//* Libraries imports
import type { QueryClient } from "@tanstack/react-query"

//* Hooks imports
import type {
  PublicLotLiveMessage,
  ShowLot,
} from "@/src/hooks/lots/queries/use-show-lot"

//* Env imports
import { env } from "@/src/env/client"

//* Local imports
import { QUERY_KEYS } from "@/src/lib/query-client"

export function publicLotQueryKey(lotId: string) {
  return [QUERY_KEYS.LOTS.ALL, QUERY_KEYS.LOTS.SINGLE, lotId] as const
}

export function publicLotLiveUrl(
  lotId: string,
  baseUrl = env.NEXT_PUBLIC_BACKEND_URL
) {
  const base = baseUrl.replace(/\/$/, "")
  const url = new URL(`${base}/public/lots/${lotId}/live`)

  url.protocol =
    url.protocol === "https:" || url.protocol === "wss:" ? "wss:" : "ws:"
  url.search = ""
  url.hash = ""

  return url.toString()
}

function viewerFromRead(body: ShowLot, cached: ShowLot | undefined) {
  return body.viewerParticipantNo ?? cached?.viewerParticipantNo ?? null
}

export function mergePublicLotRead(
  cached: ShowLot | undefined,
  body: ShowLot
): ShowLot {
  const viewerParticipantNo = viewerFromRead(body, cached)

  if (
    cached !== undefined &&
    cached.serverNow.getTime() > body.serverNow.getTime()
  ) {
    return {
      ...cached,
      viewerParticipantNo,
    }
  }

  return {
    ...body,
    viewerParticipantNo,
  }
}

export function applyPublicLotLiveMessage(
  queryClient: QueryClient,
  lotId: string,
  message: PublicLotLiveMessage
) {
  queryClient.setQueryData<ShowLot>(publicLotQueryKey(lotId), (current) => {
    if (
      current !== undefined &&
      current.serverNow.getTime() > message.serverNow.getTime()
    ) {
      return current
    }

    return {
      serverNow: message.serverNow,
      viewerParticipantNo: current?.viewerParticipantNo ?? null,
      lot: message.lot,
    }
  })
}

export function rememberViewerParticipant(
  queryClient: QueryClient,
  lotId: string,
  viewerParticipantNo: number
) {
  queryClient.setQueryData<ShowLot>(publicLotQueryKey(lotId), (current) => {
    if (current === undefined) {
      return current
    }

    if (current.viewerParticipantNo !== null) {
      return current
    }

    return {
      ...current,
      viewerParticipantNo,
    }
  })
}

export function viewerPlacedLastBid(room: ShowLot) {
  const lastBid = room.lot.bids.at(-1) ?? null

  return (
    room.viewerParticipantNo !== null &&
    lastBid !== null &&
    lastBid.participantNo === room.viewerParticipantNo
  )
}

export function viewerWasJustOutbid(room: ShowLot) {
  const lastBid = room.lot.bids.at(-1) ?? null
  const previousBid = room.lot.bids.at(-2) ?? null

  return (
    room.viewerParticipantNo !== null &&
    previousBid !== null &&
    previousBid.participantNo === room.viewerParticipantNo &&
    lastBid?.participantNo !== room.viewerParticipantNo
  )
}

export function publicLotCountdownTarget(lot: ShowLot["lot"]) {
  if (lot.status === "SCHEDULED") {
    return lot.startsAt
  }

  if (lot.status === "LIVE") {
    return lot.endsAt
  }

  return null
}

export function remainingLotTime(target: Date, offset: number, now: number) {
  return Math.max(0, target.getTime() - (now + offset))
}
