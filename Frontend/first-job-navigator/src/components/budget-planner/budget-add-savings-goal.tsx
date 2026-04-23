"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AddSavingsGoalInput } from "@/lib/budget-planner/types"

export function AddSavingsGoalDialog({ onAdd }: { onAdd: (input: AddSavingsGoalInput) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [current, setCurrent] = useState("")
  const [target, setTarget] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!name || !target) return
    setSaving(true)
    await onAdd({ name, current_amount: Number(current) || 0, target_amount: Number(target) })
    setName(""); setCurrent(""); setTarget("")
    setSaving(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none text-sm">+ Add Savings Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Savings Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label>Goal Name</Label>
            <Input placeholder="e.g. Holiday Fund" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Current Amount (£)</Label>
            <Input type="number" placeholder="0" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Target Amount (£)</Label>
            <Input type="number" placeholder="e.g. 1500" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="w-full">
            {saving ? "Adding..." : "Add Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}