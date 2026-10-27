// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"
import { Receipt } from "@/src/components/receipts/receipt"

//* Hooks imports
import type { ShowReceipt } from "@/src/hooks/receipts/queries/use-show-receipt"

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

const shareToken = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg"
const lotId = "2d3c4b5a-1111-4222-8333-444455556666"
const firstItemId = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"
const secondItemId = "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff"

function publicReceipt(
  overrides: Partial<ShowReceipt["receipt"]> = {}
): ShowReceipt {
  return {
    receipt: {
      lotId,
      title: "Frozen lot",
      description: "Sealed duel",
      endedAt: new Date("2026-10-26T14:45:00.000Z"),
      finalAmount: "12.50",
      winnerParticipantNo: 7,
      items: [
        {
          id: secondItemId,
          position: 2,
          cardId: 5318639,
          quantity: 1,
          cardName: "Mystical Space Typhoon",
          imagePath: "https://images.ygoprodeck.com/images/cards/5318639.jpg",
          cardSnapshot: {
            id: 5318639,
            name: "Mystical Space Typhoon",
            atk: 0,
          },
        },
        {
          id: firstItemId,
          position: 1,
          cardId: 89631139,
          quantity: 2,
          cardName: "Frozen Dragon",
          imagePath: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
          cardSnapshot: {
            id: 89631139,
            name: "Frozen Dragon",
            atk: 2500,
          },
        },
      ],
      ...overrides,
    },
  }
}

function ReceiptHarness(props: { shareToken: string }) {
  return createElement(
    NextIntlClientProvider,
    {
      locale: "en",
      messages: enMessages,
      timeZone: "UTC",
    } as ComponentProps<typeof NextIntlClientProvider>,
    createElement(QueryProvider, {
      children: createElement(Receipt, { shareToken: props.shareToken }),
    })
  )
}

describe("Receipt", () => {
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

  async function renderReceipt(token: string) {
    act(() => {
      root.render(createElement(ReceiptHarness, { shareToken: token }))
    })
  }

  describe("when the public receipt exists", () => {
    it("shows the winning amount, the winner number, and the cards in position order", async () => {
      vi.mocked(api.get).mockResolvedValue(publicReceipt())

      await renderReceipt(shareToken)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-title")?.textContent).toBe(
            "Frozen lot"
          )
        })
      })

      expect(container.querySelector("#receipt-description")?.textContent).toBe(
        "Sealed duel"
      )
      expect(
        container.querySelector("#receipt-final-amount")?.textContent
      ).toContain("12.50")
      expect(
        container.querySelector("#receipt-ended-at")?.textContent
      ).toContain("2026")
      expect(container.querySelector("#receipt-winner")?.textContent).toBe("7")
      expect(
        container.querySelector("#receipt-print")?.getAttribute("type")
      ).toBe("button")

      const items = container.querySelectorAll("#receipt-items > li")
      const images = container.querySelectorAll("#receipt-items img")

      expect(items[0]?.textContent).toContain("Frozen Dragon")
      expect(items[0]?.textContent).toContain("Quantity")
      expect(items[0]?.textContent).toContain("2")
      expect(items[1]?.textContent).toContain("Mystical Space Typhoon")
      expect(images[0]?.getAttribute("src")).toContain("89631139")
      expect(images[1]?.getAttribute("src")).toContain("5318639")
      expect(container.textContent).not.toContain("2500")
      expect(api.get).toHaveBeenCalledWith(
        expect.objectContaining({
          url: `/public/receipts/${shareToken}`,
        })
      )
    })

    it("prints the receipt when the print button is pressed", async () => {
      const print = vi.fn()
      vi.stubGlobal("print", print)
      vi.mocked(api.get).mockResolvedValue(publicReceipt())

      await renderReceipt(shareToken)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-print")).toBeInstanceOf(
            HTMLButtonElement
          )
        })
      })

      await act(async () => {
        container
          .querySelector("#receipt-print")
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      })

      expect(print).toHaveBeenCalledOnce()
    })

    it("hides the description when the lot has none", async () => {
      vi.mocked(api.get).mockResolvedValue(publicReceipt({ description: null }))

      await renderReceipt(shareToken)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-title")?.textContent).toBe(
            "Frozen lot"
          )
        })
      })

      expect(container.querySelector("#receipt-description")).toBeNull()
    })
  })

  describe("when the receipt cannot be loaded", () => {
    it("shows a missing receipt message when the server returns 404", async () => {
      vi.mocked(api.get).mockRejectedValue(
        new ApiError(404, "Receipt was not found.", {
          code: "RECEIPT_NOT_FOUND",
          message: "Receipt was not found.",
        })
      )

      await renderReceipt(shareToken)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-error")?.textContent).toBe(
            "Receipt was not found."
          )
        })
      })

      expect(container.textContent).not.toContain("Could not load the receipt.")
    })

    it("shows a generic error when the request fails for another reason", async () => {
      vi.useFakeTimers()

      try {
        vi.mocked(api.get).mockRejectedValue(
          new ApiError(500, "Unavailable", { message: "Unavailable" })
        )

        await renderReceipt(shareToken)

        await act(async () => {
          await vi.advanceTimersByTimeAsync(8000)
        })

        expect(container.querySelector("#receipt-error")?.textContent).toBe(
          "Could not load the receipt."
        )
      } finally {
        vi.useRealTimers()
      }
    })

    it("shows an invalid link message and does not request when the share token is a lot id", async () => {
      vi.mocked(api.get).mockResolvedValue(publicReceipt())

      await renderReceipt(lotId)

      await act(async () => {
        await Promise.resolve()
      })

      expect(container.querySelector("#receipt-invalid")?.textContent).toBe(
        "This receipt link is invalid."
      )
      expect(api.get).not.toHaveBeenCalled()
    })
  })

  describe("when the receipt is still loading", () => {
    it("shows a loading skeleton until the receipt arrives", async () => {
      let resolveReceipt: (receipt: ShowReceipt) => void = () => {}
      vi.mocked(api.get).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveReceipt = resolve
          })
      )

      await renderReceipt(shareToken)

      await act(async () => {
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-loading")?.textContent).toBe(
            "Loading receipt."
          )
        })
      })

      await act(async () => {
        resolveReceipt(publicReceipt())
        await vi.waitFor(() => {
          expect(container.querySelector("#receipt-title")?.textContent).toBe(
            "Frozen lot"
          )
        })
      })
    })
  })
})
