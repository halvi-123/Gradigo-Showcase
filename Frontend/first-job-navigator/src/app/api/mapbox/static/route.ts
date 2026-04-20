import { NextResponse } from "next/server"

const UK_CENTER = {
  lng: -2.5,
  lat: 54.8,
  zoom: 13,
}

function getMapboxToken() {
  return process.env.MAPBOX_DEV_ACCESS_TOKEN?.trim()
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseNumber(value: string | null) {
  if (value == null) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getStyleId(stylePreset: string | null) {
  switch (stylePreset) {
    case "muted":
      return "light-v11"
    case "night":
      return "dark-v11"
    case "clean":
    default:
      return "streets-v12"
  }
}

function buildFallbackSvg(hasMarker: boolean) {
  const markerText = hasMarker ? "Marker preview available" : "UK overview fallback"
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="Fallback map image">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <g fill="none" stroke="#94a3b8" stroke-width="1.5" opacity="0.6">
    <path d="M80 120h1120"/><path d="M80 220h1120"/><path d="M80 320h1120"/><path d="M80 420h1120"/><path d="M80 520h1120"/><path d="M80 620h1120"/>
    <path d="M180 80v560"/><path d="M360 80v560"/><path d="M540 80v560"/><path d="M720 80v560"/><path d="M900 80v560"/><path d="M1080 80v560"/>
  </g>
  <circle cx="640" cy="360" r="14" fill="#1d4ed8" opacity="0.9"/>
  <circle cx="640" cy="360" r="34" fill="#1d4ed8" opacity="0.2"/>
  <text x="640" y="660" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#334155">Map unavailable right now - using fallback preview</text>
  <text x="640" y="695" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#475569">${markerText}</text>
</svg>`.trim()
}

export async function GET(request: Request) {
  const token = getMapboxToken()

  const { searchParams } = new URL(request.url)
  const lng = parseNumber(searchParams.get("lng"))
  const lat = parseNumber(searchParams.get("lat"))
  const zoomFromQuery = parseNumber(searchParams.get("zoom"))
  const stylePreset = searchParams.get("style")
  const styleId = getStyleId(stylePreset)

  const zoom = clamp(zoomFromQuery ?? UK_CENTER.zoom, 10, 15)
  const centerLng = clamp(lng ?? UK_CENTER.lng, -8.82, 1.92)
  const centerLat = clamp(lat ?? UK_CENTER.lat, 49.79, 60.94)

  const hasMarker = typeof lng === "number" && typeof lat === "number"

  if (!token) {
    const svg = buildFallbackSvg(hasMarker)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=300",
      },
    })
  }

  const markerOverlay = hasMarker
    ? `pin-s+1d4ed8(${centerLng.toFixed(5)},${centerLat.toFixed(5)})/`
    : ""

  const staticMapUrl = new URL(
    `https://api.mapbox.com/styles/v1/mapbox/${styleId}/static/${markerOverlay}${centerLng.toFixed(5)},${centerLat.toFixed(5)},${zoom.toFixed(2)},0/1280x720@2x`,
  )

  staticMapUrl.searchParams.set("logo", "false")
  staticMapUrl.searchParams.set("attribution", "false")
  staticMapUrl.searchParams.set("access_token", token)

  let upstreamResponse: Response

  try {
    upstreamResponse = await fetch(staticMapUrl.toString(), {
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 },
    })
  } catch {
    const svg = buildFallbackSvg(hasMarker)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=300",
      },
    })
  }

  if (!upstreamResponse.ok) {
    const svg = buildFallbackSvg(hasMarker)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=300",
      },
    })
  }

  const imageBuffer = await upstreamResponse.arrayBuffer()

  return new NextResponse(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  })
}
