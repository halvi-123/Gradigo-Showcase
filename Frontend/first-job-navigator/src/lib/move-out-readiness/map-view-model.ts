import type {
  AffordabilityOverlayViewModel,
  CrimeOverlayViewModel,
} from "@/lib/mapbox/types"
import type {
  MoveOutCrimeLevel,
  MoveOutReadinessPlan,
} from "@/lib/move-out-readiness/types"

const crimeOverlayMap: Record<MoveOutCrimeLevel, CrimeOverlayViewModel> = {
  "Very Low": { label: "Crime: Very Low", opacity: 0.16, color: "#0b6b3a" },
  Low: { label: "Crime: Low", opacity: 0.22, color: "#166534" },
  Moderate: { label: "Crime: Moderate", opacity: 0.2, color: "#f59e0b" },
  High: { label: "Crime: High", opacity: 0.28, color: "#ef4444" },
  "Very High": { label: "Crime: Very High", opacity: 0.42, color: "#ff0000" },
  Unknown: { label: "Crime: Unknown", opacity: 0.12, color: "#64748b" },
}

const affordabilityOverlayMap: Record<
  MoveOutReadinessPlan["affordabilityBand"],
  AffordabilityOverlayViewModel
> = {
  comfortable: { label: "Affordability: Comfortable", opacity: 0.2, color: "#14b8a6" },
  stretched: { label: "Affordability: Stretched", opacity: 0.3, color: "#a855f7" },
  "high-risk": { label: "Affordability: High Risk", opacity: 0.38, color: "#ec4899" },
}

export function getCrimeOverlay(crimeLevel: MoveOutCrimeLevel): CrimeOverlayViewModel {
  return crimeOverlayMap[crimeLevel]
}

export function getAffordabilityOverlay(
  affordabilityBand: MoveOutReadinessPlan["affordabilityBand"],
): AffordabilityOverlayViewModel {
  return affordabilityOverlayMap[affordabilityBand]
}
