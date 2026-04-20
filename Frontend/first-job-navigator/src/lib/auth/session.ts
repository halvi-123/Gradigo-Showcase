export type AuthSession = {
  accessToken: string
  refreshToken: string
  email?: string
  fullName?: string
}

export const AUTH_SESSION_CHANGED_EVENT = "fjna-auth-session-changed"

const AUTH_STORAGE_KEYS = {
  accessToken: "fjna.access_token",
  refreshToken: "fjna.refresh_token",
  email: "fjna.user_email",
  fullName: "fjna.user_full_name",
} as const

function canUseStorage() {
  return typeof window !== "undefined"
}

function setStorageItem(key: string, value: string | undefined) {
  if (!canUseStorage()) {
    return
  }

  if (value) {
    window.localStorage.setItem(key, value)
    return
  }

  window.localStorage.removeItem(key)
}

function notifyAuthSessionChanged() {
  if (!canUseStorage()) {
    return
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}

export function getStoredAccessToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
}

export function getStoredRefreshToken() {
  if (!canUseStorage()) {
    return null
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken)
}

export function getStoredAuthSession(): AuthSession | null {
  const accessToken = getStoredAccessToken()
  const refreshToken = getStoredRefreshToken()

  if (!accessToken || !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
    email: canUseStorage() ? window.localStorage.getItem(AUTH_STORAGE_KEYS.email) ?? undefined : undefined,
    fullName: canUseStorage() ? window.localStorage.getItem(AUTH_STORAGE_KEYS.fullName) ?? undefined : undefined,
  }
}

export function setAuthSession(session: AuthSession) {
  setStorageItem(AUTH_STORAGE_KEYS.accessToken, session.accessToken)
  setStorageItem(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken)
  setStorageItem(AUTH_STORAGE_KEYS.email, session.email)
  setStorageItem(AUTH_STORAGE_KEYS.fullName, session.fullName)
  notifyAuthSessionChanged()
}

export function clearAuthSession() {
  setStorageItem(AUTH_STORAGE_KEYS.accessToken, undefined)
  setStorageItem(AUTH_STORAGE_KEYS.refreshToken, undefined)
  setStorageItem(AUTH_STORAGE_KEYS.email, undefined)
  setStorageItem(AUTH_STORAGE_KEYS.fullName, undefined)
  notifyAuthSessionChanged()
}

export function buildBearerAuthHeaders(): Record<string, string> {
  const accessToken = getStoredAccessToken()

  if (!accessToken) {
    return {}
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  }
}
