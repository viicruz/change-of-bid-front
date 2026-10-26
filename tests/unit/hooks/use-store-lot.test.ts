// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import {
  useStoreLot,
  type StoreLot,
} from "@/src/hooks/lots/mutations/use-store-lot"

//* Local imports
import { api } from "@/src/lib/api"
import { QUERY_KEYS, queryClient } from "@/src/lib/query-client"

vi.mock("@/src/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
}))

const storeLotInput: StoreLot = {
  title: "  Blue-Eyes lot  ",
  description: "   ",
  openingBid: "10.00",
  minIncrement: "0.50",
  startsAt: "2099-10-26T18:00:00.000Z",
  endsAt: "2099-10-27T18:00:00.000Z",
  cardIds: [89631139, 46986414, 89631139],
}

function StoreLotHarness() {
  const storeLot = useStoreLot()

  return createElement(
    "button",
    {
      id: "store-lot-submit",
      type: "button",
      onClick: () => {
        void storeLot.mutateAsync(storeLotInput)
      },
    },
    storeLot.isSuccess ? "created" : "idle"
  )
}

describe("useStoreLot", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.mocked(api.post).mockResolvedValue({ id: "lot-id" })
    container = document.createElement("div")
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.clearAllMocks()
  })

  it("posts the lot and invalidates the lots collection", async () => {
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries")

    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(StoreLotHarness))
      )
    })

    const button = container.querySelector("button")

    await act(async () => {
      button?.click()
      await vi.waitFor(() => {
        expect(container.textContent).toBe("created")
      })
    })

    expect(api.post).toHaveBeenCalledWith({
      url: "/private/lots",
      body: {
        title: "Blue-Eyes lot",
        description: null,
        openingBid: "10.00",
        minIncrement: "0.50",
        startsAt: "2099-10-26T18:00:00.000Z",
        endsAt: "2099-10-27T18:00:00.000Z",
        cardIds: [89631139, 46986414, 89631139],
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: [QUERY_KEYS.LOTS.ALL],
    })

    invalidateQueries.mockRestore()
  })
})
