"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { BudgetDashboard } from "@/lib/budget-planner/types"

export function BudgetScore({ data }: { data: BudgetDashboard }) {
  const score = data.financial_snapshot_score
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171"
  const label = score >= 80 ? "Healthy budget" : score >= 50 ? "Needs improvement" : "Budget at risk"
  const variant = (score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive") as "default" | "secondary" | "destructive"

  const netIncome = data.net_income
  const spentPct = netIncome > 0 ? Math.round((data.total_spent / netIncome) * 100) : 0
  const remPct = netIncome > 0 ? Math.round((data.remaining_income / netIncome) * 100) : 0

  // Score breakdown
  const factors = [
    {
      label: "Spent",
      value: `${spentPct}% of income`,
      color: spentPct > 80 ? "text-red-400" : spentPct > 60 ? "text-yellow-400" : "text-white/70"
    },
    {
      label: "Remaining",
      value: `${remPct > 0 ? remPct : 0}% of income`,
      color: remPct < 10 ? "text-red-400" : remPct < 20 ? "text-yellow-400" : "text-white/70"
    },
  ]

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Health Score</CardTitle>
        <p className="text-sm text-white/60">Based on your monthly spending and budget balance.</p>
      </CardHeader>
      <Separator className="bg-white/20 mb-3 mx-6" />
      <CardContent className="space-y-4">
        {/* Circle + badge */}
        <div className="flex items-center gap-5 py-1">
          <div className="relative flex items-center justify-center w-32 h-32 shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
              <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="9" />
              <circle
                cx="64" cy="64" r={radius} fill="none"
                stroke={color} strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-bold text-white leading-none">{score}</span>
              <span className="text-[10px] text-white/50">/ 100</span>
            </div>
          </div>
          <div className="space-y-2">
            <Badge variant={variant} className="text-xs">{label}</Badge>
            <p className="text-xs text-white/50 leading-relaxed">
              Score reflects your monthly spending habits only. Savings goals are tracked separately.
            </p>
          </div>
        </div>

        {/* Score breakdown — monthly only */}
        <div className="rounded-lg bg-white/5 border border-white/10 divide-y divide-white/10">
          {factors.map(({ label: fl, value, color: fc }) => (
            <div key={fl} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-white/50">{fl}</span>
              <span className={`text-xs font-medium ${fc}`}>{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}