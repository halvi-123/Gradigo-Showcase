import { useEffect, useMemo, useState } from "react"
import { buildStaticMapUrl, fetchPostcodeGeocode } from "@/lib/mapbox/client"
import type { MapboxGeocodeResult } from "@/lib/mapbox/types"
import { getAffordabilityOverlay, getCrimeOverlay } from "@/lib/move-out-readiness/map-view-model"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

type ActiveOverlay = "crime" | "affordability"

type UseMoveOutReadinessMapCardArgs = {
  plan: MoveOutReadinessPlan | null
  isInitialLoading?: boolean
}

export type UseMoveOutReadinessMapCardResult = {
  activeOverlay: ActiveOverlay
  setActiveOverlay: (overlay: ActiveOverlay) => void
  isGeocoding: boolean
  geocodeError: string | null
  targetLocation: MapboxGeocodeResult | null
  mapImageUrl: string
  showLoadingState: boolean
  activeLayer:
    | ReturnType<typeof getCrimeOverlay>
    | ReturnType<typeof getAffordabilityOverlay>
    | null
  inMapOverlayDescription: string
  crimeOverlayLabel: string
  affordabilityOverlayLabel: string
  crimeOverlayAvailable: boolean
  affordabilityOverlayAvailable: boolean
  layerBaseDiameter: number
  layerOuterDiameter: number
}

const MAP_ZOOM = 13

function getMapScaleFactor(viewportWidth: number) {
  if (viewportWidth >= 1440) {
    return 1.15
  }

  if (viewportWidth <= 768) {
    return 0.8
  }

  return 1
}

function getZoomScaleFactor(mapZoom: number) {
  const normalized = Math.max(10, Math.min(15, mapZoom))
  return 0.85 + (normalized - 10) * 0.06
}

function formatOverlayLabel(label: string) {
  return label.replace(/^Crime:\s*/, "").replace(/^Affordability:\s*/, "")
}

export function useMoveOutReadinessMapCard({
  plan,
  isInitialLoading = false,
}: UseMoveOutReadinessMapCardArgs): UseMoveOutReadinessMapCardResult {
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>("crime")
  const [viewportWidth, setViewportWidth] = useState(1280)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [targetLocation, setTargetLocation] = useState<MapboxGeocodeResult | null>(null)

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadGeocode() {
      if (!plan?.targetPostcode) {
        setTargetLocation(null)
        setGeocodeError(null)
        return
      }

      setIsGeocoding(true)
      setGeocodeError(null)

      try {
        const location = await fetchPostcodeGeocode(plan.targetPostcode)
        if (!isCancelled) {
          setTargetLocation(location)
        }
      } catch (error) {
        if (!isCancelled) {
          setTargetLocation(null)
          setGeocodeError(
            error instanceof Error && error.message
              ? error.message
              : "Could not load map coordinates for this postcode. Showing fallback map.",
          )
        }
      } finally {
        if (!isCancelled) {
          setIsGeocoding(false)
        }
      }
    }

    void loadGeocode()

    return () => {
      isCancelled = true
    }
  }, [plan?.targetPostcode])

  const crimeOverlay = useMemo(() => {
    return plan ? getCrimeOverlay(plan.crimeLevel) : null
  }, [plan])

  const affordabilityOverlay = useMemo(() => {
    return plan ? getAffordabilityOverlay(plan.affordabilityBand) : null
  }, [plan])

  const mapImageUrl = useMemo(() => {
    if (!targetLocation) {
      return buildStaticMapUrl({ zoom: MAP_ZOOM })
    }

    return buildStaticMapUrl({
      longitude: targetLocation.longitude,
      latitude: targetLocation.latitude,
      zoom: MAP_ZOOM,
    })
  }, [targetLocation])

  const activeLayer = activeOverlay === "crime" ? crimeOverlay : affordabilityOverlay
  const effectiveCrimeLevel = plan?.crimeLevel ?? "Unknown"
  const effectiveAffordabilityBand = plan?.affordabilityBand ?? "stretched"

  const mapScaleFactor = useMemo(() => {
    return getMapScaleFactor(viewportWidth)
  }, [viewportWidth])

  const zoomScaleFactor = useMemo(() => {
    return getZoomScaleFactor(MAP_ZOOM)
  }, [])

  const layerBaseDiameter = useMemo(() => {
    const base = activeOverlay === "crime" ? 138 : 152
    return Math.round(base * mapScaleFactor * zoomScaleFactor)
  }, [activeOverlay, mapScaleFactor, zoomScaleFactor])

  const layerOuterDiameter = useMemo(() => {
    const outer = activeOverlay === "crime" ? 236 : 258
    return Math.round(outer * mapScaleFactor * zoomScaleFactor)
  }, [activeOverlay, mapScaleFactor, zoomScaleFactor])

  const inMapOverlayDescription = useMemo(() => {
    if (activeOverlay === "crime") {
      if (effectiveCrimeLevel === "Very Low") {
        return "In this area, crime is very low compared with nearby alternatives."
      }

      if (effectiveCrimeLevel === "Low") {
        return "In this area, crime appears low and generally manageable."
      }

      if (effectiveCrimeLevel === "Moderate") {
        return "In this area, crime is around a moderate level."
      }

      if (effectiveCrimeLevel === "High") {
        return "In this area, crime is on the higher side, so extra caution is recommended."
      }

      return "In this area, crime is very high and may significantly affect move-out confidence."
    }

    if (effectiveAffordabilityBand === "comfortable") {
      return "In this area, rent pressure looks comfortable for your current budget."
    }

    if (effectiveAffordabilityBand === "stretched") {
      return "In this area, affordability is stretched and may require tighter monthly planning."
    }

    return "In this area, rent pressure is high-risk relative to your current monthly budget."
  }, [activeOverlay, effectiveAffordabilityBand, effectiveCrimeLevel])

  return {
    activeOverlay,
    setActiveOverlay,
    isGeocoding,
    geocodeError,
    targetLocation,
    mapImageUrl,
    showLoadingState: isInitialLoading || isGeocoding,
    activeLayer,
    inMapOverlayDescription,
    crimeOverlayLabel: crimeOverlay ? formatOverlayLabel(crimeOverlay.label) : "Not available",
    affordabilityOverlayLabel: affordabilityOverlay ? formatOverlayLabel(affordabilityOverlay.label) : "Not available",
    crimeOverlayAvailable: Boolean(crimeOverlay),
    affordabilityOverlayAvailable: Boolean(affordabilityOverlay),
    layerBaseDiameter,
    layerOuterDiameter,
  }
}