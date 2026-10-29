// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { LotAudit } from "@/src/components/audit/lot-audit"
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import type { ShowLotAudit } from "@/src/hooks/lots/queries/use-show-lot-audit"
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Message imports
import enMessages from "@/messages/en.json"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
import { queryClient } from "@/src/lib/query-client"

vi.mock("next/image", () => ({
  default: (props: { alt: string; src: string }) =>
    createElement("img", { alt: props.alt, src: props.src }),
}))

vi.mock("@/src/lib/api", async () => {
  const actual =
    await vi.importActual<typeof import("@/src/lib/api")>("@/src/lib/api")

  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: actual.api.post,
    },
  }
})

const lotId = "3f1c2a40-7b6e-4d2a-9c11-8e5a1b0d4f22"

function publicLot(overrides: Partial<ShowLot["lot"]> = {}): ShowLot {
  return {
    serverNow: new Date("2026-10-27T12:00:00.000Z"),
    viewerParticipantNo: null,
    lot: {
      id: lotId,
      title: "Audit Dragon",
      description: "A public audit lot.",
      openingBid: "10.00",
      minIncrement: "1.00",
      startsAt: new Date("2026-10-27T13:00:00.000Z"),
      endsAt: new Date("2026-10-27T15:00:00.000Z"),
      extensionCount: 0,
      status: "LIVE",
      currentBid: "12.50",
      leaderParticipantNo: 2,
      bidCount: 2,
      sold: false,
      winnerParticipantNo: null,
      items: [
        {
          id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          position: 2,
          cardId: 5318639,
          quantity: 2,
          cardName: "Mystical Space Typhoon",
          imagePath: "https://images.ygoprodeck.com/images/cards/5318639.jpg",
          cardSnapshot: { name: "Mystical Space Typhoon" },
        },
        {
          id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          position: 1,
          cardId: 89631139,
          quantity: 1,
          cardName: "Blue-Eyes White Dragon",
          imagePath: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
          cardSnapshot: { name: "Blue-Eyes White Dragon" },
        },
      ],
      bids: [],
      ...overrides,
    },
  }
}

function publicAudit(
  overrides: Partial<ShowLotAudit["audit"]> = {}
): ShowLotAudit {
  return {
    audit: {
      lotId,
      status: "INTACT",
      bids: [
        {
          sequence: 1,
          amount: "10.00",
          createdAt: new Date("2026-10-26T16:00:00.000Z"),
          participantNo: 1,
        },
        {
          sequence: 2,
          amount: "12.50",
          createdAt: new Date("2026-10-26T16:05:00.000Z"),
          participantNo: 2,
        },
      ],
      ...overrides,
    },
  }
}

function mockQueries(lot: ShowLot, audit: ShowLotAudit) {
  vi.mocked(api.get).mockImplementation((options) => {
    if (options.url.endsWith("/audit")) {
      return Promise.resolve(audit)
    }

    return Promise.resolve(lot)
  })
}

function AuditHarness(props: { id: string }) {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(
      QueryProvider,
      null,
      createElement(LotAudit, { id: props.id })
    )
  )
}

describe("LotAudit", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    queryClient.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAudit(id: string) {
    act(() => {
      root.render(createElement(AuditHarness, { id }))
    })
  }

  describe("when the chain is intact", () => {
    it("shows the lot, cards in position order, and accepted bids in sequence order", async () => {
      mockQueries(publicLot(), publicAudit())

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-name")?.textContent).toBe(
            "Audit Dragon"
          )
        })
      })

      expect(container.querySelector("#lot-audit-status")?.textContent).toBe(
        "Live"
      )
      expect(container.querySelector("#lot-audit-chain")?.textContent).toBe(
        "Chain intact"
      )
      expect(
        container.querySelector("#lot-audit-back")?.getAttribute("href")
      ).toBe(`/auction/${lotId}`)
      expect(container.querySelector("#lot-audit-tampered")).toBeNull()
      expect(
        container.querySelector("#lot-audit-verification-failed")
      ).toBeNull()
      expect(container.querySelector("#lot-audit-bid")?.textContent).toContain(
        "Current bid"
      )
      expect(container.querySelector("#lot-audit-bid")?.textContent).toContain(
        "12.50"
      )
      expect(container.textContent).toContain("Starts at")
      expect(container.textContent).toContain("Ends at")

      const items = container.querySelectorAll("#lot-items > li")
      const images = container.querySelectorAll("#lot-items img")

      expect(items[0]?.textContent).toContain("Blue-Eyes White Dragon")
      expect(items[1]?.textContent).toContain("Mystical Space Typhoon")
      expect(images[0]?.getAttribute("src")).toContain("89631139")
      expect(
        container.querySelector(
          "#lot-item-quantity-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )?.textContent
      ).toContain("1")
      expect(container.innerHTML.indexOf("audit-bid-1")).toBeLessThan(
        container.innerHTML.indexOf("audit-bid-2")
      )
      expect(container.querySelector("#audit-bid-1")?.textContent).toContain(
        "Participant"
      )
      expect(container.querySelector("#audit-bid-1")?.textContent).toContain(
        "1"
      )
      expect(container.querySelector("#audit-bid-1")?.textContent).toContain(
        "10.00"
      )
      expect(container.querySelector("#audit-bid-2")?.textContent).toContain(
        "12.50"
      )
      expect(container.querySelector("#audit-bid-2")?.textContent).toContain(
        "2"
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/public/lots/${lotId}`,
        })
      )
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/public/lots/${lotId}/audit`,
        })
      )
    })

    it("labels the amount and the end date as final when the lot has ended", async () => {
      mockQueries(
        publicLot({
          status: "ENDED",
          currentBid: "12.50",
        }),
        publicAudit()
      )

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-status")?.textContent).toBe(
            "Closed"
          )
        })
      })

      expect(container.querySelector("#lot-audit-bid")?.textContent).toContain(
        "Final bid"
      )
      expect(container.textContent).toContain("Ended at")
      expect(container.textContent).not.toContain("Ends at")
    })
  })

  describe("when the chain is tampered", () => {
    it("keeps the returned bids and marks the record as not trustworthy", async () => {
      mockQueries(publicLot(), publicAudit({ status: "TAMPERED" }))

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-chain")?.textContent).toBe(
            "Chain tampered"
          )
        })
      })

      expect(container.querySelector("#lot-audit-tampered")?.textContent).toBe(
        "The stored bids do not match the chain. This record is not trustworthy."
      )
      expect(
        container.querySelector("#lot-audit-verification-failed")
      ).toBeNull()
      expect(container.querySelector("#audit-bid-1")).not.toBeNull()
      expect(container.querySelector("#audit-bid-2")?.textContent).toContain(
        "12.50"
      )
    })
  })

  describe("when verification fails", () => {
    it("keeps the public bids and does not treat the chain as intact or tampered", async () => {
      mockQueries(
        publicLot(),
        publicAudit({ status: "VERIFICATION_FAILED" })
      )

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-chain")?.textContent).toBe(
            "Verification failed"
          )
        })
      })

      expect(
        container.querySelector("#lot-audit-verification-failed")?.textContent
      ).toBe(
        "The server could not verify the bid chain. Do not treat this record as intact or tampered."
      )
      expect(container.querySelector("#lot-audit-tampered")).toBeNull()
      expect(container.querySelector("#lot-audit-chain")?.textContent).not.toBe(
        "Chain intact"
      )
      expect(container.querySelector("#audit-bid-1")).not.toBeNull()
    })
  })

  describe("when the lot has no accepted bids", () => {
    it("shows an intact chain, an empty history, and no current bid", async () => {
      mockQueries(
        publicLot({
          status: "SCHEDULED",
          currentBid: null,
          leaderParticipantNo: null,
          bidCount: 0,
        }),
        publicAudit({ bids: [] })
      )

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#audit-bids-empty")?.textContent).toBe(
            "This lot has no accepted bids."
          )
        })
      })

      expect(container.querySelector("#lot-audit-chain")?.textContent).toBe(
        "Chain intact"
      )
      expect(container.querySelector("#lot-audit-status")?.textContent).toBe(
        "Scheduled"
      )
      expect(container.querySelector("#lot-audit-bid")?.textContent).toContain(
        "No current bid."
      )
      expect(container.querySelector("#audit-bids")).toBeNull()
    })
  })

  describe("when the audit cannot be loaded", () => {
    it("shows a missing lot message when the audit returns 404", async () => {
      vi.mocked(api.get).mockImplementation((options) => {
        if (options.url.endsWith("/audit")) {
          return Promise.reject(
            new ApiError(404, "Lot was not found.", {
              code: "LOT_NOT_FOUND",
              message: "Lot was not found.",
            })
          )
        }

        return Promise.resolve(publicLot())
      })

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-error")?.textContent).toBe(
            "Lot was not found."
          )
        })
      })

      expect(container.textContent).not.toContain("Could not load the audit.")
    })

    it("shows a missing lot message when the lot returns 404", async () => {
      vi.mocked(api.get).mockImplementation((options) => {
        if (options.url.endsWith("/audit")) {
          return Promise.resolve(publicAudit())
        }

        return Promise.reject(
          new ApiError(404, "Lot was not found.", {
            code: "LOT_NOT_FOUND",
            message: "Lot was not found.",
          })
        )
      })

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-error")?.textContent).toBe(
            "Lot was not found."
          )
        })
      })
    })

    it("shows a generic error when the request fails for another reason", async () => {
      vi.useFakeTimers()

      try {
        vi.mocked(api.get).mockRejectedValue(
          new ApiError(500, "Unavailable", { message: "Unavailable" })
        )

        await renderAudit(lotId)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(8000)
        })

        expect(container.querySelector("#lot-audit-error")?.textContent).toBe(
          "Could not load the audit."
        )
      } finally {
        vi.useRealTimers()
      }
    })

    it("shows a missing lot message and does not request when the id is not a uuid", async () => {
      mockQueries(publicLot(), publicAudit())

      await renderAudit("not-a-uuid")

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.querySelector("#lot-audit-missing")?.textContent).toBe(
        "Lot was not found."
      )
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe("when the audit is still loading", () => {
    it("shows a loading message until the lot and the audit arrive", async () => {
      let resolveLot: (lot: ShowLot) => void = () => {}
      let resolveAudit: (audit: ShowLotAudit) => void = () => {}

      vi.mocked(api.get).mockImplementation(
        (options) =>
          new Promise((resolve) => {
            if (options.url.endsWith("/audit")) {
              resolveAudit = resolve
              return
            }

            resolveLot = resolve
          })
      )

      await renderAudit(lotId)

      await act(async () => {
        await vi.waitFor(() => {
          expect(
            container.querySelector("#lot-audit-loading")?.textContent
          ).toBe("Loading audit.")
        })
      })

      await act(async () => {
        resolveLot(publicLot())
        await Promise.resolve()
      })

      expect(container.querySelector("#lot-audit-loading")?.textContent).toBe(
        "Loading audit."
      )
      expect(container.querySelector("#lot-audit")).toBeNull()

      await act(async () => {
        resolveAudit(publicAudit())
        await vi.waitFor(() => {
          expect(container.querySelector("#lot-audit-name")?.textContent).toBe(
            "Audit Dragon"
          )
        })
      })
    })
  })
})
