//* Libraries imports
import { expect, test } from "@playwright/test"

const describe = test.describe
const it = test

describe("Button", () => {
  it("renders the primary button", async ({ mount }) => {
    const component = await mount("components/ui/button/Primary")

    await expect(
      component.getByRole("button", { name: "Submit" })
    ).toBeVisible()
  })
})
