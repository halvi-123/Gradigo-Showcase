"use client"

import { useState } from "react"
import { PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddCategoryDialog } from "./budget-add-category"
import { validateMoney, MAX_MONEY, MONEY_STEP, blockNegativeInput } from "@/lib/budget-planner/validation"
import type { CategoryBreakdown, EditCategoryInput, AddCategoryInput } from "@/lib/budget-planner/types"

const COLORS = [
  "#4d96ff",
  "#ff6b6b",
  "#51cf66",
  "#fcc419",
  "#cc5de8",
  "#20c997",
  "#f06595",
  "#ff922b",

]

const DEFAULT_CATEGORIES = ["Rent", "Bills", "Groceries", "Entertainment", "Subscriptions", "Transport"]

interface Props {
  breakdown: CategoryBreakdown[]
  onAdd: (input: AddCategoryInput) => Promise<void>
  onEdit: (input: EditCategoryInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
  netIncome: number
}

function generateSpendingInsight(breakdown: CategoryBreakdown[], netIncome: number): string | null {
  if (breakdown.length === 0) return "Add categories to start tracking your spending."
  const hasAnySpending = breakdown.some(c => c.spent_amount > 0)
  if (!hasAnySpending) return "No spending logged yet. Log a transaction to start tracking."
  const overLimit = breakdown.filter(c => c.limit_amount !== null && c.spent_amount > c.limit_amount)
  const nearLimit = breakdown.filter(c => c.limit_amount !== null && c.limit_amount > 0 && (c.spent_amount / c.limit_amount) >= 0.8 && c.spent_amount <= c.limit_amount)
  const biggest = [...breakdown].filter(c => c.spent_amount > 0).sort((a, b) => b.spent_amount - a.spent_amount)[0]
  if (overLimit.length > 0) {
    const names = overLimit.map(c => c.category_name)
    const nameStr = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
    return `${nameStr} ${overLimit.length === 1 ? "has" : "have"} exceeded ${overLimit.length === 1 ? "its" : "their"} limit this month. Consider reducing spending in ${overLimit.length === 1 ? "this category" : "these categories"}.`
  }
  if (nearLimit.length > 0)
    return `${nearLimit[0].category_name} is close to its limit — you've used ${Math.round((nearLimit[0].spent_amount / nearLimit[0].limit_amount!) * 100)}% already. Keep an eye on it for the rest of the month.`
  if (biggest && netIncome > 0) {
    const pct = Math.round((biggest.spent_amount / netIncome) * 100)
    return `${biggest.category_name} is your biggest expense, making up ${pct}% of your monthly income. ${pct > 40 ? "This is quite high — consider whether this can be reduced." : "This looks reasonable."}`
  }
  return "Your spending looks balanced across all categories. Keep it up!"
}

export function BudgetBreakdown({ breakdown, onAdd, onEdit, onDelete, netIncome }: Props) {
  const total = breakdown.reduce((s, c) => s + c.spent_amount, 0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editLimit, setEditLimit] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const hasSpending = breakdown.some(c => c.spent_amount > 0)
  const data = breakdown.filter(c => c.spent_amount > 0).map(c => ({ name: c.category_name, value: c.spent_amount }))
  const chartConfig = Object.fromEntries(
    breakdown.map((c, i) => [c.category_name, {
      label: `${c.category_name} (${total > 0 ? Math.round((c.spent_amount / total) * 100) : 0}%)`,
      color: COLORS[i % COLORS.length],
    }])
  )

  const insight = generateSpendingInsight(breakdown, netIncome)

  function startEdit(c: CategoryBreakdown) {
    setEditingId(c.id)
    setEditLimit(c.limit_amount !== null ? String(c.limit_amount) : "")
    setEditError(null)
  }

  async function handleSave(id: number) {
    if (editLimit) {
      const limitError = validateMoney(editLimit, "Spending limit", false)
      if (limitError) { setEditError(limitError); return }
      if (Number(editLimit) <= 0) { setEditError("Spending limit must be greater than £0."); return }
    }
    setEditError(null)
    setSaving(true)
    const cat = breakdown.find(c => c.id === id)!
    await onEdit({ id, name: cat.category_name, allocated: cat.spent_amount, limit: editLimit ? Number(editLimit) : undefined })
    setEditingId(null); setSaving(false)
  }

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Spending Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">Breakdown of spending by category.</p>
      </CardHeader>
      <Separator className="bg-border/40 mb-4 mx-6" />
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT — Pie chart */}
          <div className="flex flex-col gap-4">
            {hasSpending ? (
              <ChartContainer config={chartConfig} className="h-[200px] sm:h-[320px] w-full">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name">
                    {data.map((entry, i) => (
                      <Cell key={i} fill={COLORS[breakdown.findIndex(c => c.category_name === entry.name) % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend
                    content={({ payload }) => (
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                        {payload?.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              /* Empty state for pie chart */
              <div className="flex flex-col items-center justify-center h-[200px] sm:h-[320px] gap-3">
                <svg viewBox="0 0 128 128" className="w-32 h-32 opacity-20">
                  <circle cx="64" cy="64" r="52" fill="none" stroke="white" strokeWidth="20" strokeDasharray="326" strokeDashoffset="0" />
                </svg>
                <p className="text-xs text-white/40 text-center">Log transactions to see your spending breakdown</p>
              </div>
            )}
            <AddCategoryDialog onAdd={onAdd} existingNames={breakdown.map(c => c.category_name)} />
          </div>

          {/* RIGHT — Category bars + insight */}
          <div className="flex flex-col gap-4">
            <div className="space-y-4">
              {breakdown.map((c, i) => {
                const limitPct = c.limit_amount && c.limit_amount > 0 ? Math.min(100, (c.spent_amount / c.limit_amount) * 100) : 0
                const isOver = c.limit_amount !== null && c.spent_amount >= c.limit_amount
                const isEditing = editingId === c.id

                return (
                  <div key={c.id} className="space-y-2">
                    {isEditing ? (
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
                        <p className="text-sm font-medium text-white">{c.category_name}</p>
                        <div className="space-y-1">
                          <p className="text-xs text-white/50">Spending limit (£)</p>
                          <Input type="number" min={0} step={MONEY_STEP} max={MAX_MONEY} value={editLimit} onKeyDown={blockNegativeInput}
                            onChange={e => { setEditLimit(e.target.value); setEditError(null) }}
                            placeholder="No limit"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                        </div>
                        {editError && <p className="text-xs text-red-400">{editError}</p>}
                        <div className="flex gap-2">
                          <Button size="sm" disabled={saving} onClick={() => handleSave(c.id)}
                            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                            {saving ? "Saving…" : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditError(null) }}
                            className="h-7 text-xs text-gray-400 hover:text-white">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-sm font-medium text-white break-words min-w-0">{c.category_name}</span>
                            </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">£{c.spent_amount}</span>
                            {c.limit_amount !== null && <span className="text-xs text-muted-foreground023e8a">/ £{c.limit_amount}</span>}
                            {isOver && <Badge variant="destructive" className="text-xs px-1.5 py-0">Over</Badge>}
                            <button onClick={() => startEdit(c)} className="text-xs text-gray-500 hover:text-gray-200">
                              {c.limit_amount !== null ? "Edit limit" : "Add limit"}
                            </button>
                            {!DEFAULT_CATEGORIES.includes(c.category_name) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="text-xs text-red-500/50 hover:text-red-400">Delete</button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#0d1321] border border-border/60 text-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      Are you sure you want to delete <span className="text-white font-medium">{c.category_name}</span>? All transactions in this category will also be deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(c.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${limitPct}%`, backgroundColor: isOver ? "#ef4444" : "#184e77" }} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {c.limit_amount ? `${limitPct.toFixed(0)}% of limit used` : `${c.percentage.toFixed(0)}% of total spending`}
                        </p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Spending insight */}
            {insight && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">💡</span>
                  <div>
                    <p className="text-xs font-medium text-white mb-1">Spending Insight</p>
                    <p className="text-xs text-white/60 leading-relaxed">{insight}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}