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
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    await handler(route)
  })
}

async function openAuctioneer(page: Page) {
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
  await page.locator("#lot-opening-bid").fill("10.00")
  await page.locator("#lot-min-increment").fill("0.50")
  await page.locator("#lot-starts-at").fill("2099-10-26T18:00")
  await page.locator("#lot-ends-at").fill("2099-10-28T18:00")
}

describe("create lot page", () => {
  it("shows an empty lot form and hides the mocked lot list", async ({
    page,
  }) => {
    await openAuctioneer(page)

    await expect(
      page.getByRole("heading", { name: "Painel do leiloeiro" })
    ).toBeVisible()
    await expect(page.locator("#create-lot")).toBeVisible()
    await expect(page.locator("#auctioneer-lots")).toHaveCount(0)
    await expect(page.locator("#auctioneer-lot-search")).toHaveCount(0)
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(0)
    await expect(page.locator("#lot-title")).toHaveValue("")
    await expect(page.locator("#lot-ends-at")).toBeVisible()
  })

  it("adds a searched card once, blurs it, and removes it from the lot", async ({
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
    await expect(blueEyesCard).toHaveCSS("filter", "blur(2px)")
    await expect(darkMagician).toBeEnabled()
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(1)

    await blueEyes.click({ force: true })
    await expect(page.locator("#cards-in-lot").locator("li")).toHaveCount(1)

    await page.locator("#remove-lot-card-89631139").click()

    await expect(page.locator("#remove-lot-card-89631139")).toHaveCount(0)
    await expect(blueEyes).toBeEnabled()
    await expect(blueEyesCard).toHaveCSS("filter", "none")
  })

  it("adds and removes a card from the mobile search drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await mockCardSearch(page)
    await openAuctioneer(page)

    await page.locator("#auctioneer-add-card").click()
    await searchCardsByName(page, "#mobile-search-card-search")
    await page.locator("#mobile-search-add-card-89631139").click()

    await expect(
      page.locator("#mobile-search-add-card-89631139")
    ).toBeDisabled()
    await expect(
      page.locator("#mobile-search-card-search-card-89631139")
    ).toHaveCSS("filter", "blur(2px)")

    await page.keyboard.press("Escape")
    await page.locator("#remove-lot-card-89631139").click()
    await page.locator("#auctioneer-add-card").click()
    await searchCardsByName(page, "#mobile-search-card-search")

    await expect(page.locator("#mobile-search-add-card-89631139")).toBeEnabled()
    await expect(
      page.locator("#mobile-search-card-search-card-89631139")
    ).toHaveCSS("filter", "none")
  })

  it("clears the form when the auctioneer starts a new lot", async ({
    page,
  }) => {
    await mockCardSearch(page)
    await openAuctioneer(page)
    await searchCardsByName(page, "#card-search")
    await page.locator("#add-card-89631139").click()
    await expect(page.locator("#remove-lot-card-89631139")).toBeVisible()
    await page.locator("#lot-title").fill("Lote temporário")
    await page.locator("#create-lot").click()

    await expect(page.locator("#lot-title")).toHaveValue("")
    await expect(page.locator("#remove-lot-card-89631139")).toHaveCount(0)
    await expect(page.locator("#add-card-89631139")).toBeEnabled()
    await expect(page.locator("#create-lot-success")).toHaveCount(0)
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

    await expect(page.getByText("O título é obrigatório")).toBeVisible()
    await expect(page.getByText("Adicione pelo menos uma carta.")).toBeVisible()
    await expect(
      page.getByText(
        "Os valores em dinheiro devem ser maiores que zero e ter no máximo 2 casas decimais."
      )
    ).toHaveCount(2)
    expect(requestCount).toBe(0)
  })

  it("creates a lot and resets the form when the API accepts it", async ({
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

    await expect(page.locator("#create-lot-success")).toHaveText("Lote criado.")
    await expect(page.locator("#lot-title")).toHaveValue("")
    await expect(page.locator("#remove-lot-card-89631139")).toHaveCount(0)
    await expect(page.locator("#add-card-89631139")).toBeEnabled()
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
