import { expect, test } from "@playwright/test"

for (const { locale, typed, formatted } of [
  { locale: "pt-br", typed: "1234,56", formatted: "R$ 1.234,56" },
  { locale: "en", typed: "1234.56", formatted: "R$ 1,234.56" },
] as const) {
  test(`formats BRL and emits a decimal string in ${locale}`, async ({
    mount,
  }) => {
    const component = await mount("components/ui/money-input/Default", {
      locale,
    })
    const input = component.getByRole("textbox")

    await input.pressSequentially(typed)

    await expect(input).toHaveValue(formatted)
    await expect(component.getByLabel("Decimal value")).toHaveText("1234.56")
  })
}

test("ignores letters, exponent notation and signs typed inside an amount", async ({
  mount,
}) => {
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")
  await input.fill("12,50")
  await input.press("Home")
  await input.press("ArrowRight")
  await input.pressSequentially("eEabc+-")

  await expect(input).toHaveValue("R$ 12,50")
  await expect(component.getByLabel("Decimal value")).toHaveText("12.50")
})

test("keeps two decimals, supports selection replacement and clearing", async ({
  mount,
}) => {
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")
  await input.pressSequentially("12,345", { delay: 20 })
  await expect(input).toHaveValue("R$ 12,34")

  await input.selectText()
  await input.pressSequentially("0,01", { delay: 20 })
  await expect(component.getByLabel("Decimal value")).toHaveText("0.01")

  await input.selectText()
  await input.press("Backspace")
  await expect(input).toHaveValue("")
  await expect(component.getByLabel("Decimal value")).toBeEmpty()
})

test("preserves the caret when editing and deleting in the middle", async ({
  mount,
}) => {
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")
  await input.fill("1234,56")
  await input.evaluate((element: HTMLInputElement) => {
    element.setSelectionRange(4, 4)
  })
  await input.pressSequentially("9")
  await expect(input).toHaveValue("R$ 19.234,56")
  await input.press("Backspace")
  await expect(input).toHaveValue("R$ 1.234,56")
})

test("preserves precision for the largest supported amount and refuses extra integer digits", async ({
  mount,
}) => {
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")
  await input.fill("9999999999999999,99")
  await expect(input).toHaveValue("R$ 9.999.999.999.999.999,99")
  await expect(component.getByLabel("Decimal value")).toHaveText(
    "9999999999999999.99"
  )
  await input.press("Home")
  await input.pressSequentially("1")
  await expect(component.getByLabel("Decimal value")).toHaveText(
    "9999999999999999.99"
  )
})

test("accepts localized pasted amounts and rejects malformed clipboard contents", async ({
  mount,
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")

  for (const value of [
    "R$ 1.234,56",
    "1e3",
    "-10",
    "+10",
    "NaN",
    "12abc34",
    "12,345",
    "1.23,45",
    "1,234.56",
  ]) {
    await page.evaluate((text) => navigator.clipboard.writeText(text), value)
    await input.focus()
    await input.selectText()
    await input.press("ControlOrMeta+V")
    await expect(input).toHaveValue("R$ 1.234,56")
    await expect(component.getByLabel("Decimal value")).toHaveText("1234.56")
  }
})

test("accepts an English formatted paste", async ({ mount, page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  const component = await mount("components/ui/money-input/Default", {
    locale: "en",
  })
  await page.evaluate(() => navigator.clipboard.writeText("R$ 1,234.56"))
  const input = component.getByRole("textbox")
  await input.focus()
  await input.press("ControlOrMeta+V")
  await expect(input).toHaveValue("R$ 1,234.56")
  await expect(component.getByLabel("Decimal value")).toHaveText("1234.56")
})

test("reformats on locale change and follows external value updates and resets", async ({
  mount,
}) => {
  const component = await mount("components/ui/money-input/Default")
  const input = component.getByRole("textbox")
  await component.getByRole("button", { name: "Set amount" }).click()
  await expect(input).toHaveValue("R$ 1.234,56")
  await component.getByRole("button", { name: "English" }).click()
  await expect(input).toHaveValue("R$ 1,234.56")
  await expect(component.getByLabel("Decimal value")).toHaveText("1234.56")
  await component.getByRole("button", { name: "Reset" }).click()
  await expect(input).toHaveValue("")
})
