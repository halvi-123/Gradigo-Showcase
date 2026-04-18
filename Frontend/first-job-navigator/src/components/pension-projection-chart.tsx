"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PensionProjectionResult } from "@/lib/pension/types"

type Props = {
  result: PensionProjectionResult
}

function formatCurrency(value: number) {
  if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}m`
  if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`
  return `£${value.toFixed(0)}`
}

export function PensionProjectionChart({ result }: Props) {
  const { projections } = result

  const chartData = projections.mid.yearly_breakdown.map((midEntry) => {
    const lowEntry = projections.low.yearly_breakdown.find((e) => e.age === midEntry.age)
    const highEntry = projections.high.yearly_breakdown.find((e) => e.age === midEntry.age)
    return {
      age: midEntry.age,
      high: Math.round(highEntry?.pot_value ?? 0),
      mid: Math.round(midEntry.pot_value),
      low: Math.round(lowEntry?.pot_value ?? 0),
    }
  })

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader>
        <CardTitle>Pension Projection</CardTitle>
        <p className="text-sm text-[#f0ebd8]/70">
          Projected pot value at retirement age {result.retirement_age}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="age"
                stroke="#f0ebd8"
                tick={{ fill: "#f0ebd8", fontSize: 12 }}
                label={{ value: "Age", position: "insideBottom", offset: -5, fill: "#f0ebd8" }}
              />
              <YAxis
                stroke="#f0ebd8"
                width={44}
                tick={{ fill: "#f0ebd8", fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), ""]}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{ backgroundColor: "#1d2d44", border: "1px solid #3e5c76", color: "#f0ebd8" }}
                itemSorter={(item) => {
                  if (item.dataKey === "high") return 0
                  if (item.dataKey === "mid") return 1
                  return 2
                }}
              />
              <Legend
                wrapperStyle={{ color: "#f0ebd8", paddingTop: "20px" }}
                content={() => (
                  <div className="flex justify-center gap-6 pt-2">
                    {[
                      { label: "High (7%)", color: "#ffffff" },
                      { label: "Mid (5%)", color: "#f0ebd8" },
                      { label: "Low (3%)", color: "#748cab" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs" style={{ color: "#f0ebd8" }}>
                        <div className="h-0.5 w-4" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
              <Line type="monotone" dataKey="high" stroke="#ffffff" strokeWidth={2} dot={false} name="High (7%)" />
              <Line type="monotone" dataKey="mid" stroke="#f0ebd8" strokeWidth={2} dot={false} name="Mid (5%)" />
              <Line type="monotone" dataKey="low" stroke="#748cab" strokeWidth={2} dot={false} name="Low (3%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-[#1d2d44] p-3">
            <p className="text-xs text-[748cab]">Low (3%)</p>
            <p className="text-lg font-bold text-white">{formatCurrency(projections.low.projected_pot)}</p>
          </div>
          <div className="rounded-lg bg-[#1d2d44] p-3">
            <p className="text-xs text-[#f0ebd8]">Mid (5%)</p>
            <p className="text-lg font-bold text-white">{formatCurrency(projections.mid.projected_pot)}</p>
          </div>
          <div className="rounded-lg bg-[#1d2d44] p-3">
            <p className="text-xs text-[#ffffff]">High (7%)</p>
            <p className="text-lg font-bold text-white">{formatCurrency(projections.high.projected_pot)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}