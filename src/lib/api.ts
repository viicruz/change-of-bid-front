//* Libraries imports
import * as z from "zod"

//* Local imports
import { backendBaseUrl } from "@/src/lib/backend-url"

type ApiGetOptions<T> = {
  url: string
  schema: z.ZodType<T>
  errorSchema: z.ZodType<{ message: string }>
  params?: Record<string, string | undefined>
}

type ApiPostOptions<T> = {
  url: string
  schema: z.ZodType<T>
  errorSchema: z.ZodType<{ message: string }>
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export class ApiSchemaError extends Error {
  readonly issues: z.core.$ZodIssue[]

  constructor(issues: z.core.$ZodIssue[]) {
    super(issues[0]?.message ?? "Response did not match the schema")
    this.name = "ApiSchemaError"
    this.issues = issues
  }
}

function resolveUrl(
  path: string,
  params: Record<string, string | undefined> | undefined
) {
  const base = backendBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${base}${normalizedPath}`)

  if (!params) {
    return url
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.append(key, value)
    }
  }

  return url
}

function readHttpError(
  status: number,
  text: string,
  errorSchema: z.ZodType<{ message: string }>
) {
  const trimmed = text.trim()

  if (trimmed.length === 0) {
    return new ApiError(status, `Request failed with status ${status}`, text)
  }

  let payload: unknown

  try {
    payload = JSON.parse(trimmed)
  } catch {
    return new ApiError(status, trimmed, text)
  }

  const parsed = errorSchema.safeParse(payload)

  if (!parsed.success) {
    const message =
      payload !== null &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : trimmed

    return new ApiError(status, message, payload)
  }

  return new ApiError(status, parsed.data.message, parsed.data)
}

function parseSuccess<T>(text: string, schema: z.ZodType<T>) {
  let payload: unknown

  try {
    payload = JSON.parse(text)
  } catch {
    throw new ApiError(200, "Response body is not JSON", text)
  }

  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    throw new ApiSchemaError(parsed.error.issues)
  }

  return parsed.data
}

function jsonHeaders() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
  }
}

function acceptHeaders() {
  return {
    Accept: "application/json",
  }
}

export const api = {
  async get<T>(options: ApiGetOptions<T>) {
    const url = resolveUrl(options.url, options.params)
    const response = await fetch(url, {
      method: "GET",
      headers: acceptHeaders(),
    })
    const text = await response.text()

    if (!response.ok) {
      throw readHttpError(response.status, text, options.errorSchema)
    }

    return parseSuccess(text, options.schema)
  },

  async post<T>(options: ApiPostOptions<T>) {
    const url = resolveUrl(options.url, undefined)
    const hasBody = options.body !== undefined
    const response = await fetch(url, {
      method: "POST",
      headers: hasBody ? jsonHeaders() : acceptHeaders(),
      body: hasBody ? JSON.stringify(options.body) : undefined,
    })
    const text = await response.text()

    if (!response.ok) {
      throw readHttpError(response.status, text, options.errorSchema)
    }

    return parseSuccess(text, options.schema)
  },
}
