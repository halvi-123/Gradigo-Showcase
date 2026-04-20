"use client"

import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

type MoveOutReadinessMeterProps = {
  score: number
  statusLabel: string
  statusTone: MoveOutReadinessPlan["statusTone"]
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}

function getColorByScore(score: number) {
  if (score >= 75) {
    return { stroke: "#16a34a", label: "Good", hex: "16a34a" }
  }
  if (score >= 50) {
    return { stroke: "#eab308", label: "Fair", hex: "eab308" }
  }
  return { stroke: "#ef4444", label: "Needs work", hex: "ef4444" }
}

export function MoveOutReadinessMeter({ score, statusLabel }: MoveOutReadinessMeterProps) {
  const safeScore = clampScore(score)
  const { stroke, label } = getColorByScore(safeScore)

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (safeScore / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border/60 bg-gradient-to-b from-background/40 to-transparent p-8">
      <div className="relative h-32 w-32">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-chart-5 dark:text-chart-4"
            opacity="0.15"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-chart-1">{safeScore}%</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-lg font-semibold text-chart-1">Are you ready?</h3>
        <p className="text-sm text-chart-3">{statusLabel}</p>
      </div>
    </div>
  )
}
