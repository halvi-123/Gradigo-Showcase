"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AddTransactionInput, EditTransactionInput, CategoryBreakdown, Transaction } from "@/lib/budget-planner/types"

interface AddProps {
  mode: "add"
  categories: CategoryBreakdown[]
  onAdd: (input: AddTransactionInput) => Promise<void>
}

interface EditProps {
  mode: "edit"
  categories: CategoryBreakdown[]
  transaction: Transaction
  onEdit: (input: EditTransactionInput) => Promise<void>
}

type Props = AddProps | EditProps

export function AddTransactionDialog(props: Props) {
  const isEdit = props.mode === "edit"
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isEdit && open) {
      const tx = (props as EditProps).transaction
      setName(tx.name)
      setAmount(String(tx.amount))
      setDate(tx.date)
      setCategoryId(tx.category_id)
    }
  }, [open, isEdit])

  async function submit() {
    if (!name.trim()) { setError("Please enter a transaction name."); return }
    if (!amount || Number(amount) <= 0) { setError("Amount must be greater than £0."); return }
    if (!categoryId) { setError("Please select a category."); return }
    if (!date) { setError("Please select a date."); return }

    setSaving(true); setError(null)
    if (isEdit) {
      await (props as EditProps).onEdit({ id: (props as EditProps).transaction.id, name: name.trim(), amount: Number(amount), date, category_id: Number(categoryId) })
    } else {
      await (props as AddProps).onAdd({ name: name.trim(), amount: Number(amount), date, category_id: Number(categoryId) })
    }
    if (!isEdit) { setName(""); setAmount(""); setCategoryId(""); setDate(new Date().toISOString().split("T")[0]) }
    setSaving(false); setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit
          ? <button className="text-xs text-gray-500 hover:text-gray-200">Edit</button>
          : <Button className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none text-sm">+ Log Transaction</Button>
        }
      </DialogTrigger>
      <DialogContent className="bg-[#0d1321] border border-border/60 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{isEdit ? "Edit Transaction" : "Log Transaction"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-white/70">Transaction Name</Label>
            <Input placeholder="e.g. Tesco shop" value={name} onChange={e => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Amount (£)</Label>
            <Input type="number" min={0.01} step={0.01} placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500" />
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Category</Label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3e5c76]">
              <option value="" disabled>Select a category…</option>
              {props.categories.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0d1321]">{c.category_name}</option>
              ))}
            </select>
            {/* Hint to add categories in Spending tab */}
            {!isEdit && (
              <p className="text-xs text-white/40 mt-1">
                💡 Need a different category? Add one in the <span className="text-white/60 underline">Spending</span> tab.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-white/70">Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            min={`${new Date().getFullYear() - 2}-01-01`}
            className="bg-white/5 border-white/10 text-white" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="w-full bg-[#3e5c76] hover:bg-[#1d2d44] text-white">
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Log Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}