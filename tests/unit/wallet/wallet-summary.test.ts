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

  it("shows the API total balance in BRL and keeps the mock history", async () => {
    vi.mocked(api.get).mockResolvedValue(walletResponse)

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
    expect(container.textContent).toContain("Initial deposit")
    expect(container.textContent).toContain("Bid on Blue-Eyes White Dragon")
    expect(container.textContent).toContain("Bid refund")
    expect(container.textContent).not.toContain("R$430.00")
  })

  it("shows an error when the wallet request fails and keeps the history", async () => {
    vi.mocked(api.get).mockRejectedValue(
      new ApiError(404, "Not found", {
        code: "WALLET_NOT_FOUND",
        message: "Wallet was not found.",
      })
    )

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
  })

  it("shows a loading state while the wallet request is pending", async () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}))

    act(() => {
      root.render(createElement(SummaryHarness))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toContain("Loading balance.")
      })
    })

    expect(container.querySelector("[data-slot='skeleton']")).not.toBeNull()
    expect(container.querySelector("#wallet-balance")).toBeNull()
    expect(container.textContent).toContain("Transaction history")
  })

  it("adds a session credit on top of the API total balance", async () => {
    vi.mocked(api.get).mockResolvedValue(walletResponse)

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
    expect(container.textContent).toContain("Artificial credit")
    expect(container.textContent).toContain("Initial deposit")
  })
})
