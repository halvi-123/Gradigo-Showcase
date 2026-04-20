"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CircleHelpIcon, ShieldAlertIcon } from "lucide-react"
import { Label, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { LuMousePointerClick } from "react-icons/lu"
import { useMoveOutReadinessSummaryPanel } from "@/hooks/use-move-out-readiness-summary-panel"

type MoveOutReadinessSummaryPanelProps = {
  plan: MoveOutReadinessPlan | null
  loadError?: string | null
}

export function MoveOutReadinessSummaryPanel({ plan, loadError = null }: MoveOutReadinessSummaryPanelProps) {
  const {
    metricOrder,
    metricCards,
    readinessChart,
    readinessNarrative,
    selectedMetric,
    selectedMetricCard,
    setSelectedMetric,
  } = useMoveOutReadinessSummaryPanel({ plan })

  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlertIcon className="h-4 w-4" />
            Are you ready?
          </CardTitle>
          <CardDescription>
            A comprehensive view of your readiness score and financial profile.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!metricCards || !readinessChart || !readinessNarrative || !selectedMetricCard) {
    return null
  }

  return (
    <Card className="overflow-hidden border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldAlertIcon className="h-4 w-4" />
          Are you ready?
        </CardTitle>
        <CardDescription>
          A comprehensive view of your readiness score and financial profile.
        </CardDescription>
      </CardHeader>

      {loadError ? (
        <CardContent>
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {loadError}
          </div>
        </CardContent>
      ) : null}

      <CardContent className="space-y-4 text-sm">
        <div className="p-1">
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="order-1 flex flex-col gap-3 md:min-h-[170px]">
              <div>
                <p className="text-base font-semibold text-foreground">{plan.areaName || "Selected area"}</p>
                <p className="text-xs text-muted-foreground">{plan.targetPostcode}</p>
              </div>

              <div className="hidden space-y-1 md:mt-auto md:block">
                <p className={`text-sm font-semibold ${readinessNarrative.tone}`}>{readinessNarrative.headline}</p>
              </div>
            </div>

            <div className="order-2">
              <ChartContainer config={readinessChart.config} className="mx-auto aspect-square max-h-[152px] min-h-[152px] min-w-[152px] w-full">
                <RadialBarChart data={readinessChart.data} startAngle={90} endAngle={-270} innerRadius={56} outerRadius={74}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted/25 last:fill-card"
                    polarRadius={[66, 60]}
                  />
                  <RadialBar dataKey="score" background cornerRadius={999} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy - 10} className="fill-muted-foreground text-[18px]">
                                Readiness
                              </tspan>
                              <tspan x={viewBox.cx} y={viewBox.cy + 15} className="fill-foreground text-2xl font-bold">
                                {readinessChart.rounded}%
                              </tspan>
                            </text>
                          )
                        }

                        return null
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {metricOrder.map((key) => {
              const metric = metricCards[key]
              const isSelected = selectedMetric === key

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMetric(key)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${metric.shell} ${isSelected ? "ring-2 ring-ring/60" : "opacity-95 hover:opacity-100"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-xs uppercase tracking-wide ${metric.labelTone}`}>{metric.label}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${metric.labelTone}`}>
                      <LuMousePointerClick className="h-3.5 w-3.5" />
                      Click me!
                    </span>
                  </div>
                  <p className={`mt-2 leading-none font-semibold tracking-tight break-words text-[clamp(1.6rem,2.6vw,2.4rem)] ${metric.valueTone}`}>
                    {metric.value}
                  </p>
                </button>
              )
            })}
          </div>

          <div className={`rounded-xl border p-4 ${selectedMetricCard.shell}`}>
            <p className={`text-xs uppercase tracking-wide ${selectedMetricCard.labelTone}`}>Metric Detail</p>
            <p className={`mt-1 text-xl font-semibold ${selectedMetricCard.valueTone}`}>{selectedMetricCard.detailTitle}</p>

            <div className={`mt-4 space-y-3 text-sm ${selectedMetricCard.labelTone}`}>
              <p>
                <span className={selectedMetricCard.valueTone}>What this shows:</span>{" "}
                {selectedMetricCard.detailDescription}
              </p>
              <p>
                <span className={selectedMetricCard.valueTone}>How it is sourced:</span>{" "}
                {selectedMetricCard.detailMethod}
              </p>
              <p>
                <span className={selectedMetricCard.valueTone}>User impact:</span>{" "}
                {selectedMetricCard.detailImpact}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
          {metricOrder.map((key) => {
            const metric = metricCards[key]

            return (
              <div key={key} className={`rounded-xl border p-4 ${metric.shell}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs uppercase tracking-wide ${metric.labelTone}`}>{metric.label}</p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Info about ${metric.label}`}
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${metric.labelTone}`}
                      >
                        <CircleHelpIcon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>
                      {metric.shortHint}
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className={`mt-2 leading-none font-semibold tracking-tight break-words text-[clamp(1.8rem,6vw,2.5rem)] ${metric.valueTone}`}>
                  {metric.value}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
