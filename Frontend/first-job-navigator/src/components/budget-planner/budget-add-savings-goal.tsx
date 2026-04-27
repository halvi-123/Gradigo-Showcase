"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateMoney, roundMoney, MAX_MONEY, MONEY_STEP, blockNegativeInput  } from "@/lib/budget-planner/validation"
import type { AddSavingsGoalInput } from "@/lib/budget-planner/types"

export function AddSavingsGoalDialog({ onAdd }: { onAdd: (input: AddSavingsGoalInput) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [current, setCurrent] = useState("")
  const [target, setTarget] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  async function submit() {
    if (!name.trim()) { setError("Please enter a goal name."); return }
    const targetError = validateMoney(target, "Target amount")
    if (targetError) { setError(targetError); return }
    if (Number(target) <= 0) { setError("Target amount must be greater than £0."); return }
    if (current) {
      const currentError = validateMoney(current, "Current amount", false)
      if (currentError) { setError(currentError); return }
    }
    if (Number(current) > Number(target)) { setError("Current amount cannot be greater than target amount."); return }
    if (targetDate) {
        const yearStr = targetDate.split("-")[0]
        if (yearStr.length !== 4) { setError("Please enter a valid 4-digit year."); return }
        if (targetDate < minDate) { setError("Target date must be in the future."); return }
        }

    setError(null)
    setSaving(true)
    await onAdd({
      name: name.trim(),
      current_amount: roundMoney(Number(current) || 0),
      target_amount: roundMoney(Number(target)),
      target_date: targetDate || null,
    })
    setName(""); setCurrent(""); setTarget(""); setTargetDate("")
    setSaving(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null) }}>
      <DialogTrigger asChild>
        <Button className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none text-sm">
          + Add Savings Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0d1321] border border-border/60 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add Savings Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-white/70">Goal Name</Label>
            <Input placeholder="e.g. Holiday Fund" value={name} onChange={e => setName(e.target.value)}
            maxLength={50} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          <div className="flex gap-2">
            <div className="space-y-1 flex-1">
              <Label className="text-white/70">Current Amount (£)</Label>
              <Input type="number" step={MONEY_STEP} max={MAX_MONEY} placeholder="0" value={current} onKeyDown={blockNegativeInput}
                onChange={e => setCurrent(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-white/70">Target Amount (£)</Label>
              <Input type="number" step={MONEY_STEP} max={MAX_MONEY} placeholder="e.g. 1500" value={target} onKeyDown={blockNegativeInput}
                onChange={e => setTarget(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Target Date <span className="text-white/30">(optional)</span></Label>
            <Input type="date" value={targetDate} onChange={e => { setTargetDate(e.target.value); setError(null) }} onKeyDown={blockNegativeInput}
              min={minDate} className="bg-white/5 border-white/10 text-white" />
            <p className="text-xs text-white/30">Set a date to get monthly savings insights.</p>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="w-full bg-[#3e5c76] hover:bg-[#1d2d44] text-white">
            {saving ? "Adding..." : "Add Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}