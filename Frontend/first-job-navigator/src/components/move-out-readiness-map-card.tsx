"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"
import { Layers2Icon, MapPinIcon } from "lucide-react"
import { useMoveOutReadinessMapCard } from "@/hooks/use-move-out-readiness-map-card"

type MoveOutReadinessMapCardProps = {
  plan: MoveOutReadinessPlan | null
  isInitialLoading?: boolean
  loadError?: string | null
}

const CRIME_LEGEND_ITEMS = [
  { label: "Very Low", color: "#0b6b3a" },
  { label: "Low", color: "#166534" },
  { label: "Moderate", color: "#f59e0b" },
  { label: "High", color: "#ef4444" },
  { label: "Very High", color: "#ff0000" },
]

const AFFORDABILITY_LEGEND_ITEMS = [
  { label: "Comfortable (Lower pressure)", color: "#14b8a6" },
  { label: "Stretched (Tight budget)", color: "#a855f7" },
  { label: "High Risk (Over budget)", color: "#ec4899" },
]

type OverlayToggleProps = {
  activeOverlay: "crime" | "affordability"
  onSetOverlay: (overlay: "crime" | "affordability") => void
  compact?: boolean
}

function OverlayToggleGroup({ activeOverlay, onSetOverlay, compact = false }: OverlayToggleProps) {
  const legendItems = activeOverlay === "crime" ? CRIME_LEGEND_ITEMS : AFFORDABILITY_LEGEND_ITEMS

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={activeOverlay === "crime" ? "default" : "outline"}
              className={compact ? "h-7 px-2 text-xs" : undefined}
              onClick={() => onSetOverlay("crime")}
            >
              Crime
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-xs">
            Shows safety pressure based on crime level for this area.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={activeOverlay === "affordability" ? "default" : "outline"}
              className={compact ? "h-7 px-2 text-xs" : undefined}
              onClick={() => onSetOverlay("affordability")}
            >
              Affordability
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-56 text-xs">
            Shows monthly rent pressure against your current budget.
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        className={
          compact
            ? "grid gap-1.5 text-[11px] text-muted-foreground"
            : "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground"
        }
      >
        {legendItems.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-sm" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function MoveOutReadinessMapCard({
  plan,
  isInitialLoading = false,
  loadError = null,
}: MoveOutReadinessMapCardProps) {
  const {
    activeOverlay,
    affordabilityOverlayLabel,
    activeLayer,
    crimeOverlayLabel,
    geocodeError,
    inMapOverlayDescription,
    layerBaseDiameter,
    layerOuterDiameter,
    mapImageUrl,
    setActiveOverlay,
    showLoadingState,
    targetLocation,
  } = useMoveOutReadinessMapCard({
    plan,
    isInitialLoading,
  })

  return (
    <Card className="overflow-hidden border-dashed">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Area Map
            </CardTitle>
            <CardDescription>
              Showcases your selected postcode region with contextual overlays for crime and affordability. 
            </CardDescription>
          </div>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <Layers2Icon className="h-4 w-4" />
            Layers
          </div>
        </div>

        <div className="pt-2 md:hidden">
          <OverlayToggleGroup activeOverlay={activeOverlay} onSetOverlay={setActiveOverlay} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showLoadingState ? (
          <div className="space-y-2">
            <Skeleton className="h-[340px] w-full rounded-xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="group/map relative overflow-hidden rounded-2xl border border-slate-800/10 bg-slate-900 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mapImageUrl}
                alt="Move-out target map"
                className="h-[340px] w-full object-cover"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/15 via-transparent to-slate-900/35" />

              <div className="absolute right-3 top-3 z-30 hidden rounded-md bg-background/90 p-1.5 shadow-sm backdrop-blur md:block">
                <OverlayToggleGroup
                  activeOverlay={activeOverlay}
                  onSetOverlay={setActiveOverlay}
                  compact
                />
              </div>

              {activeLayer ? (
                <div className="group/layer absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500"
                    style={{
                      width: `${layerBaseDiameter}px`,
                      height: `${layerBaseDiameter}px`,
                      backgroundColor: activeLayer.color,
                      borderColor: activeLayer.color,
                      opacity: Math.min(0.24, Math.max(0.14, activeLayer.opacity)),
                    }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500"
                    style={{
                      width: `${layerOuterDiameter}px`,
                      height: `${layerOuterDiameter}px`,
                      backgroundColor: activeLayer.color,
                      borderColor: activeLayer.color,
                      opacity: Math.min(0.16, Math.max(0.08, activeLayer.opacity - 0.08)),
                    }}
                  />

                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-[240px] -translate-x-1/2 -translate-y-[150px] rounded-md border bg-background/95 px-2.5 py-2 text-[11px] shadow-sm opacity-0 transition-opacity duration-200 group-hover/layer:opacity-100">
                    <p className="font-medium text-foreground">{activeLayer.label}</p>
                    <p className="mt-0.5 text-muted-foreground">{inMapOverlayDescription}</p>
                  </div>
                </div>
              ) : null}

              {targetLocation ? (
                <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-background/90 px-2.5 py-1.5 text-xs shadow-sm">
                  <p className="font-medium text-foreground">{targetLocation.placeName}</p>
                  <p className="text-muted-foreground">
                    {targetLocation.latitude.toFixed(4)}, {targetLocation.longitude.toFixed(4)}
                  </p>
                </div>
              ) : null}
            </div>

            {loadError ? <p className="text-sm text-amber-700">{loadError}</p> : null}
            {geocodeError ? <p className="text-sm text-amber-700">{geocodeError}</p> : null}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="rounded-md border px-3 py-2">
                <span className="font-medium text-foreground">Crime:</span>{" "}
                {crimeOverlayLabel}
              </div>
              <div className="rounded-md border px-3 py-2">
                <span className="font-medium text-foreground">Affordability:</span>{" "}
                {affordabilityOverlayLabel}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
