import type {
  MapboxGeocodeResponse,
  MapboxGeocodeResult,
} from "@/lib/mapbox/types"

export type MapStylePreset = "clean" | "muted" | "night"

const geocodeCache = new Map<string, MapboxGeocodeResult>()
const geocodePendingRequests = new Map<string, Promise<MapboxGeocodeResult>>()

export async function fetchPostcodeGeocode(postcode: string): Promise<MapboxGeocodeResult> {
  const trimmedPostcode = postcode.trim()
  if (!trimmedPostcode) {
    throw new Error("Postcode is required")
  }

  const cacheKey = trimmedPostcode.toUpperCase()
  const cachedLocation = geocodeCache.get(cacheKey)
  if (cachedLocation) {
    return cachedLocation
  }

  const pendingLocation = geocodePendingRequests.get(cacheKey)
  if (pendingLocation) {
    return pendingLocation
  }

  const request = (async () => {
      const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!rawBase) {
        throw new Error("NEXT_PUBLIC_API_BASE_URL must be set to your backend URL")
      }
      const base = rawBase.replace(/\/$/, "")
      const url = `${base}/api/mapbox/geocode?postcode=${encodeURIComponent(trimmedPostcode)}`
    const response = await fetch(url)
    const payload = (await response.json()) as MapboxGeocodeResponse

    if (!response.ok || !payload.ok) {
      throw new Error(payload.ok ? "Failed to geocode postcode" : payload.message)
    }

    geocodeCache.set(cacheKey, payload.result)

    return payload.result
  })()

  geocodePendingRequests.set(cacheKey, request)

  try {
    return await request
  } finally {
    geocodePendingRequests.delete(cacheKey)
  }
}

export function buildStaticMapUrl(params: {
  longitude?: number
  latitude?: number
  zoom?: number
  stylePreset?: MapStylePreset
}) {
  const searchParams = new URLSearchParams()

  if (typeof params.longitude === "number") {
    searchParams.set("lng", String(params.longitude))
  }

  if (typeof params.latitude === "number") {
    searchParams.set("lat", String(params.latitude))
  }

  searchParams.set("zoom", String(params.zoom ?? 13))
  searchParams.set("style", params.stylePreset ?? "clean")

  const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!rawBase) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be set to your backend URL")
  }
  const base = rawBase.replace(/\/$/, "")
  return `${base}/api/mapbox/static?${searchParams.toString()}`
}
