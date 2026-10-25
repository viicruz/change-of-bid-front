//* Libraries imports
import { expect, test, type Page, type Route } from "@playwright/test"

const describe = test.describe
const it = test

const signInEndpoint = "**/api/auth/sign-in/email"
const tokenKey = "change-of-bid.bearer-token"

const corsHeaders = {
  "access-control-allow-origin": "http://localhost:3000",
  "access-control-allow-credentials": "true",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-expose-headers": "set-auth-token",
}

type SignInInput = {
  email: string
  password: string
}

async function fillSignInForm(page: Page, input: SignInInput) {
  await page.getByLabel("E-mail").fill(input.email)
  await page.getByLabel("Senha").fill(input.password)
}

async function mockSignIn(
  page: Page,
  handler: (route: Route) => Promise<void>
) {
  await page.route(signInEndpoint, async (route) => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }

    await handler(route)
  })
}

describe("sign-in page", () => {
  it("shows the sign-in form", async ({ page }) => {
    await page.goto("/sign-in")

    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
    await expect(page.getByLabel("E-mail")).toBeVisible()
    await expect(page.getByLabel("Senha")).toBeVisible()
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
    await expect(
      page.getByRole("link", { name: "Criar uma conta" })
    ).toBeVisible()
  })

  it("blocks an invalid email and a short password without calling the API", async ({
    page,
  }) => {
    let requestCount = 0

    await mockSignIn(page, async (route) => {
      requestCount += 1
      await route.abort()
    })

    await page.goto("/sign-in")
    await fillSignInForm(page, {
      email: "not-an-email",
      password: "short",
    })
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(
      page.getByText("Digite um endereço de e-mail válido")
    ).toBeVisible()
    await expect(
      page.getByText("A senha deve ter pelo menos 8 caracteres")
    ).toBeVisible()
    expect(requestCount).toBe(0)
    await expect(page).toHaveURL(/\/sign-in$/)
  })

  it("shows that the credentials are invalid when the API returns 401", async ({
    page,
  }) => {
    await mockSignIn(page, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Invalid email or password",
          code: "INVALID_EMAIL_OR_PASSWORD",
        }),
      })
    })

    await page.goto("/sign-in")
    await fillSignInForm(page, {
      email: "ada@example.com",
      password: "correct-horse-1",
    })
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible()
    await expect(page).toHaveURL(/\/sign-in$/)
  })

  it("stores the bearer token and redirects home when the API accepts the sign-in", async ({
    page,
  }) => {
    await mockSignIn(page, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          ...corsHeaders,
          "set-auth-token": "session-token",
        },
        body: JSON.stringify({
          token: null,
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

    await page.goto("/sign-in")
    await fillSignInForm(page, {
      email: "ada@example.com",
      password: "correct-horse-1",
    })
    await page.getByRole("button", { name: "Entrar" }).click()

    await expect(page).toHaveURL("/")
    await expect
      .poll(() => page.evaluate((key) => sessionStorage.getItem(key), tokenKey))
      .toBe("session-token")
  })
})
