const DEV_FALLBACK_API_BASE_URL = "http://127.0.0.1:8000"

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "")
  }

  if (process.env.NODE_ENV === "development") {
    return DEV_FALLBACK_API_BASE_URL
  }

  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL for non-development environment")
}
