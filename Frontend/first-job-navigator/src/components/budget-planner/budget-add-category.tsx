"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validateMoney, MAX_MONEY, MONEY_STEP, blockNegativeInput } from "@/lib/budget-planner/validation"
import type { AddCategoryInput } from "@/lib/budget-planner/types"

export function AddCategoryDialog({ onAdd, existingNames = [] }: { onAdd: (input: AddCategoryInput) => Promise<void>, existingNames?: string[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [limit, setLimit] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!name.trim()) { setError("Please enter a category name."); return }
    if (existingNames.map(n => n.toLowerCase()).includes(name.trim().toLowerCase())) {
  setError("A category with this name already exists."); return
}
    if (limit) {
      const limitError = validateMoney(limit, "Spending limit", false)
      if (limitError) { setError(limitError); return }
      if (Number(limit) <= 0) { setError("Spending limit must be greater than £0."); return }
    }
    setError(null)
    setSaving(true)
    await onAdd({ name: name.trim(), allocated: 0, limit: limit ? Number(limit) : undefined })
    setName(""); setLimit("")
    setSaving(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setError(null) }}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none text-sm">
          + Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0d1321] border border-border/60 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Add Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-white/70">Category Name</Label>
            <Input placeholder="e.g. Gym, Eating Out" value={name} onChange={e => setName(e.target.value)}
            maxLength={50} className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Spending Limit (£, optional)</Label>
            <Input type="number" step={MONEY_STEP} max={MAX_MONEY} placeholder="No limit" value={limit} onKeyDown={blockNegativeInput}
              onChange={e => setLimit(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="w-full bg-[#3e5c76] hover:bg-[#1d2d44] text-white">
            {saving ? "Adding..." : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}