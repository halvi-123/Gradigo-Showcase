import { getApiBaseUrl } from "@/lib/api/base-url"

describe("getApiBaseUrl", () => {
  const mutableEnv = process.env as Record<string, string | undefined>
  const originalNodeEnv = mutableEnv.NODE_ENV
  const originalApiBaseUrl = mutableEnv.NEXT_PUBLIC_API_BASE_URL

  function setNodeEnv(value: string | undefined) {
    mutableEnv.NODE_ENV = value
  }

  function setApiBaseUrl(value: string | undefined) {
    if (value === undefined) {
      delete mutableEnv.NEXT_PUBLIC_API_BASE_URL
      return
    }

    mutableEnv.NEXT_PUBLIC_API_BASE_URL = value
  }

  beforeEach(() => {
    setNodeEnv("test")
    setApiBaseUrl(undefined)
  })

  afterEach(() => {
    setNodeEnv(originalNodeEnv)
    setApiBaseUrl(originalApiBaseUrl)
  })

  it("returns the configured API base URL when NEXT_PUBLIC_API_BASE_URL variable is set", () => {
    setApiBaseUrl("https://api.firstjobnavigator.com")

    expect(getApiBaseUrl()).toBe("https://api.firstjobnavigator.com")
  })

  it("trims a trailing slash from the configured API base URL", () => {
    setApiBaseUrl("https://api.firstjobnavigator.com/")

    expect(getApiBaseUrl()).toBe("https://api.firstjobnavigator.com")
  })

  it("returns the development fallback when the env var is missing in development for our work", () => {
    setNodeEnv("development")
    setApiBaseUrl(undefined)

    expect(getApiBaseUrl()).toBe("http://127.0.0.1:8000")
  })

  it("throws when the env var is missing outside development for prod/staging environments", () => {
    setNodeEnv("test")
    setApiBaseUrl(undefined)

    expect(() => getApiBaseUrl()).toThrow(
      "Missing NEXT_PUBLIC_API_BASE_URL for non-development environment",
    )
  })
})
