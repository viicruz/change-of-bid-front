//* Libraries imports
import { expect, test } from "@playwright/test"

const describe = test.describe
const it = test

describe("home page", () => {
  it("shows the project ready heading", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { name: "Projeto pronto!" })
    ).toBeVisible()
  })

  it("switches the page copy to English", async ({ page }) => {
    await page.goto("/")
    await page.getByLabel("Idioma").selectOption("en")

    await expect(
      page.getByRole("heading", { name: "Project ready!" })
    ).toBeVisible()
    await expect(page).toHaveURL("/")
  })
})
