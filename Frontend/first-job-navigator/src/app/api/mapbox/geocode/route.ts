import { NextResponse } from "next/server"

const UK_BBOX = "-8.82,49.79,1.92,60.94"
const MAPBOX_GEOCODING_BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"
const POSTCODES_IO_BASE_URL = "https://api.postcodes.io/postcodes"

function getMapboxToken() {
  return process.env.MAPBOX_DEV_ACCESS_TOKEN?.trim()
}

function normalizePostcode(postcode: string) {
  return postcode.trim().toUpperCase()
}

async function tryMapboxGeocode(postcode: string, token: string) {
  const geocodeUrl = new URL(`${MAPBOX_GEOCODING_BASE_URL}/${encodeURIComponent(postcode)}.json`)
  geocodeUrl.searchParams.set("country", "gb")
  geocodeUrl.searchParams.set("types", "postcode,place,locality,neighborhood")
  geocodeUrl.searchParams.set("bbox", UK_BBOX)
  geocodeUrl.searchParams.set("limit", "1")
  geocodeUrl.searchParams.set("access_token", token)

  const response = await fetch(geocodeUrl.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as {
    features?: Array<{
      center?: [number, number]
      place_name?: string
    }>
  }

  const feature = payload.features?.[0]
  const longitude = feature?.center?.[0]
  const latitude = feature?.center?.[1]

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return null
  }

  return {
    longitude,
    latitude,
    placeName: feature?.place_name ?? postcode,
  }
}

async function tryPostcodesIoGeocode(postcode: string) {
  const response = await fetch(`${POSTCODES_IO_BASE_URL}/${encodeURIComponent(postcode)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    return null
  }

  const payload = (await response.json()) as {
    status?: number
    result?: {
      longitude?: number
      latitude?: number
      postcode?: string
      admin_district?: string
      region?: string
    }
  }

  const longitude = payload.result?.longitude
  const latitude = payload.result?.latitude

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return null
  }

  const placeName = [payload.result?.admin_district, payload.result?.region]
    .filter((value): value is string => Boolean(value))
    .join(", ")

  return {
    longitude,
    latitude,
    placeName: placeName || payload.result?.postcode || postcode,
  }
}

export async function GET(request: Request) {
  const token = getMapboxToken()

  const { searchParams } = new URL(request.url)
  const postcode = normalizePostcode(searchParams.get("postcode") ?? "")

  if (!postcode) {
    return NextResponse.json(
      {
        ok: false,
        message: "Postcode query parameter is required.",
      },
      { status: 400 },
    )
  }

  let result: { longitude: number; latitude: number; placeName: string } | null = null

  if (token) {
    try {
      result = await tryMapboxGeocode(postcode, token)
    } catch {
      result = null
    }
  }

  if (!result) {
    try {
      result = await tryPostcodesIoGeocode(postcode)
    } catch {
      result = null
    }
  }

  if (!result) {
    return NextResponse.json(
      {
        ok: false,
        message: "Could not find coordinates for this postcode.",
      },
      { status: 404 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      result,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    },
  )
}
