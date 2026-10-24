//* Libraries imports
import { expect, test, type Page, type Route } from "@playwright/test"

const describe = test.describe
const it = test

const signUpEndpoint = "**/api/auth/sign-up/email"

const corsHeaders = {
  "access-control-allow-origin": "http://localhost:3000",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-expose-headers": "set-auth-token",
}

type SignUpInput = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

async function fillSignUpForm(page: Page, input: SignUpInput) {
  await page.getByLabel("Name").fill(input.name)
  await page.getByLabel("Email").fill(input.email)
  await page.getByLabel("Password", { exact: true }).fill(input.password)
  await page.getByLabel("Confirm password").fill(input.confirmPassword)
}

async function mockSignUp(
  page: Page,
  handler: (route: Route) => Promise<void>
) {
  await page.route(signUpEndpoint, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    await handler(route)
  })
}

describe("sign-up page", () => {
  it("shows the sign-up form", async ({ page }) => {
    await page.goto("/sign-up")

    await expect(
      page.getByRole("heading", { name: "Create an account" })
    ).toBeVisible()
    await expect(page.getByLabel("Name")).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Confirm password")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Create account" })
    ).toBeVisible()
  })

  it("blocks an invalid email and a short password without calling the API", async ({
    page,
  }) => {
    let requestCount = 0

    await mockSignUp(page, async (route) => {
      requestCount += 1
      await route.abort()
    })

    await page.goto("/sign-up")
    await fillSignUpForm(page, {
      name: "Ada Lovelace",
      email: "not-an-email",
      password: "short",
      confirmPassword: "short",
    })
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page.getByText("Enter a valid email address")).toBeVisible()
    await expect(
      page.getByText("Password must be at least 8 characters")
    ).toBeVisible()
    expect(requestCount).toBe(0)
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  it("shows that the email is already registered when the API returns 422", async ({
    page,
  }) => {
    await mockSignUp(page, async (route) => {
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        headers: corsHeaders,
        body: JSON.stringify({
          message: "User already exists. Use another email.",
          code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
        }),
      })
    })

    await page.goto("/sign-up")
    await fillSignUpForm(page, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse-1",
      confirmPassword: "correct-horse-1",
    })
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(
      page.getByText("User already exists. Use another email.")
    ).toBeVisible()
    await expect(page).toHaveURL(/\/sign-up$/)
  })

  it("redirects home when the API accepts the sign-up", async ({ page }) => {
    await mockSignUp(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          ...corsHeaders,
          "set-auth-token": "session-token",
        },
        body: JSON.stringify({
          token: "session-token",
          user: {
            id: "user-1",
            name: "Ada Lovelace",
            email: "ada@example.com",
            emailVerified: false,
            image: null,
            createdAt: "2026-10-24T18:00:00.000Z",
            updatedAt: "2026-10-24T18:00:00.000Z",
          },
        }),
      })
    })

    await page.goto("/sign-up")
    await fillSignUpForm(page, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "correct-horse-1",
      confirmPassword: "correct-horse-1",
    })
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(
      page.getByRole("heading", { name: "Project ready!" })
    ).toBeVisible()
    await expect(page).toHaveURL("/")
  })
})
