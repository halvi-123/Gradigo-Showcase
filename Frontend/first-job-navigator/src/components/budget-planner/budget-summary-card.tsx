"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { BudgetDashboard } from "@/lib/budget-planner/types"

interface Props {
  data: BudgetDashboard
  onUpdateIncome: (netIncome: number) => Promise<void>
}

const statCards = [
  { key: "remaining" as const, label: "Remaining", sub: "this month",       bg: "bg-[#0d1b2a]" },
  { key: "spent"     as const, label: "Spent",     sub: "this month",       bg: "bg-[#1b263b]" },
  { key: "saved"     as const, label: "Saved",     sub: "across all goals", bg: "bg-[#415a77]" },
]

export function BudgetSummaryCard({ data, onUpdateIncome }: Props) {
  const [editing, setEditing] = useState(data.net_income === 0)
  const [incomeValue, setIncomeValue] = useState(String(data.net_income ?? ""))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIncomeValue(String(data.net_income ?? ""))
    if (data.net_income === 0) setEditing(true)
  }, [data.net_income])

  const values = {
    remaining: data.remaining_income,
    spent:     data.total_spent,
    saved:     data.total_saved,
  }

  async function handleSaveIncome() {
    const parsed = parseFloat(incomeValue)
    if (isNaN(parsed) || parsed < 0) { setError("Please enter a valid income."); return }
    setSaving(true); setError(null)
    await onUpdateIncome(parsed)
    setEditing(false); setSaving(false)
  }

  return (
    <div className="space-y-3">
      {/* Income section — more prominent */}
      <div className="rounded-xl border border-[#1d2d44]/15 px-4 py-3 shadow-sm" style={{ backgroundColor: "#e0e1dd" }}>
        {editing ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#1d2d44]/60 uppercase tracking-wide">Monthly Income</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[140px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1d2d44]/50 font-medium">£</span>
                <Input
                  type="number"
                  value={incomeValue}
                  onChange={e => setIncomeValue(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSaveIncome()}
                  placeholder="Enter your monthly income"
                  className="pl-7 bg-white border-[#1d2d44]/20 text-[#1d2d44] text-base font-medium h-10"
                  autoFocus
                />
              </div>
              <Button disabled={saving} onClick={handleSaveIncome}
                className="h-10 px-5 bg-[#3e5c76] hover:bg-[#1d2d44] text-white text-sm">
                {saving ? "Saving…" : "Save"}
              </Button>
              {data.net_income > 0 && (
                <Button variant="ghost" onClick={() => { setEditing(false); setError(null) }}
                  className="h-10 text-sm text-[#1d2d44]/50 hover:text-[#1d2d44]">
                  Cancel
                </Button>
              )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {data.net_income === 0 && (
              <p className="text-xs text-[#1d2d44]/40">Set your monthly take-home pay to start tracking your budget.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#1d2d44]/50 uppercase tracking-wide mb-0.5">Monthly Income</p>
              <p className="text-xl font-bold text-[#1d2d44]">£{data.net_income.toLocaleString("en-GB")}</p>
            </div>
            <button
              onClick={() => { setEditing(true); setIncomeValue(String(data.net_income)) }}
              className="text-sm text-[#3e5c76] hover:text-[#1d2d44] font-medium border border-[#3e5c76]/40 hover:border-[#1d2d44]/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {statCards.map(({ key, label, sub, bg }) => (
          <Card key={key} className={`${bg} border-none shadow-none`}>
            <CardContent className="pt-3 pb-3 px-3 sm:pt-5 sm:pb-5 sm:px-6">
              <p className="text-[10px] sm:text-xs text-white/60 mb-1 uppercase tracking-wide">{label}</p>
              <p className={`text-base sm:text-3xl font-bold ${key === "remaining" && values[key] < 0 ? "text-red-300" : "text-white"}`}>
                £{values[key].toLocaleString("en-GB")}
              </p>
              <p className="hidden sm:block text-xs text-white/50 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}