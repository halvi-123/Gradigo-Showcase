import { getApiBaseUrl } from "@/lib/api/base-url"
import {
  buildBearerAuthHeaders,
  clearAuthSession,
  getStoredRefreshToken,
  setAuthSession,
} from "@/lib/auth/session"

const ACCOUNTS_BASE_PATH = "/api/accounts"

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  fullName: string
  password: string
}

export type AuthUser = {
  userId: string
  email: string
  fullName: string
  createdAt: string
}

export type ForgotPasswordInput = {
  email: string
}

export type ResetPasswordInput = {
  uidb64: string
  token: string
  password: string
}

type LoginApiResponse = {
  access: string
  refresh: string
}

type MeApiResponse = {
  user_id: string
  email: string
  full_name: string
  created_at: string
}

type MessageApiResponse = {
  message: string
}

function getRequestUrl(path: string) {
  return `${getApiBaseUrl()}${ACCOUNTS_BASE_PATH}${path}`
}

function parseErrorMessage(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>
    const errorMessage = typeof record.error === "string" ? record.error : null
    const detailMessage = typeof record.detail === "string" ? record.detail : null

    let fieldMessage: string | null = null
    for (const value of Object.values(record)) {
      if (typeof value === "string" && value.trim()) {
        fieldMessage = value.trim()
        break
      }

      if (Array.isArray(value)) {
        const candidate = value.find((item): item is string => typeof item === "string" && Boolean(item.trim()))
        if (candidate) {
          fieldMessage = candidate.trim()
          break
        }
      }
    }

    return errorMessage ?? detailMessage ?? fieldMessage ?? fallbackMessage
  }

  return fallbackMessage
}

async function readJsonResponse(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const response = await fetch(getRequestUrl("/login/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const payload = (await readJsonResponse(response)) as LoginApiResponse | { error?: string; detail?: string } | null

  if (!response.ok || !payload || typeof payload !== "object" || !("access" in payload) || !("refresh" in payload)) {
    throw new Error(parseErrorMessage(payload, "We could not sign you in right now. Please try again."))
  }

  setAuthSession({
    accessToken: payload.access,
    refreshToken: payload.refresh,
    email: input.email,
  })

  const user = await fetchCurrentUser()
  return user
}

export async function register(input: RegisterInput): Promise<void> {
  const response = await fetch(getRequestUrl("/register/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      full_name: input.fullName,
      password: input.password,
    }),
  })

  const payload = await readJsonResponse(response)

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, "We could not create your account right now. Please try again."))
  }
}

export async function requestPasswordReset(input: ForgotPasswordInput): Promise<MessageApiResponse> {
  const response = await fetch(getRequestUrl("/forgot-password/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const payload = (await readJsonResponse(response)) as MessageApiResponse | { error?: string; detail?: string } | null

  if (!response.ok || !payload || typeof payload !== "object" || !("message" in payload)) {
    throw new Error(parseErrorMessage(payload, "We could not send the reset link right now. Please try again."))
  }

  return payload
}

export async function submitPasswordReset(input: ResetPasswordInput): Promise<MessageApiResponse> {
  const response = await fetch(getRequestUrl("/reset-password/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })

  const payload = (await readJsonResponse(response)) as MessageApiResponse | { error?: string; detail?: string } | null

  if (!response.ok || !payload || typeof payload !== "object" || !("message" in payload)) {
    throw new Error(parseErrorMessage(payload, "We could not reset your password right now. Please try again."))
  }

  return payload
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await fetch(getRequestUrl("/me/"), {
    headers: {
      ...buildBearerAuthHeaders(),
    },
  })

  const payload = (await readJsonResponse(response)) as MeApiResponse | { error?: string; detail?: string } | null

  if (!response.ok || !payload || typeof payload !== "object" || !("user_id" in payload)) {
    throw new Error(parseErrorMessage(payload, "We could not load your account right now."))
  }

  return {
    userId: payload.user_id,
    email: payload.email,
    fullName: payload.full_name,
    createdAt: payload.created_at,
  }
}

export async function logout() {
  const refreshToken = getStoredRefreshToken()

  if (refreshToken) {
    await fetch(getRequestUrl("/logout/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildBearerAuthHeaders(),
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
  }

  clearAuthSession()
}
