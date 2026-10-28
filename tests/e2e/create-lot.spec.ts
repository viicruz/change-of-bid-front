//* Libraries imports
import { expect, test, type Page, type Route } from "@playwright/test"

const describe = test.describe
const it = test

const cardSearchEndpoint = /\/public\/yugioh\/cards\/search/
const storeLotEndpoint = /\/private\/lots$/
const tokenKey = "change-of-bid.bearer-token"

const corsHeaders = {
  "access-control-allow-origin": "http://localhost:3000",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Content-Type, Authorization, Accept",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
}

const createdLot = {
  id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e6f",
  auctioneerId: "user-id",
  title: "Lote do dragão",
  description: null,
  openingBid: "10.00",
  minIncrement: "0.50",
  startsAt: "2099-10-26T21:00:00.000Z",
  originalEndsAt: "2099-10-28T21:00:00.000Z",
  endsAt: "2099-10-28T21:00:00.000Z",
  status: "ACTIVE",
  items: [
    {
      id: "6d5c0c3e-2b1a-4f0e-9c2a-1a2b3c4d5e70",
      position: 1,
      cardId: 89631139,
      quantity: 1,
      cardName: "Blue-Eyes White Dragon",
      imagePath: "https://images.ygoprodeck.com/images/cards/89631139.jpg",
    },
  ],
}

function catalogCard(id: number, name: string) {
  return {
    id,
    name,
    type: "Normal Monster",
    humanReadableCardType: "Normal Monster",
    frameType: "normal",
    desc: "A catalog card used by the auctioneer search.",
    race: "Dragon",
    attribute: "LIGHT",
    atk: 3000,
    def: 2500,
    level: 8,
    ygoprodeck_url: `https://ygoprodeck.com/card/${id}`,
    card_images: [
      {
        id,
        image_url: `https://images.ygoprodeck.com/images/cards/${id}.jpg`,
        image_url_small: `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`,
      },
    ],
    card_prices: [
      {
        cardmarket_price: "0.18",
        tcgplayer_price: "0.42",
        ebay_price: "2.95",
        amazon_price: "1.48",
        coolstuffinc_price: "0.99",
      },
    ],
  }
}

const searchCards = [
  catalogCard(89631139, "Blue-Eyes White Dragon"),
  catalogCard(46986414, "Dark Magician"),
]

async function fulfillJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

async function mockCardSearch(page: Page) {
  await page.route(cardSearchEndpoint, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    await fulfillJson(route, 200, {
      data: searchCards,
      meta: {
        current_rows: searchCards.length,
        total_rows: searchCards.length,
        rows_remaining: 0,
      },
    })
  })
}

async function mockStoreLot(
  page: Page,
  handler: (route: Route) => Promise<void>
) {
  await page.route(storeLotEndpoint, async (route) => {
    const method = route.request().method()

    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    if (method !== "POST") {
      await route.fallback()
      return
    }

    await handler(route)
  })
}

async function openAuctioneer(page: Page) {
  await page.route(storeLotEndpoint, async (route) => {
    if (route.request().method() !== "GET") {
      await route.fallback()
      return
    }

    await fulfillJson(route, 200, { totalReceived: "0.00", lots: [] })
  })
  await page.addInitScript((key) => {
    sessionStorage.setItem(key, "session-token")
  }, tokenKey)
  await page.goto("/auctioneer")
}

async function searchCardsByName(page: Page, inputId: string) {
  await page.locator(inputId).fill("Dragon")
}

async function fillLotDetails(page: Page) {
  await page.locator("#lot-title").fill("Lote do dragão")
  await page.locator("#lot-opening-bid").fill("10,00")
  await page.locator("#lot-min-increment").fill("0,50")
  await page.locator("#lot-starts-at").fill("2099-10-26T18:00")
  await page.locator("#lot-ends-at").fill("2099-10-28T18:00")
}

describe("create lot page", () => {
  it("shows an empty lot form and the empty mocked lot list", async ({
    page,
  }) => {
    await openAuctioneer(page)

    await expect(
      page.getByRole("heading", { name: "Criar lote", level: 1 })
    ).toBeVisible()
    await expect(page.locator("#create-lot")).toBeVisible()
    await expect(page.locator("#auctioneer-lots-empty")).toBeVisible()
    await expect(page.locator("#auctioneer-lot-search")).toBeVisible()
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(0)
    await expect(page.locator("#lot-title")).toHaveValue("")
    await expect(page.locator("#lot-ends-at")).toBeVisible()
    await expect(page.locator("#auctioneer-mobile-bar")).toBeHidden()
  })

  it("adds a searched card once, marks it as in the lot, and removes it", async ({
    page,
  }) => {
    await mockCardSearch(page)
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")

    const blueEyes = page.locator("#add-card-89631139")
    const darkMagician = page.locator("#add-card-46986414")
    const blueEyesCard = page.locator("#card-search-card-89631139")

    await expect(blueEyes).toBeEnabled()
    await blueEyes.click()

    await expect(page.locator("#remove-lot-card-89631139")).toBeVisible()
    await expect(page.getByText("Blue-Eyes White Dragon").first()).toBeVisible()
    await expect(blueEyes).toBeDisabled()
    await expect(blueEyesCard).toContainText("No lote")
    await expect(darkMagician).toBeEnabled()
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(1)
    await expect(page.locator("#cards-in-lot-count")).toHaveText("1 carta")

    await blueEyes.click({ force: true })
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(1)

    await page.locator("#remove-lot-card-89631139").click()

    await expect(page.locator("#remove-lot-card-89631139")).toHaveCount(0)
    await expect(page.locator("#cards-in-lot-empty")).toBeVisible()
    await expect(blueEyes).toBeEnabled()
    await expect(blueEyesCard).not.toContainText("No lote")
  })

  it("adds and removes a card from the search on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await mockCardSearch(page)
    await openAuctioneer(page)

    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()

    await expect(page.locator("#add-card-89631139")).toBeDisabled()
    await expect(page.locator("#card-search-card-89631139")).toContainText(
      "No lote"
    )

    await page.locator("#auctioneer-add-card").click()
    await expect(page.locator("#card-search-panel")).toHaveCount(0)
    await page.locator("#remove-lot-card-89631139").click()
    await page.locator("#auctioneer-empty-add-card").click()
    await searchCardsByName(page, "#card-search")

    await expect(page.locator("#add-card-89631139")).toBeEnabled()
    await expect(page.locator("#card-search-card-89631139")).not.toContainText(
      "No lote"
    )
  })

  it("switches between my lots, cards and details with tabs on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAuctioneer(page)

    await expect(page.locator("#auctioneer-sidebar")).toBeHidden()
    await expect(page.locator("#cards-in-lot-title")).toBeVisible()
    await expect(page.locator("#lot-title")).toBeHidden()

    await page.locator("#auctioneer-tab-details").click()

    await expect(page.locator("#lot-title")).toBeVisible()
    await expect(page.locator("#cards-in-lot-title")).toBeHidden()

    await page.locator("#auctioneer-tab-lots").click()

    await expect(page.locator("#auctioneer-sidebar")).toBeVisible()
    await expect(page.locator("#lot-title")).toBeHidden()
    await expect(page.locator("#cards-in-lot-title")).toBeHidden()
  })

  it("keeps the draft on top of my lots while the auctioneer builds it", async ({
    page,
  }) => {
    await mockCardSearch(page)
    await openAuctioneer(page)

    await expect(page.locator("#create-lot-title")).toHaveText(
      "Lote sem título"
    )
    await expect(page.locator("#create-lot-meta")).toHaveText(
      "Nenhuma carta ainda"
    )

    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await page.locator("#lot-title").fill("Lote temporário")
    await page.locator("#lot-opening-bid").fill("10,00")

    await expect(page.locator("#create-lot-title")).toHaveText(
      "Lote temporário"
    )
    await expect(page.locator("#create-lot-meta")).toHaveText(
      "1 carta · R$ 10,00"
    )

    await page.locator("#create-lot").click()

    await expect(page.locator("#lot-title")).toHaveValue("Lote temporário")
    await expect(page.locator("#remove-lot-card-89631139")).toBeVisible()
  })

  it("shows schema errors and does not create a lot when the form is empty", async ({
    page,
  }) => {
    let requestCount = 0

    await mockStoreLot(page, async (route) => {
      requestCount += 1
      await route.abort()
    })
    await openAuctioneer(page)
    await page.locator("#create-lot-submit").click()

    const moneyError =
      "Os valores em dinheiro devem ser maiores que zero e ter no máximo 2 casas decimais."
    const summary = page.locator("#lot-error-summary")

    await expect(page.locator("#lot-title-error")).toHaveText(
      "O título é obrigatório"
    )
    await expect(page.locator("#cards-in-lot-error")).toHaveText(
      "Adicione pelo menos uma carta."
    )
    await expect(page.locator("#lot-opening-bid-error")).toHaveText(moneyError)
    await expect(page.locator("#lot-min-increment-error")).toHaveText(
      moneyError
    )
    await expect(summary).toContainText("Faltam 6 coisas para publicar o lote:")
    await expect(summary).toContainText(
      "Cartas: Adicione pelo menos uma carta."
    )
    await expect(summary).toContainText(`Lance inicial: ${moneyError}`)
    expect(requestCount).toBe(0)
  })

  it("fills the increment and the schedule from the quick chips", async ({
    page,
  }) => {
    await openAuctioneer(page)
    await page.locator("#lot-opening-bid").fill("10,00")
    await page.locator("#lot-quick-increment-5").click()
    await page.locator("#lot-starts-at").fill("2099-10-26T18:00")
    await page.locator("#lot-quick-duration-3").click()

    await expect(page.locator("#lot-min-increment")).toHaveValue("5,00")
    await expect(page.locator("#lot-quick-increment-5")).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await expect(page.locator("#lot-ends-at")).toHaveValue("2099-10-29T18:00")
    await expect(page.locator("#lot-summary-duration")).toHaveText("3d 0h")
    await expect(page.locator("#lot-summary-opening-bid")).toHaveText(
      "R$ 10,00"
    )
    await expect(page.locator("#lot-summary-increment")).toHaveText("R$ 5,00")
  })

  it("publishes from the bottom bar and opens the details with errors on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await openAuctioneer(page)

    await expect(page.locator("#create-lot-submit")).toBeHidden()
    await expect(page.locator("#auctioneer-mobile-bar-cards")).toHaveText(
      "Nenhuma carta ainda"
    )

    await page.locator("#mobile-create-lot-submit").click()

    await expect(page.locator("#auctioneer-tab-details")).toHaveAttribute(
      "aria-selected",
      "true"
    )
    await expect(page.locator("#lot-error-summary")).toBeVisible()
    await expect(page.locator("#auctioneer-tab-details-error")).toBeAttached()
  })

  it("starts another lot from the bottom bar after publishing on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await mockCardSearch(page)
    await mockStoreLot(page, async (route) => {
      await fulfillJson(route, 200, createdLot)
    })
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await page.locator("#auctioneer-tab-details").click()
    await fillLotDetails(page)

    await expect(page.locator("#auctioneer-mobile-bar-value")).toHaveText(
      "R$ 10,00"
    )
    await expect(page.locator("#auctioneer-mobile-bar-cards")).toHaveText(
      "1 carta"
    )

    await page.locator("#mobile-create-lot-submit").click()

    await expect(page.locator("#create-lot-success")).toBeVisible()
    await expect(page.locator("#auctioneer-tab-cards")).toContainText("1")

    await page.locator("#mobile-create-another-lot").click()

    await expect(page.locator("#create-lot-success")).toHaveCount(0)
    await expect(page.locator("#auctioneer-mobile-bar-cards")).toHaveText(
      "Nenhuma carta ainda"
    )
  })

  it("shows the created lot and starts another one when the API accepts it", async ({
    page,
  }) => {
    let requestBody: unknown
    let authorization: string | undefined

    await mockCardSearch(page)
    await mockStoreLot(page, async (route) => {
      requestBody = route.request().postDataJSON()
      authorization = route.request().headers().authorization
      await fulfillJson(route, 200, createdLot)
    })
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await fillLotDetails(page)
    await page.locator("#create-lot-submit").click()

    await expect(page.locator("#create-lot-success-tag")).toHaveText(
      "Lote criado!"
    )
    await expect(page.locator("#create-lot-success-title")).toHaveText(
      "“Lote do dragão” está no campo"
    )
    await expect(page.locator("#create-lot-success-title")).toBeFocused()
    await expect(page.locator("#create-lot-success-text")).toContainText(
      "R$ 10,00"
    )
    await expect(page.locator("#created-lot-summary-cards")).toHaveText("1")
    await expect(page.locator("#created-lot-summary-duration")).toHaveText(
      "2d 0h"
    )
    await expect(page.locator("#lot-title")).toHaveCount(0)
    await expect(page.locator("#create-lot-title")).toHaveText(
      "Lote sem título"
    )

    await page.locator("#create-another-lot").click()

    await expect(page.locator("#create-lot-success")).toHaveCount(0)
    await expect(page.locator("#card-search")).toBeFocused()
    await expect(page.locator("#lot-title")).toHaveValue("")
    await expect(page.locator("#remove-lot-card-89631139")).toHaveCount(0)
    expect(authorization).toBe("Bearer session-token")
    expect(requestBody).toEqual({
      title: "Lote do dragão",
      description: null,
      openingBid: "10.00",
      minIncrement: "0.50",
      startsAt: new Date("2099-10-26T18:00").toISOString(),
      endsAt: new Date("2099-10-28T18:00").toISOString(),
      cardIds: [89631139],
    })
  })

  it("filters my lots to the scheduled ones from the created lot", async ({
    page,
  }) => {
    await mockCardSearch(page)
    await mockStoreLot(page, async (route) => {
      await fulfillJson(route, 200, createdLot)
    })
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await fillLotDetails(page)
    await page.locator("#create-lot-submit").click()
    await page.locator("#view-created-lot").click()

    const scheduled = page.locator("#auctioneer-lot-filter-SCHEDULED")

    await expect(scheduled).toHaveAttribute("aria-pressed", "true")
    await expect(scheduled).toBeFocused()
  })

  it("shows the auctioneer error when the API rejects the lot", async ({
    page,
  }) => {
    await mockCardSearch(page)
    await mockStoreLot(page, async (route) => {
      await fulfillJson(route, 403, { message: "NOT_AUCTIONEER" })
    })
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await fillLotDetails(page)
    await page.locator("#create-lot-submit").click()

    await expect(page.locator("#create-lot-error")).toHaveText(
      "Apenas um leiloeiro pode criar um lote."
    )
    await expect(page.locator("#lot-title")).toHaveValue("Lote do dragão")
    await expect(page.locator("#remove-lot-card-89631139")).toBeVisible()
  })
})
