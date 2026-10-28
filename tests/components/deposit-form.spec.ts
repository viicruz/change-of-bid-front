//* Libraries imports
import { expect, test } from "@playwright/test"

const describe = test.describe
const it = test

describe("DepositForm", () => {
  it("shows a translated validation message for an invalid amount", async ({
    mount,
  }) => {
    const component = await mount("components/wallet/deposit-form/Default", {
      locale: "pt-br",
    })

    await component.getByRole("button", { name: "Depositar" }).click()

    await expect(component.getByRole("alert")).toHaveText(
      "Os valores em dinheiro devem ser maiores que zero e ter no máximo 2 casas decimais."
    )
    await expect(component.getByLabel("Valor")).toBeFocused()
    await expect(component.getByLabel("Valor")).toHaveAttribute(
      "aria-invalid",
      "true"
    )
  })

  it("rejects zero without calling the deposit API", async ({
    mount,
    page,
  }) => {
    const requests: string[] = []
    await page.route("**/private/wallet/deposits", async (route) => {
      requests.push(route.request().url())
      await route.abort()
    })
    const component = await mount("components/wallet/deposit-form/Default")
    await component.getByLabel("Valor").fill("0")
    await component.getByRole("button", { name: "Depositar" }).click()
    await expect(component.getByRole("alert")).toBeVisible()
    expect(requests).toEqual([])
  })

  it("shows a translated API error after submitting a valid amount", async ({
    mount,
    page,
  }) => {
    await page.route("**/private/wallet/deposits", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          code: "AMOUNT_OUT_OF_RANGE",
          message: "Amount is out of range",
        }),
      })
    })

    const component = await mount("components/wallet/deposit-form/Default", {
      locale: "pt-br",
    })

    await component.getByLabel("Valor").fill("12,50")
    await component.getByRole("button", { name: "Depositar" }).click()

    await expect(component.getByRole("alert")).toHaveText(
      "O depósito ultrapassa o limite de saldo da carteira."
    )

    await component.getByLabel("Valor").fill("10,00")
    await expect(component.getByRole("alert")).toHaveCount(0)
  })

  for (const { locale, amount } of [
    { locale: "pt-br", amount: "1.234,56" },
    { locale: "en", amount: "1,234.56" },
  ] as const) {
    it(`submits an unformatted decimal and clears the mask after success in ${locale}`, async ({
      mount,
      page,
    }) => {
      await page.route("**/private/wallet/deposits", async (route) => {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            totalBalance: "1234.56",
            committedBalance: "0.00",
            availableBalance: "1234.56",
          }),
        })
      })
      const component = await mount("components/wallet/deposit-form/Default", {
        locale,
      })
      const input = component.getByRole("textbox")
      await input.fill(amount)
      const request = page.waitForRequest("**/private/wallet/deposits")
      await component.getByRole("button").click()
      expect((await request).postDataJSON()).toEqual({ amount: "1234.56" })
      await expect(input).toHaveValue("")
    })
  }
})
