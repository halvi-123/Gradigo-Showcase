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
import type { SavingsGoal, AddSavingsGoalInput, EditSavingsGoalInput } from "@/lib/budget-planner/types"

interface Props {
  goals: SavingsGoal[]
  onAdd: (input: AddSavingsGoalInput) => Promise<void>
  onEdit: (input: EditSavingsGoalInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function BudgetSavingsGoals({ goals, onAdd, onEdit, onDelete }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editCurrent, setEditCurrent] = useState("")
  const [editTarget, setEditTarget] = useState("")
  const [saving, setSaving] = useState(false)

  const totalSaved = goals.reduce((s, g) => s + g.current_amount, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0)
  const overallProgress = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0

  function startEdit(g: SavingsGoal) {
    setEditingId(g.id)
    setEditName(g.name)
    setEditCurrent(String(g.current_amount))
    setEditTarget(String(g.target_amount))
  }

  async function handleSave(id: number) {
    if (!editName || !editTarget) return
    setSaving(true)
    await onEdit({ id, name: editName, current_amount: Number(editCurrent) || 0, target_amount: Number(editTarget) })
    setEditingId(null)
    setSaving(false)
  }

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Track progress towards your financial targets.</p>
          </div>
          <AddSavingsGoalDialog onAdd={onAdd} />
        </div>
      </CardHeader>
      <Separator className="bg-border/40 mb-4 mx-6" />
      <CardContent className="space-y-5">

        {/* Savings separate notice */}
        <div className="flex items-start gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
          <span className="text-sm mt-0.5">💡</span>
          <p className="text-xs text-white/50 leading-relaxed">
            Savings goals are long-term targets and are tracked separately from your monthly budget. Adding to a savings goal <span className="text-white/70">won't affect your remaining income</span> or health score.
          </p>
        </div>

        {/* Overall progress bar — only shown when there are goals */}
        {goals.length > 0 && (
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Total saved across all goals</span>
              <span className="text-white font-medium">£{totalSaved.toLocaleString("en-GB")} <span className="text-white/40 font-normal">/ £{totalTarget.toLocaleString("en-GB")}</span></span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overallProgress}%`, backgroundColor: "#4ade80" }} />
            </div>
            <p className="text-xs text-white/40">{overallProgress.toFixed(0)}% of total target reached</p>
          </div>
        )}

        {/* Empty state */}
        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🎯</div>
            <p className="text-sm text-white/50 text-center">No savings goals yet.</p>
            <p className="text-xs text-white/30 text-center max-w-xs">Add a savings goal to start tracking your progress towards financial targets.</p>
          </div>
        )}

        {/* Goals grid */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {goals.map((g) => {
              const progress = g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0
              const isComplete = progress >= 100
              const isEditing = editingId === g.id
              const barColor = isComplete ? "#22d3ee" : progress >= 75 ? "#4ade80" : progress >= 40 ? "#fbbf24" : "#3e5c76"

              return (
                <div key={g.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Goal name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                      <div className="flex gap-2">
                        <Input type="number" value={editCurrent} onChange={e => setEditCurrent(e.target.value)} placeholder="Current (£)"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                        <Input type="number" value={editTarget} onChange={e => setEditTarget(e.target.value)} placeholder="Target (£)"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-8 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" disabled={saving} onClick={() => handleSave(g.id)}
                          className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                          {saving ? "Saving…" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                          className="h-7 text-xs text-gray-400 hover:text-white">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-white text-sm">{g.name}</span>
                        {isComplete && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full shrink-0">Complete</span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold" style={{ color: barColor }}>{progress.toFixed(0)}</span>
                        <span className="text-sm text-white/40">%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: barColor }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">£{g.current_amount.toLocaleString("en-GB")} / £{g.target_amount.toLocaleString("en-GB")}</span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => startEdit(g)} className="text-xs text-white/50 hover:text-white">Edit</button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-xs text-red-400/70 hover:text-red-400">Delete</button>
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