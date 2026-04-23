"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AddCategoryInput } from "@/lib/budget-planner/types"

export function AddCategoryDialog({ onAdd }: { onAdd: (input: AddCategoryInput) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [limit, setLimit] = useState("")
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (!name) return
    setSaving(true)
    await onAdd({ name, allocated: 0, limit: limit ? Number(limit) : undefined })
    setName(""); setLimit("")
    setSaving(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Input
              placeholder="e.g. Gym, Eating Out"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Spending Limit (£, optional)</Label>
            <Input
              type="number"
              placeholder="No limit"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
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