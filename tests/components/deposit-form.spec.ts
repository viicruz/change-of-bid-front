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

    await component.getByLabel("Valor").fill("12.50")
    await component.getByRole("button", { name: "Depositar" }).click()

    await expect(component.getByRole("alert")).toHaveText(
      "O depósito ultrapassa o limite de saldo da carteira."
    )
  })
})
