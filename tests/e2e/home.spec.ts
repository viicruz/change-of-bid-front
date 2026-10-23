//* Libraries imports
import { expect, test } from "@playwright/test"

const describe = test.describe
const it = test

describe("home page", () => {
  it("shows the project ready heading", async ({ page }) => {
    await page.goto("/")

    await expect(
      page.getByRole("heading", { name: "Project ready!" })
    ).toBeVisible()
  })
})
