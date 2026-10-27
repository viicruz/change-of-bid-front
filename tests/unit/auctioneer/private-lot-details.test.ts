// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { PrivateLotDetails } from "@/src/components/auctioneer/private-lot-details"

//* Hooks imports
import type { ShowPrivateLot } from "@/src/hooks/lots/queries/use-show-private-lot"

//* Message imports
import enMessages from "@/messages/en.json"

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) =>
    createElement("img", { alt: props.alt, src: props.src }),
}))

type PrivateLot = ShowPrivateLot["lot"]

function privateLot(overrides: Partial<PrivateLot> = {}): PrivateLot {
  return {
    id: "6f1c2a40-7b3e-4d1a-9c20-1a2b3c4d5e6f",
    title: "Blue-Eyes lot",
    description: "A dragon and a spell.",
    openingBid: "10.00",
    minIncrement: "0.50",
    startsAt: new Date("2026-10-26T14:00:00.000Z"),
    endsAt: new Date("2026-10-26T16:00:00.000Z"),
    extensionCount: 0,
    status: "LIVE",
    currentBid: "15.00",
    leaderParticipantNo: 4,
    bidCount: 2,
    sold: false,
    winnerParticipantNo: null,
    receivedAmount: null,
    items: [
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        position: 1,
        cardId: 89631139,
        quantity: 1,
        cardName: "Blue-Eyes White Dragon",
        imagePath: "https://images.example/blue-eyes.jpg",
        cardSnapshot: {
          id: 89631139,
          name: "Blue-Eyes White Dragon",
        },
      },
    ],
    bids: [
      {
        sequence: 1,
        amount: "10.00",
        createdAt: new Date("2026-10-26T14:10:00.000Z"),
        participantNo: 2,
      },
      {
        sequence: 2,
        amount: "15.00",
        createdAt: new Date("2026-10-26T14:20:00.000Z"),
        participantNo: 4,
      },
    ],
    ...overrides,
  }
}

function DetailsHarness(props: { lot: PrivateLot }) {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(PrivateLotDetails, { lot: props.lot })
  )
}

describe("PrivateLotDetails", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it("shows the title, status, card, and bids in bid order", () => {
    act(() => {
      root.render(createElement(DetailsHarness, { lot: privateLot() }))
    })

    expect(container.querySelector("#private-lot-title")?.textContent).toBe(
      "Blue-Eyes lot"
    )
    expect(container.querySelector("#private-lot-status")?.textContent).toBe(
      "Live"
    )
    expect(container.textContent).toContain("Blue-Eyes White Dragon")
    expect(
      container.querySelector(
        "#private-lot-quantity-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      )?.textContent
    ).toContain("1")

    const firstBid = container.querySelector("#private-lot-bid-1")
    const secondBid = container.querySelector("#private-lot-bid-2")

    expect(firstBid?.textContent).toContain("2")
    expect(secondBid?.textContent).toContain("4")
    expect(container.innerHTML.indexOf("private-lot-bid-1")).toBeLessThan(
      container.innerHTML.indexOf("private-lot-bid-2")
    )
  })

  it("shows the winner and the amount received when the lot is sold", () => {
    act(() => {
      root.render(
        createElement(DetailsHarness, {
          lot: privateLot({
            status: "ENDED",
            sold: true,
            winnerParticipantNo: 7,
            receivedAmount: "15.00",
          }),
        })
      )
    })

    const settlement = container.querySelector("#private-lot-settlement")

    expect(container.querySelector("#private-lot-status")?.textContent).toBe(
      "Closed"
    )
    expect(settlement?.textContent).toContain("Winner")
    expect(settlement?.textContent).toContain("7")
    expect(settlement?.textContent).toContain("Amount received")
  })

  it("shows an empty bid message when nobody has bid", () => {
    act(() => {
      root.render(
        createElement(DetailsHarness, {
          lot: privateLot({
            status: "SCHEDULED",
            currentBid: null,
            leaderParticipantNo: null,
            bidCount: 0,
            bids: [],
            extensionCount: 2,
          }),
        })
      )
    })

    expect(
      container.querySelector("#private-lot-current-bid")?.textContent
    ).toContain("No current bid.")
    expect(
      container.querySelector("#private-lot-bids-empty")?.textContent
    ).toBe("No bids yet.")
    expect(
      container.querySelector("#private-lot-extensions")?.textContent
    ).toContain("2")
  })
})
