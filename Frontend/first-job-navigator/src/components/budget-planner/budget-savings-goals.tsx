"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddSavingsGoalDialog } from "./budget-add-savings-goal"
import { validateMoney, roundMoney, MAX_MONEY, MONEY_STEP } from "@/lib/budget-planner/validation"
import type { SavingsGoal, AddSavingsGoalInput, EditSavingsGoalInput } from "@/lib/budget-planner/types"

interface Props {
  goals: SavingsGoal[]
  onAdd: (input: AddSavingsGoalInput) => Promise<void>
  onEdit: (input: EditSavingsGoalInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function formatMoney(val: number): string {
  if (val >= 1000000) return `£${(val / 1000000).toFixed(1)}M`
  if (val >= 100000) return `£${(val / 1000).toFixed(1)}k`
  return `£${val.toLocaleString("en-GB")}`
}

function generateGoalInsight(g: SavingsGoal): string | null {
  if (!g.target_date) return null
  const today = new Date()
  const target = new Date(g.target_date)
  const daysLeft = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft <= 0) return "This goal's target date has passed."
  const remaining = g.target_amount - g.current_amount
  if (remaining <= 0) return "🎉 You've reached your target!"
  if (remaining < 10) return `Almost there — just £${remaining.toFixed(2)} left to reach your goal!`
  const monthsLeft = daysLeft / 30.44
  const monthlyNeeded = remaining / monthsLeft
  const isOnTrack = g.current_amount / g.target_amount >= (1 - daysLeft / 365)
  if (daysLeft === 1) return `Target date is tomorrow — £${remaining.toFixed(0)} still needed.`
  if (daysLeft <= 30) return `${daysLeft} days left — you need £${monthlyNeeded.toFixed(0)}/month to reach your goal. ${isOnTrack ? "You're on track! 🎯" : "You're behind — consider saving more."}`
  const timeLeft = daysLeft >= 365
  ? `${Math.floor(daysLeft / 365)} year${Math.floor(daysLeft / 365) > 1 ? "s" : ""} ${Math.floor((daysLeft % 365) / 30)} month${Math.floor((daysLeft % 365) / 30) !== 1 ? "s" : ""}`
  : `${daysLeft} days`

return `${timeLeft} left — save £${monthlyNeeded.toFixed(0)}/month to reach your goal by ${target.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}. ${isOnTrack ? "You're on track! 🎯" : "You're a bit behind — try to save more each month."}`
}

export function BudgetSavingsGoals({ goals, onAdd, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCurrent, setEditCurrent] = useState("")
  const [editTarget, setEditTarget] = useState("")
  const [editTargetDate, setEditTargetDate] = useState("")
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const overallProgress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0

  function startEdit(g: SavingsGoal) {
    setEditingId(g.id); setEditName(g.name)
    setEditCurrent(String(g.current_amount)); setEditTarget(String(g.target_amount))
    setEditTargetDate(g.target_date ?? ""); setEditError(null)
  }

  async function handleSave(id: number) {
    if (!editName) { setEditError("Please enter a goal name."); return }
    const targetError = validateMoney(editTarget, "Target amount")
    if (targetError) { setEditError(targetError); return }
    if (editCurrent) {
      const currentError = validateMoney(editCurrent, "Current amount", false)
      if (currentError) { setEditError(currentError); return }
    }
    if (Number(editCurrent) > Number(editTarget)) { setEditError("Current amount cannot be greater than target amount."); return }
    if (editTargetDate) {
      const yearStr = editTargetDate.split("-")[0]
      if (yearStr.length !== 4) { setEditError("Please enter a valid 4-digit year."); return }
      if (editTargetDate < minDate) { setEditError("Target date must be in the future."); return }
    }
    setEditError(null)
    setSaving(true)
    await onEdit({
      id, name: editName,
      current_amount: roundMoney(Number(editCurrent) || 0),
      target_amount: roundMoney(Number(editTarget)),
      target_date: editTargetDate || null,
    })
    setEditingId(null); setSaving(false)
  }

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Track progress towards your financial targets.</p>
          </div>
          <div className="shrink-0">
            <AddSavingsGoalDialog onAdd={onAdd} />
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border/40 mb-4 mx-6" />
      <CardContent className="space-y-5">

        <div className="flex items-start gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
          <span className="text-sm mt-0.5 shrink-0">💡</span>
          <p className="text-xs text-white/50 leading-relaxed">
            Savings goals are long-term targets and are tracked separately from your monthly budget. Adding to a savings goal <span className="text-white/70">won't affect your remaining income</span> or health score.
          </p>
        </div>

        {goals.length > 0 && (
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="flex flex-wrap justify-between items-center text-sm gap-1">
              <span className="text-white/70">Total saved across all goals</span>
              <span className="text-white font-medium">
                {formatMoney(totalSaved)} <span className="text-white/40 font-normal">/ {formatMoney(totalTarget)}</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, backgroundColor: "#4ade80" }} />
            </div>
            <p className="text-xs text-white/40">{Math.floor(overallProgress)}% of total target reached</p>
          </div>
        )}

        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🎯</div>
            <p className="text-sm text-white/50 text-center">No savings goals yet.</p>
            <p className="text-xs text-white/30 text-center max-w-xs">Add a savings goal to start tracking your progress towards financial targets.</p>
          </div>
        )}

        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((g) => {
              const progress = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0
              const isComplete = progress >= 100
              const isEditing = editingId === g.id
              const barColor = isComplete ? "#22d3ee" : progress >= 75 ? "#4ade80" : progress >= 40 ? "#fbbf24" : "#3e5c76"
              const insight = generateGoalInsight(g)

              return (
                <div key={g.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Goal name"
                        maxLength={50}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                      <div className="flex gap-2">
                        <Input type="number" step={MONEY_STEP} max={MAX_MONEY} value={editCurrent}
                          onChange={e => setEditCurrent(e.target.value)} placeholder="Current (£)"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                        <Input type="number" step={MONEY_STEP} max={MAX_MONEY} value={editTarget}
                          onChange={e => setEditTarget(e.target.value)} placeholder="Target (£)"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white/50">Target Date <span className="text-white/30">(optional)</span></p>
                        <Input type="date" value={editTargetDate}
                          onChange={e => { setEditTargetDate(e.target.value); setEditError(null) }}
                          min={minDate} className="bg-white/5 border-white/10 text-white h-8 text-sm" />
                      </div>
                      {editError && <p className="text-xs text-red-400">{editError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" disabled={saving} onClick={() => handleSave(g.id)}
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                          {saving ? "Saving…" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditError(null) }}
                          className="h-7 text-xs text-gray-400 hover:text-white">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Goal name + complete badge — name wraps, badge shrinks */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <span className="font-medium text-white text-sm break-words min-w-0">{g.name}</span>
                        {isComplete && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full shrink-0">Complete</span>}
                      </div>

                      {g.target_date && !isComplete && (
                        <p className="text-xs text-white/40">🗓 Target: {new Date(g.target_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                      )}

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold" style={{ color: barColor }}>{Math.floor(progress)}</span>
                        <span className="text-sm text-white/40">%</span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>

                      {/* Amounts — compact only if >= 1M */}
                      <p className="text-xs text-white/50 break-words">
                        {formatMoney(g.current_amount)} / {formatMoney(g.target_amount)}
                      </p>

                      {insight && (
                        <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2">
                          <p className="text-xs text-white/60 leading-relaxed">{insight}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => startEdit(g)} className="text-xs text-white/50 hover:text-white shrink-0">Edit</button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-xs text-red-400/70 hover:text-red-400 shrink-0">Delete</button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#0d1321] border border-border/60 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Savings Goal</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Are you sure you want to delete <span className="text-white font-medium">{g.name}</span>? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(g.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}