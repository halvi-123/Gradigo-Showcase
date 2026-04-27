"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AddTransactionDialog } from "./budget-add-transaction"
import type { Transaction, CategoryBreakdown, AddTransactionInput, EditTransactionInput } from "@/lib/budget-planner/types"

interface Props {
  transactions: Transaction[]
  categories: CategoryBreakdown[]
  onAdd: (input: AddTransactionInput) => Promise<void>
  onEdit: (input: EditTransactionInput) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const COLORS = ["#4a7fa5", "#6b9ab8", "#2d5a7a", "#3d6e8a", "#1e3f55", "#5590a8"]
const CATEGORY_COLORS: Record<string, string> = {
  Rent: "#4a7fa5", Food: "#6b9ab8", Entertainment: "#2d5a7a",
  Groceries: "#3d6e8a", Subscriptions: "#1e3f55", Transport: "#5590a8",
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]

function getCategoryColor(name: string, i: number): string {
  return CATEGORY_COLORS[name] ?? COLORS[i % COLORS.length]
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const SELECT_CLASS = "rounded-md border border-white/10 bg-white/5 px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3e5c76] transition-opacity min-w-0"

export function BudgetTransactions({ transactions, categories, onAdd, onEdit, onDelete }: Props) {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all")

  const yearOptions = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2]
  const categoryFiltering = selectedCategory !== "all"

  const filtered = transactions.filter(tx => {
    if (categoryFiltering) return tx.category_id === selectedCategory
    const d = new Date(tx.date)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  const grouped = filtered
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce<Record<string, Transaction[]>>((acc, tx) => {
      const key = formatDateLabel(tx.date)
      if (!acc[key]) acc[key] = []
      acc[key].push(tx)
      return acc
    }, {})

  const totalLogged = filtered.reduce((s, t) => s + t.amount, 0)
  const categoriesUsed = new Set(filtered.map(t => t.category_id)).size

  const emptyMessage = categoryFiltering
    ? `No transactions in ${categories.find(c => c.id === selectedCategory)?.category_name ?? "this category"}.`
    : `No transactions for ${MONTHS[selectedMonth]} ${selectedYear}.`

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">
              Log your spending to automatically update category totals and your health score.
            </p>
          </div>
          <div className="shrink-0">
            <AddTransactionDialog mode="add" categories={categories} onAdd={onAdd} />
          </div>
        </div>
      </CardHeader>
      <Separator className="bg-border/40 mb-4 mx-6" />
      <CardContent className="space-y-5">

        {/* Filters row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Month + Year */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              disabled={categoryFiltering}
              className={`${SELECT_CLASS} ${categoryFiltering ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i} className="bg-[#0d1321]">{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              disabled={categoryFiltering}
              className={`${SELECT_CLASS} ${categoryFiltering ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {yearOptions.map(y => (
                <option key={y} value={y} className="bg-[#0d1321]">{y}</option>
              ))}
            </select>
            <span className="text-xs text-white/40">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
              {categoryFiltering && " · all time"}
            </span>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="text-xs text-white/40 hidden lg:block shrink-0">
              💡 Select a category to see all its transactions across all time
            </span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value === "all" ? "all" : Number(e.target.value))}
              className={`${SELECT_CLASS} shrink-0`}
            >
              <option value="all" className="bg-[#0d1321]">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-[#0d1321]">{c.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: "Total logged", value: totalLogged >= 100000 ? `£${(totalLogged / 1000).toFixed(0)}k` : `£${totalLogged.toFixed(2)}` },
            { label: "Transactions", value: String(filtered.length) },
            { label: "Categories",   value: String(categoriesUsed) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 sm:px-4 sm:py-3 min-w-0">
              <p className="text-[10px] sm:text-xs text-white/50 mb-1 truncate">{label}</p>
              <p className="text-sm sm:text-xl font-bold text-white break-words">{value}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl">🧾</div>
            <p className="text-sm text-white/50 text-center">{emptyMessage}</p>
            <p className="text-xs text-white/30 text-center max-w-xs">
              Log a transaction to start tracking your spending.
            </p>
          </div>
        )}

        {/* Grouped by date */}
        {Object.entries(grouped).map(([dateLabel, txs]) => (
          <div key={dateLabel} className="space-y-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wide">{dateLabel}</p>
            <div className="space-y-1.5">
              {txs.map((tx, i) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-3 hover:bg-white/[0.08] transition-colors gap-2 min-w-0">
                  {/* Left — name + category */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getCategoryColor(tx.category_name, i) }} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.name}</p>
                      <p className="text-xs text-white/40 truncate">{tx.category_name}</p>
                    </div>
                  </div>
                  {/* Right — amount + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-red-400 shrink-0">-£{tx.amount.toFixed(2)}</span>
                    <Badge className="text-[10px] px-2 py-0 hidden md:inline-flex border-none shrink-0"
                      style={{ backgroundColor: `${getCategoryColor(tx.category_name, i)}30`, color: getCategoryColor(tx.category_name, i) }}>
                      {tx.category_name}
                    </Badge>
                    <AddTransactionDialog mode="edit" categories={categories} transaction={tx} onEdit={onEdit} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="text-xs text-red-500/50 hover:text-red-400 transition-colors shrink-0">Delete</button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0d1321] border border-border/60 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete <span className="text-white font-medium">{tx.name}</span> (£{tx.amount.toFixed(2)})? This will update your category totals.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(tx.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </CardContent>
    </Card>
  )
}