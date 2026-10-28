"use client"

//* Libraries imports
import { PlusIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import type { FieldErrors } from "react-hook-form"

//* Components imports
import {
  AuctioneerPaneHeader,
  auctioneerPaneClassName,
} from "@/src/components/auctioneer/auctioneer-pane"
import { AuctioneerMobileBar } from "@/src/components/auctioneer/auctioneer-mobile-bar"
import { AuctioneerSidebar } from "@/src/components/auctioneer/auctioneer-sidebar"
import {
  AuctioneerTabs,
  type AuctioneerTab,
} from "@/src/components/auctioneer/auctioneer-tabs"
import { CardSearchPanel } from "@/src/components/auctioneer/card-search-panel"
import {
  CreateLotForm,
  CreateLotSubmit,
} from "@/src/components/auctioneer/create-lot-form"
import type { CreateLotFormValues } from "@/src/components/auctioneer/create-lot-form-schema"
import {
  CreateLotProvider,
  useCreateLotMutation,
  useLotCardFields,
} from "@/src/components/auctioneer/create-lot-provider"
import { LotCards } from "@/src/components/auctioneer/lot-cards"
import { LotDetailsFields } from "@/src/components/auctioneer/lot-details-fields"
import {
  LotCreated,
  LotCreatedDetails,
} from "@/src/components/auctioneer/lot-created"
import { LotErrorSummary } from "@/src/components/auctioneer/lot-error-summary"
import { LotSummary } from "@/src/components/auctioneer/lot-summary"
import { PrivateLotDetails } from "@/src/components/auctioneer/private-lot-details"
import { Button } from "@/src/components/ui/button"
import { Tag } from "@/src/components/ui/brand"
import Card from "@/src/components/ui/card"

//* Hooks imports
import { useCancelLot } from "@/src/hooks/lots/mutations/use-cancel-lot"
import {
  useShowPrivateLot,
  type ShowPrivateLot,
} from "@/src/hooks/lots/queries/use-show-private-lot"

//* Schema imports
import type { Lot, PrivateLotStatus } from "@/src/schemas/lot"

//* Local imports
import { ApiError } from "@/src/lib/api"
import { cn } from "@/src/lib/utils"

const cancelErrorMessageKey = {
  NOT_AUCTIONEER: "cancelErrors.NOT_AUCTIONEER",
  LOT_NOT_OWNED: "cancelErrors.LOT_NOT_OWNED",
  LOT_NOT_FOUND: "cancelErrors.LOT_NOT_FOUND",
  LOT_NOT_CANCELABLE: "cancelErrors.LOT_NOT_CANCELABLE",
} as const

type CancelErrorCode = keyof typeof cancelErrorMessageKey

function isCancelErrorCode(code: string): code is CancelErrorCode {
  return Object.hasOwn(cancelErrorMessageKey, code)
}

function canCancelLot(props: {
  status: ShowPrivateLot["lot"]["status"]
  endsAt: Date
  serverNow: Date
}) {
  const isOpen = props.status === "SCHEDULED" || props.status === "LIVE"

  return isOpen && props.endsAt.getTime() > props.serverNow.getTime()
}

function readCancelErrorCode(error: unknown) {
  if (!(error instanceof ApiError)) {
    return null
  }

  const body = error.body

  if (
    body !== null &&
    typeof body === "object" &&
    "code" in body &&
    typeof body.code === "string"
  ) {
    return body.code
  }

  return null
}

function CancelLotFooter(props: {
  lotId: string
  status: ShowPrivateLot["lot"]["status"]
  endsAt: Date
  serverNow: Date
}) {
  const t = useTranslations("pages./auctioneer")
  const cancelLot = useCancelLot()
  const errorCode = cancelLot.isError
    ? readCancelErrorCode(cancelLot.error)
    : null
  const cancelable = canCancelLot({
    status: props.status,
    endsAt: props.endsAt,
    serverNow: props.serverNow,
  })

  return (
    <div className="flex w-full flex-col gap-4">
      {cancelLot.isSuccess ? (
        <p id="cancel-lot-success" role="status" className="text-sm">
          {t("canceledLot")}
        </p>
      ) : null}
      {cancelLot.isError ? (
        <p
          id="cancel-lot-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {errorCode && isCancelErrorCode(errorCode)
            ? t(cancelErrorMessageKey[errorCode])
            : t("cancelError")}
        </p>
      ) : null}
      <Button
        id="cancel-lot"
        type="button"
        variant="destructive"
        className="w-full"
        disabled={!cancelable || cancelLot.isPending}
        onClick={() => {
          cancelLot.mutate({ id: props.lotId })
        }}
      >
        {cancelLot.isPending ? t("cancelingLot") : t("cancelLot")}
      </Button>
    </div>
  )
}

function PrivateLotWorkspace(props: {
  query: ReturnType<typeof useShowPrivateLot>
}) {
  const t = useTranslations("pages./auctioneer")

  if (props.query.isError) {
    return (
      <Card.Root id="private-lot-error-card" className="min-h-160">
        <Card.Content>
          <p id="private-lot-error">{t("lotError")}</p>
        </Card.Content>
      </Card.Root>
    )
  }

  if (!props.query.data) {
    return (
      <Card.Root id="private-lot-loading-card" className="min-h-160">
        <Card.Content>
          <p id="private-lot-loading">{t("lotLoading")}</p>
        </Card.Content>
      </Card.Root>
    )
  }

  const lot = props.query.data.lot

  return (
    <PrivateLotDetails
      lot={lot}
      footer={
        <CancelLotFooter
          lotId={lot.id}
          status={lot.status}
          endsAt={lot.endsAt}
          serverNow={props.query.data.serverNow}
        />
      }
    />
  )
}

//* Below 1180px the tabs pick which column shows (see AuctioneerTabs)
const paneVisibility = {
  lots: "max-[1180px]:col-span-full max-[1180px]:hidden max-[1180px]:group-data-[tab=lots]/auctioneer:flex",
  cards:
    "max-[1180px]:group-data-[tab=lots]/auctioneer:hidden max-[760px]:group-data-[tab=details]/auctioneer:hidden",
  details:
    "max-[1180px]:group-data-[tab=lots]/auctioneer:hidden max-[760px]:group-data-[tab=cards]/auctioneer:hidden",
  lot: "col-[2/-1] max-[1180px]:col-span-full max-[1180px]:group-data-[tab=lots]/auctioneer:hidden",
}

export function AuctioneerPanel() {
  return (
    <CreateLotProvider>
      <AuctioneerWorkspace />
    </CreateLotProvider>
  )
}

function AuctioneerHeading(props: { viewing: boolean }) {
  const t = useTranslations("pages./auctioneer")

  return (
    <div className="flex flex-col gap-2.5">
      <Tag tone="dark">{t("pageTag")}</Tag>
      <h1
        id="auctioneer-title"
        className="font-heading text-[clamp(32px,4.4vw,56px)] leading-none font-normal"
      >
        {props.viewing ? t("viewHeading") : t("createHeading")}
      </h1>
      <p className="max-w-160 text-base text-muted-foreground">
        {props.viewing ? t("viewSubtitle") : t("createSubtitle")}
      </p>
    </div>
  )
}

function CreatedLotColumns(props: {
  lot: Lot
  onCreateAnother: () => void
  onViewInList: (status: PrivateLotStatus) => void
}) {
  return (
    <>
      <section
        id="auctioneer-lot-column"
        aria-labelledby="create-lot-success-title"
        className={cn("min-w-0", paneVisibility.cards)}
      >
        <LotCreated
          lot={props.lot}
          onCreateAnother={props.onCreateAnother}
          onViewInList={props.onViewInList}
        />
      </section>
      <section
        id="auctioneer-details-column"
        aria-labelledby="lot-details-title"
        className={cn("min-w-0", paneVisibility.details)}
      >
        <LotCreatedDetails lot={props.lot} />
      </section>
    </>
  )
}

function AddCardButton(props: { searchOpen: boolean; onToggle: () => void }) {
  const t = useTranslations("pages./auctioneer")

  return (
    <Button
      id="auctioneer-add-card"
      type="button"
      variant={props.searchOpen ? "outline" : "default"}
      aria-expanded={props.searchOpen}
      aria-controls={props.searchOpen ? "card-search-panel" : undefined}
      onClick={props.onToggle}
    >
      {props.searchOpen ? (
        <XIcon data-icon="inline-start" aria-hidden="true" />
      ) : (
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
      )}
      {props.searchOpen ? t("closeCardSearch") : t("addCards")}
    </Button>
  )
}

function DraftLotColumns(props: {
  searchOpen: boolean
  onSearchOpen: () => void
  onSearchToggle: () => void
  onInvalid: (errors: FieldErrors<CreateLotFormValues>) => void
  onCreated: (lot: Lot) => void
  onRejected: () => void
}) {
  const t = useTranslations("pages./auctioneer")

  return (
    <>
      <section
        id="auctioneer-lot-column"
        aria-labelledby="cards-in-lot-title"
        className={cn("min-w-0", paneVisibility.cards)}
      >
        <LotCards
          searchOpen={props.searchOpen}
          emptyAction={
            props.searchOpen ? null : (
              <Button
                id="auctioneer-empty-add-card"
                type="button"
                onClick={props.onSearchOpen}
              >
                {t("addCards")}
              </Button>
            )
          }
          action={
            <AddCardButton
              searchOpen={props.searchOpen}
              onToggle={props.onSearchToggle}
            />
          }
        >
          {props.searchOpen ? (
            <CardSearchPanel className="slide-in-from-top-1.5 animate-in shadow-brand-red duration-200 fade-in motion-reduce:animate-none" />
          ) : null}
        </LotCards>
      </section>
      <section
        id="auctioneer-details-column"
        aria-labelledby="lot-details-title"
        className={cn("min-w-0", paneVisibility.details)}
      >
        <CreateLotForm
          className={cn(
            auctioneerPaneClassName,
            "shadow-hard-8 shadow-brand-red"
          )}
          onInvalid={props.onInvalid}
          onCreated={props.onCreated}
          onRejected={props.onRejected}
        >
          <AuctioneerPaneHeader
            titleId="lot-details-title"
            title={t("lotDetails")}
          />
          <div className="flex flex-col gap-4.5 p-4.5">
            <LotErrorSummary />
            <LotDetailsFields />
            <LotSummary />
            <CreateLotSubmit />
          </div>
        </CreateLotForm>
      </section>
    </>
  )
}

//* On a phone, show the column that holds the errors
function tabForErrors(errors: FieldErrors<CreateLotFormValues>): AuctioneerTab {
  const onlyCards = Object.keys(errors).every((name) => name === "cards")

  return onlyCards ? "cards" : "details"
}

function lotCardCount(createdLot: Lot | null, draftCount: number) {
  if (!createdLot) {
    return draftCount
  }

  return createdLot.items.reduce((sum, item) => sum + item.quantity, 0)
}

function AuctioneerWorkspace() {
  const storeLot = useCreateLotMutation()
  const cards = useLotCardFields()
  const [searchOpen, setSearchOpen] = useState(true)
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null)
  const [tab, setTab] = useState<AuctioneerTab>("cards")
  const [lotStatus, setLotStatus] = useState<PrivateLotStatus | undefined>(
    undefined
  )
  const [newLotId, setNewLotId] = useState<string | null>(null)
  const viewing = selectedLotId !== null
  //* Until "create another lot", the columns show the lot just published
  const createdLot = storeLot.isSuccess ? storeLot.data : null
  const cardCount = lotCardCount(createdLot, cards.fields.length)
  const privateLot = useShowPrivateLot({
    id: selectedLotId ?? "",
    enabled: viewing,
  })
  //* "Create another lot" lands on the card search once the form is back
  const focusSearchRef = useRef(false)

  useEffect(() => {
    if (createdLot === null && focusSearchRef.current) {
      focusSearchRef.current = false
      document.getElementById("card-search")?.focus()
    }
  }, [createdLot])

  function onSelectLot(lotId: string) {
    setSelectedLotId(lotId)
    setTab("cards")
  }

  //* The draft is the form, so the published lot makes way for it
  function onOpenDraft() {
    setSelectedLotId(null)
    setTab("cards")
    storeLot.reset()
  }

  function onRejected() {
    setTab("details")
  }

  function onCreated(lot: Lot) {
    setNewLotId(lot.id)
    setTab("cards")
  }

  function onCreateAnother() {
    focusSearchRef.current = true
    storeLot.reset()
    setSearchOpen(true)
    setTab("cards")
  }

  //* The list filters to where the lot now is; the focus goes to that filter
  function onViewCreatedLot(status: PrivateLotStatus) {
    flushSync(() => {
      setLotStatus(status)
      setTab("lots")
    })
    document.getElementById(`auctioneer-lot-filter-${status}`)?.focus()
  }

  function onSearchToggle() {
    setSearchOpen((open) => !open)
  }

  function onInvalid(errors: FieldErrors<CreateLotFormValues>) {
    setTab(tabForErrors(errors))
  }

  function onSearchOpen() {
    setSearchOpen(true)
  }

  function renderColumns() {
    if (viewing) {
      return (
        <div
          id="auctioneer-lot-view"
          className={cn("min-w-0", paneVisibility.lot)}
        >
          <PrivateLotWorkspace query={privateLot} />
        </div>
      )
    }

    if (createdLot) {
      return (
        <CreatedLotColumns
          lot={createdLot}
          onCreateAnother={onCreateAnother}
          onViewInList={onViewCreatedLot}
        />
      )
    }

    return (
      <DraftLotColumns
        searchOpen={searchOpen}
        onSearchOpen={onSearchOpen}
        onSearchToggle={onSearchToggle}
        onInvalid={onInvalid}
        onCreated={onCreated}
        onRejected={onRejected}
      />
    )
  }

  return (
    <div
      id="auctioneer-panel"
      data-tab={tab}
      className="group/auctioneer flex flex-col gap-6"
    >
      <AuctioneerHeading viewing={viewing} />
      <AuctioneerTabs
        tab={tab}
        viewing={viewing}
        cardCount={cardCount}
        onTabChange={setTab}
      />
      <div className="grid grid-cols-[300px_minmax(0,1fr)_380px] items-start gap-7 max-[1180px]:grid-cols-[minmax(0,1fr)_340px] max-[760px]:grid-cols-1 max-[760px]:gap-5">
        <AuctioneerSidebar
          selectedLotId={selectedLotId}
          newLotId={newLotId}
          status={lotStatus}
          onStatusChange={setLotStatus}
          onSelectLot={onSelectLot}
          onOpenDraft={onOpenDraft}
          className={paneVisibility.lots}
        />
        {renderColumns()}
      </div>
      {viewing ? null : (
        <AuctioneerMobileBar
          createdLot={createdLot}
          cardCount={cardCount}
          onCreateAnother={onCreateAnother}
        />
      )}
    </div>
  )
}
