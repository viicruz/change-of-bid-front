// @vitest-environment happy-dom

//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { NuqsTestingAdapter } from "nuqs/adapters/testing"
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
      post: vi.fn(),
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
    children: createElement(NuqsTestingAdapter, {
      hasMemory: true,
      children: createElement(QueryProvider, {
        children: createElement(WalletSummary),
      }),
    }),
  })
}

async function openDeposit(root: ParentNode) {
  if (root.querySelector("#deposit-form")) return

  await act(async () => {
    root
      .querySelector("#wallet-deposit-open")
      ?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

async function submitDeposit(root: ParentNode, value: string) {
  await openDeposit(root)

  const amount = root.querySelector("#deposit-amount")
  const form = root.querySelector("#deposit-form")

  expect(amount).toBeInstanceOf(HTMLInputElement)
  expect(form).toBeInstanceOf(HTMLFormElement)

  const inputElement = amount as HTMLInputElement
  const formElement = form as HTMLFormElement

  await act(async () => {
    setInputValue(inputElement, value)
  })

  await act(async () => {
    formElement.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    )
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
        limit: "5",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
    expect(container.textContent).toContain("Bid on a lot")
    expect(container.textContent).toContain("Wallet deposit")
    expect(container.textContent).toContain("− R$2.00")
    expect(container.textContent).toContain("+ R$2.00")
    expect(container.textContent).toContain("+ R$10.00")
    expect(container.querySelector("#wallet-movements-pagination")).toBeNull()
    expect(container.querySelector("#wallet-deposit-open")).toBeInstanceOf(
      HTMLButtonElement
    )
    expect(container.querySelector("#deposit-form")).toBeNull()
    expect(container.textContent).not.toContain("Initial deposit")
    expect(container.textContent).not.toContain("Artificial credit")
    expect(container.textContent).not.toContain("Development mode")
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
        ).toContain("Could not load your balance.")
      })
    })

    expect(container.querySelector("#wallet-balance")).toBeNull()
    expect(container.querySelector("#wallet-deposit-open")).toBeInstanceOf(
      HTMLButtonElement
    )
    expect(container.textContent).toContain("Transaction history")
    expect(container.textContent).toContain("Bid on a lot")
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
        ).toContain("Could not load your transactions.")
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
        expect(container.textContent).toContain("Bid on a lot")
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

  it("deposits the amount and shows the wallet returned by the API", async () => {
    mockWalletGet()
    vi.mocked(api.post).mockResolvedValue({
      totalBalance: "15.10",
      committedBalance: "0.01",
      availableBalance: "15.09",
    })

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

    await submitDeposit(container, "  5.00  ")

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.querySelector("#wallet-balance")?.textContent).toBe(
          "R$15.10"
        )
      })
    })

    expect(api.post).toHaveBeenCalledWith({
      url: "/private/wallet/deposits",
      body: { amount: "5.00" },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
    expect(container.querySelector("#deposit-form")).toBeNull()
    expect(
      container.querySelector("#wallet-deposit-success")?.textContent
    ).toBe("Deposit of R$5.00 confirmed!")
    expect(container.textContent).not.toContain("Artificial credit")
  })

  it("shows a money error and does not deposit an invalid amount", async () => {
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

    await submitDeposit(container, "0")

    expect(container.querySelector("#deposit-error")?.textContent).toBe(
      "Money values must be greater than zero and have at most 2 decimal places."
    )
    expect(api.post).not.toHaveBeenCalled()
    expect(container.querySelector("#wallet-balance")?.textContent).toBe(
      "R$10.10"
    )
  })

  it("shows the API error and keeps the current balance when the deposit is rejected", async () => {
    mockWalletGet()
    vi.mocked(api.post).mockRejectedValue(
      new ApiError(422, "The deposit exceeds the wallet balance limit.", {
        code: "AMOUNT_OUT_OF_RANGE",
        message: "The deposit exceeds the wallet balance limit.",
      })
    )

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

    await submitDeposit(container, "2.50")

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.querySelector("#deposit-error")?.textContent).toBe(
          "The deposit exceeds the wallet balance limit."
        )
      })
    })

    expect(container.querySelector("#wallet-balance")?.textContent).toBe(
      "R$10.10"
    )
    expect(
      (container.querySelector("#deposit-amount") as HTMLInputElement).value
    ).toBe("2.50")
  })

  it("returns to the first movement page after a deposit", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        return movementsPage(Number(input.params?.page ?? "1"))
      }

      return walletResponse
    })
    vi.mocked(api.post).mockResolvedValue({
      totalBalance: "12.50",
      committedBalance: "0.01",
      availableBalance: "12.49",
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container.querySelector("#wallet-movements")?.textContent
        ).toContain("Wallet deposit")
      })
    })

    const next = container.querySelector("#wallet-movements-next")

    await act(async () => {
      next?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Outbid — amount returned")
      })
    })

    await submitDeposit(container, "2.50")

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container
            .querySelector("#wallet-movements-page-1")
            ?.getAttribute("aria-current")
        ).toBe("page")
      })
    })

    expect(container.querySelector("#wallet-movements")?.textContent).toContain(
      "Wallet deposit"
    )
    expect(
      container.querySelector("#wallet-movements")?.textContent
    ).not.toContain("Outbid — amount returned")
    expect(container.querySelector("#wallet-balance")?.textContent).toBe(
      "R$12.50"
    )
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
        expect(
          container.querySelector("#wallet-movements")?.textContent
        ).toContain("Wallet deposit")
      })
    })

    const next = container.querySelector("#wallet-movements-next")
    const currentPage = container.querySelector("#wallet-movements-page-1")

    expect(next).toBeInstanceOf(HTMLButtonElement)
    expect(
      container.querySelector("#wallet-movements-previous")
    ).toBeInstanceOf(HTMLButtonElement)
    expect(currentPage).toBeInstanceOf(HTMLButtonElement)
    expect(currentPage?.getAttribute("aria-current")).toBe("page")
    expect(container.querySelector("#wallet-movements-page-2")).toBeInstanceOf(
      HTMLButtonElement
    )

    await act(async () => {
      next?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Outbid — amount returned")
      })
    })

    expect(
      container.querySelector("#wallet-movements")?.textContent
    ).not.toContain("Wallet deposit")
    expect(
      container
        .querySelector("#wallet-movements-page-2")
        ?.getAttribute("aria-current")
    ).toBe("page")
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/wallet/movements",
      params: {
        page: "2",
        limit: "5",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })

  it("collapses distant pages and loads the page that was selected", async () => {
    vi.mocked(api.get).mockImplementation(async (input) => {
      if (input.url === "/private/wallet/movements") {
        const page = Number(input.params?.page ?? "1")

        return {
          movements: [
            {
              id: `8b1c0c3e-1b2a-4d5e-9f70-8a1b2c3d4e6${page}`,
              type: page === 24 ? "RELEASE" : "DEPOSIT",
              amount: "3.00",
              lotId: page === 24 ? lotId : null,
              bidId: page === 24 ? bidId : null,
              createdAt: "2026-03-01T00:00:00.000Z",
            },
          ],
          page,
          limit: 20,
          total: 120,
        }
      }

      return walletResponse
    })

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(
          container.querySelector("#wallet-movements-page-1")
        ).toBeInstanceOf(HTMLButtonElement)
      })
    })

    expect(container.querySelector("#wallet-movements-page-2")).toBeInstanceOf(
      HTMLButtonElement
    )
    expect(container.querySelector("#wallet-movements-page-24")).toBeInstanceOf(
      HTMLButtonElement
    )
    expect(container.querySelector("#wallet-movements-page-6")).toBeNull()
    expect(container.querySelector("#wallet-movements-page-3")).toBeNull()
    expect(
      container.querySelector("[data-slot='pagination-ellipsis']")
    ).not.toBeNull()

    const lastPage = container.querySelector("#wallet-movements-page-24")

    await act(async () => {
      lastPage?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Outbid — amount returned")
      })
    })

    expect(
      container
        .querySelector("#wallet-movements-page-24")
        ?.getAttribute("aria-current")
    ).toBe("page")
    expect(api.get).toHaveBeenCalledWith({
      url: "/private/wallet/movements",
      params: {
        page: "24",
        limit: "5",
      },
      schema: expect.anything(),
      errorSchema: expect.anything(),
    })
  })
})
