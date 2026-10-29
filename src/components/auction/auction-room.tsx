"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import { BidPanel } from "@/src/components/auction/bid-panel"
import { LotGallery } from "@/src/components/auction/lot-gallery"
import {
  LotBreadcrumb,
  LotContents,
  LotHeading,
} from "@/src/components/auction/lot-header"
import { RoomBidHistory } from "@/src/components/auction/room-bid-history"

//* Hooks imports
import { useShowLot, type ShowLot } from "@/src/hooks/lots/queries/use-show-lot"
import {
  usePublicLotLive,
  type PublicLotLiveStatus,
} from "@/src/hooks/lots/queries/use-public-lot-live"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { cn } from "@/src/lib/utils"

type PublicLot = ShowLot["lot"]

function itemsByPosition(items: PublicLot["items"]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function isMissingLot(error: unknown) {
  return error instanceof ApiError && error.status === 404
}

function AuctionConnection(props: { liveStatus: PublicLotLiveStatus }) {
  const t = useTranslations("pages./auction/[id]")
  const banner = "mb-5 border-3 border-black px-4 py-3 font-bold"

  if (props.liveStatus === "reconnecting") {
    return (
      <p
        id="auction-connection"
        role="status"
        className={cn(banner, "bg-brand-yellow text-brand-ink")}
      >
        {t("reconnecting")}
      </p>
    )
  }

  if (props.liveStatus === "unavailable") {
    return (
      <p
        id="auction-connection"
        role="alert"
        className={cn(banner, "bg-brand-red text-white")}
      >
        {t("connectionProblem")}
      </p>
    )
  }

  return null
}

function AuctionRoomDetails(props: {
  room: ShowLot
  liveStatus: PublicLotLiveStatus
}) {
  const t = useTranslations("pages./auction/[id]")
  const lot = props.room.lot
  const items = itemsByPosition(lot.items)

  return (
    <div id="auction-room">
      <AuctionConnection liveStatus={props.liveStatus} />
      <LotBreadcrumb lot={lot} />
      <LotHeading lot={lot} />
      <div className="flex flex-wrap items-start gap-10">
        <section
          aria-label={t("lotCards")}
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-9"
        >
          <LotGallery items={items} />
          <LotContents lot={lot} items={items} />
        </section>
        <aside
          aria-label={t("bidsLabel")}
          className="flex min-w-0 flex-[1_1_380px] flex-col gap-8"
        >
          <BidPanel room={props.room} />
          <RoomBidHistory
            lot={lot}
            viewerParticipantNo={props.room.viewerParticipantNo}
          />
        </aside>
      </div>
    </div>
  )
}

export function AuctionRoom(props: { id: string }) {
  const t = useTranslations("pages./auction/[id]")
  const lotQuery = useShowLot({ id: props.id })
  const liveStatus = usePublicLotLive(props.id)

  if (lotQuery.isError) {
    return (
      <p id="auction-room-error" role="alert">
        {isMissingLot(lotQuery.error) ? t("notFound") : t("error")}
      </p>
    )
  }

  if (!lotQuery.data) {
    if (lotQuery.fetchStatus === "idle") {
      return <p id="auction-room-missing">{t("notFound")}</p>
    }

    return <p id="auction-room-loading">{t("loading")}</p>
  }

  return <AuctionRoomDetails room={lotQuery.data} liveStatus={liveStatus} />
}
