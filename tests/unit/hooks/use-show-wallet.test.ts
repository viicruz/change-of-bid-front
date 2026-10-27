// @vitest-environment happy-dom

//* Libraries imports
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

//* Components imports
import { QueryProvider } from "@/src/components/query-provider"

//* Hooks imports
import { useShowWallet } from "@/src/hooks/wallets/queries/use-show-wallet"

//* Local imports
import { queryClient } from "@/src/lib/query-client"

const tokenKey = "change-of-bid.bearer-token"

const walletResponse = {
  totalBalance: "10.10",
  committedBalance: "0.01",
  availableBalance: "10.09",
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function WalletHarness() {
  const wallet = useShowWallet()
  const payload = wallet.data

  return createElement(
    "div",
    { id: "wallet-state" },
    wallet.isSuccess && payload
      ? `success:${payload.totalBalance}:${payload.committedBalance}:${payload.availableBalance}`
      : wallet.isError
        ? "error"
        : "pending"
  )
}

function DisabledWalletHarness() {
  const wallet = useShowWallet({ enabled: false })

  return createElement(
    "div",
    { id: "wallet-state" },
    wallet.isPending ? "pending" : "requested"
  )
}

describe("useShowWallet", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    queryClient.clear()
    sessionStorage.clear()
    sessionStorage.setItem(tokenKey, "session-token")
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
    sessionStorage.clear()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function renderAndWait(
    element: ReturnType<typeof createElement>,
    expected: string
  ) {
    act(() => {
      root.render(createElement(QueryProvider, null, element))
    })

    await act(async () => {
      await vi.waitFor(() => {
        expect(container.textContent).toBe(expected)
      })
    })
  }

  function lastRequest() {
    const fetchMock = vi.mocked(fetch)
    const call = fetchMock.mock.calls.at(-1)

    if (!call) {
      throw new Error("Expected a wallet request")
    }

    const [url, init] = call as [URL, RequestInit]

    return {
      url,
      init,
      headers: new Headers(init.headers),
    }
  }

  it("requests the authenticated wallet with no query and keeps balances as money strings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(walletResponse))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(
      createElement(WalletHarness),
      "success:10.10:0.01:10.09"
    )

    const request = lastRequest()

    expect(request.url.href).toBe("http://localhost:3001/private/wallet")
    expect(request.url.search).toBe("")
    expect(request.init.method).toBe("GET")
    expect(request.init.body).toBeUndefined()
    expect(request.headers.get("Authorization")).toBe("Bearer session-token")
    expect(request.headers.get("Accept")).toBe("application/json")
    expect(request.headers.get("Content-Type")).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("accepts a new account whose balances are all zero", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        totalBalance: "0.00",
        committedBalance: "0.00",
        availableBalance: "0.00",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(WalletHarness), "success:0.00:0.00:0.00")
  })

  it("surfaces a missing session and does not retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 401 }))
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(WalletHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(lastRequest().headers.get("Authorization")).toBe(
      "Bearer session-token"
    )
  })

  it("surfaces a missing wallet row and does not retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          code: "WALLET_NOT_FOUND",
          message: "Wallet was not found.",
        },
        404
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(WalletHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects balances that are not two-decimal money strings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        totalBalance: 10.1,
        committedBalance: "0.01",
        availableBalance: "10.09",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await renderAndWait(createElement(WalletHarness), "error")

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not request the wallet when the query is disabled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(walletResponse))
    vi.stubGlobal("fetch", fetchMock)

    act(() => {
      root.render(
        createElement(QueryProvider, null, createElement(DisabledWalletHarness))
      )
    })

    await act(async () => {
      await Promise.resolve()
    })

    expect(container.textContent).toBe("pending")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
