// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"
import { WalletSummary } from "@/src/components/wallet/wallet-summary"

//* Message imports
import enMessages from "@/messages/en.json"

//* Local imports
import { ApiError, api } from "@/src/lib/api"
import { queryClient } from "@/src/lib/query-client"

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

const walletResponse = {
  totalBalance: "10.10",
  committedBalance: "0.01",
  availableBalance: "10.09",
}

const lotId = "11111111-1111-4111-8111-111111111111"
const bidId = "22222222-2222-4222-8222-222222222222"

const holdMovement = {
  id: "6f1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e5f",
  type: "HOLD",
  amount: "2.00",
  lotId,
  bidId,
  createdAt: "2026-04-02T00:00:00.000Z",
}

const depositMovement = {
  id: "7a1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e60",
  type: "DEPOSIT",
  amount: "10.00",
  lotId: null,
  bidId: null,
  createdAt: "2026-04-01T12:30:00.000Z",
}

const movementsResponse = {
  movements: [holdMovement, depositMovement],
  page: 1,
  limit: 20,
  total: 2,
}

const emptyMovementsResponse = {
  movements: [],
  page: 1,
  limit: 20,
  total: 0,
}

function movementsPage(page: number) {
  if (page === 2) {
    return {
      movements: [
        {
          id: "8b1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e61",
          type: "RELEASE",
          amount: "3.00",
          lotId,
          bidId,
          createdAt: "2026-03-01T00:00:00.000Z",
        },
      ],
      page: 2,
      limit: 20,
      total: 21,
    }
  }

  return {
    movements: [depositMovement],
    page: 1,
    limit: 20,
    total: 21,
  }
}

function SummaryHarness() {
  return createElement(NextIntlClientProvider, {
    locale: "en",
    messages: enMessages,
    timeZone: "UTC",
    children: createElement(QueryProvider, {
      children: createElement(WalletSummary),
    }),
  })
}

function setInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set

  valueSetter?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
  input.dispatchEvent(new Event("change", { bubbles: true }))
}

function mockWalletGet(
  movements:
    typeof movementsResponse | typeof emptyMovementsResponse = movementsResponse
) {
  vi.mocked(api.get).mockImplementation(async (input) => {
    if (input.url === "/private/wallet/movements") {
      return movements
    }

    return walletResponse
  })
}

describe("WalletSummary", () => {
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
    vi.clearAllMocks()
  })

  it("shows the API total balance and the API movements", async () => {
    mockWalletGet()

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.querySelector("#wallet-balance")?.textContent).toBe(
          "R$10.10"
        )
      })
    })

    expect(api.get).toHaveBeenCalledWith({
      url: "/private/wallet",
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/wallet/movements",
      params: {
        page: "1",
        limit: "20",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
    expect(container.textContent).toContain("Bid hold")
    expect(container.textContent).toContain("Deposit")
    expect(container.textContent).toContain("-R$2.00")
    expect(container.textContent).toContain("R$10.00")
    expect(container.querySelector("#wallet-movements-pagination")).toBeNull()
    expect(container.textContent).not.toContain("Initial deposit")
    expect(container.textContent).not.toContain("Artificial credit")
  })

  it("shows an empty history when the wallet has no movements", async () => {
    mockWalletGet(emptyMovementsResponse)

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container.querySelector("#wallet-movements-empty")?.textContent
        ).toBe("No transactions yet.")
      })
    })

    expect(container.querySelector("#wallet-movements")).toBeNull()
    expect(container.querySelector("#wallet-movements-pagination")).toBeNull()
  })

  it("shows a balance error and still lists movements when the wallet request fails", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        return movementsResponse
      }

      throw new ApiError(404, "Not found", {
        code: "WALLET_NOT_FOUND",
        message: "Wallet was not found.",
      })
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container.querySelector("#wallet-balance-error")?.textContent
        ).toBe("Could not load your balance.")
      })
    })

    expect(container.querySelector("#wallet-balance")).toBeNull()
    expect(container.querySelector("#dev-balance-form")).toBeInstanceOf(
      HTMLFormElement
    )
    expect(container.textContent).toContain("Transaction history")
    expect(container.textContent).toContain("Bid hold")
  })

  it("shows a movements error when the movements request fails", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        throw new ApiError(404, "Not found", {
          code: "WALLET_NOT_FOUND",
          message: "Wallet was not found.",
        })
      }

      return walletResponse
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container.querySelector("#wallet-movements-error")?.textContent
        ).toBe("Could not load your transactions.")
      })
    })

    expect(container.querySelector("#wallet-balance")?.textContent).toBe(
      "R$10.10"
    )
    expect(container.querySelector("#wallet-movements")).toBeNull()
  })

  it("shows a loading state while the wallet request is pending", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet") {
        return new Promise(() => {})
      }

      return movementsResponse
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Loading balance.")
        expect(container.textContent).toContain("Bid hold")
      })
    })

    expect(container.querySelector("[data-slot='skeleton']")).not.toBeNull()
    expect(container.querySelector("#wallet-balance")).toBeNull()
    expect(container.textContent).toContain("Transaction history")
  })

  it("shows a loading state while the movements request is pending", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        return new Promise(() => {})
      }

      return walletResponse
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Loading transactions.")
        expect(container.querySelector("#wallet-balance")?.textContent).toBe(
          "R$10.10"
        )
      })
    })
    expect(container.querySelector("#wallet-movements")).toBeNull()
    expect(container.querySelector("[data-slot='skeleton']")).not.toBeNull()
  })

  it("adds a session credit on top of the API total balance", async () => {
    mockWalletGet()

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.querySelector("#wallet-balance")?.textContent).toBe(
          "R$10.10"
        )
      })
    })

    const amount = container.querySelector("#dev-balance-amount")
    const form = container.querySelector("#dev-balance-form")

    expect(amount).toBeInstanceOf(HTMLInputElement)
    expect(form).toBeInstanceOf(HTMLFormElement)

    const inputElement = amount as HTMLInputElement
    const formElement = form as HTMLFormElement

    await act(async () => {
      setInputValue(inputElement, "5")
    })

    await act(async () => {
      // happy-dom reports step="0.01" as a mismatch, so requestSubmit never fires.
      formElement.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      )
    })

    expect(container.querySelector("#wallet-balance")?.textContent).toBe(
      "R$15.10"
    )
    expect(container.textContent).toContain("Deposit")
    expect(container.textContent).not.toContain("Artificial credit")
  })

  it("loads the next page when there are more movements than the page limit", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        return movementsPage(Number(input.params?.page ?? "1"))
      }

      return walletResponse
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Deposit")
      })
    })

    const next = container.querySelector("#wallet-movements-next")

    expect(next).toBeInstanceOf(HTMLButtonElement)
    expect(
      container.querySelector("#wallet-movements-previous")
    ).toBeInstanceOf(HTMLButtonElement)

    await act(async () => {
      next?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Hold released")
      })
    })

    expect(container.textContent).not.toContain("Deposit")
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/wallet/movements",
      params: {
        page: "2",
        limit: "20",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })
})
