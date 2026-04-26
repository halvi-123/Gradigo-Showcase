"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthSessionState } from "@/hooks/use-auth-session-state"
import { getStoredAuthSession } from "@/lib/auth/session"

import {
  getBudgetDashboard, getTransactions,
  updateBudget,
  addCategory, editCategory, deleteCategory,
  addSavingsGoal, editSavingsGoal, deleteSavingsGoal,
  addTransaction, editTransaction, deleteTransaction,
} from "@/lib/budget-planner/service"
import type {
  BudgetDashboard, Transaction,
  AddCategoryInput, EditCategoryInput,
  AddSavingsGoalInput, EditSavingsGoalInput,
  AddTransactionInput, EditTransactionInput,
} from "@/lib/budget-planner/types"

import { BudgetSummaryCard } from "./budget-summary-card"
import { BudgetBreakdown } from "./budget-breakdown"
import { BudgetScore } from "./budget-score"
import { BudgetAlerts } from "./budget-alerts"
import { BudgetSavingsGoals } from "./budget-savings-goals"
import { BudgetTransactions } from "./budget-transactions"

const MOCK_DATA: BudgetDashboard = {
  net_income: 2200,
  remaining_income: 1400,
  total_spent: 800,
  total_saved: 0,
  financial_snapshot_score: 85,
  alerts: [],
  category_breakdown: [
    { id: 1, category_name: "Rent",          spent_amount: 500, limit_amount: 600, percentage: 62.5 },
    { id: 2, category_name: "Food",          spent_amount: 200, limit_amount: 300, percentage: 25 },
    { id: 3, category_name: "Entertainment", spent_amount: 100, limit_amount: 100, percentage: 12.5 },
  ],
  savings_goals: [],
  summary: "",
}

const MOCK_TRANSACTIONS: Transaction[] = []

function generateInsight(data: BudgetDashboard): string {
  const netIncome = data.net_income
  if (netIncome === 0) return "Set your monthly income above to start tracking your budget health."
  const spentPct = Math.round((data.total_spent / netIncome) * 100)
  if (data.remaining_income < 0)
    return `You are over budget this month. Consider reviewing your spending categories to bring things back on track.`
  if (data.financial_snapshot_score >= 80)
    return `Your spending looks healthy — you've used ${spentPct}% of your income this month. You have £${data.remaining_income.toFixed(0)} remaining.`
  if (data.financial_snapshot_score >= 50)
    return `You've used ${spentPct}% of your income on spending this month. Check the Spending tab to see which categories are close to their limits.`
  return `Your budget needs attention — you've spent ${spentPct}% of your income. Review your category limits in the Spending tab and consider reducing discretionary spending.`
}

const AUTH_ERROR = "Please log in or sign up to use this feature."

export function BudgetPlannerContent() {
  const { isAuthenticated } = useAuthSessionState()
  const firstName = isAuthenticated ? (getStoredAuthSession()?.fullName?.split(" ")[0] ?? "") : ""
  const [data, setData] = useState<BudgetDashboard | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [authError, setAuthError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setData(MOCK_DATA)
      setTransactions(MOCK_TRANSACTIONS)
      return
    }
    const [dashboard, txs] = await Promise.all([getBudgetDashboard(), getTransactions()])
    setData(dashboard)
    setTransactions(txs)
  }, [isAuthenticated])

    useEffect(() => {
      const load = async () => { await refresh() }
      load().catch(console.error)
    }, [refresh])

  function requireAuth<T extends unknown[]>(fn: (...args: T) => Promise<void>) {
    return async (...args: T) => {
      if (!isAuthenticated) { setAuthError(AUTH_ERROR); return }
      setAuthError(null)
      await fn(...args)
    }
  }

  const handleUpdateIncome    = requireAuth(async (n: number) => { await updateBudget({ net_income: n }); await refresh() })
  const handleAddCategory     = requireAuth(async (i: AddCategoryInput) => { await addCategory(i); await refresh() })
  const handleEditCategory    = requireAuth(async (i: EditCategoryInput) => { await editCategory(i); await refresh() })
  const handleDeleteCategory  = requireAuth(async (id: number) => { await deleteCategory(id); await refresh() })
  const handleAddGoal         = requireAuth(async (i: AddSavingsGoalInput) => { await addSavingsGoal(i); await refresh() })
  const handleEditGoal        = requireAuth(async (i: EditSavingsGoalInput) => { await editSavingsGoal(i); await refresh() })
  const handleDeleteGoal      = requireAuth(async (id: number) => { await deleteSavingsGoal(id); await refresh() })
  const handleAddTransaction  = requireAuth(async (i: AddTransactionInput) => { await addTransaction(i); await refresh() })
  const handleEditTransaction = requireAuth(async (i: EditTransactionInput) => { await editTransaction(i); await refresh() })
  const handleDeleteTransaction = requireAuth(async (id: number) => { await deleteTransaction(id); await refresh() })

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">First Job Navigator</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Budget Planner</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {!isAuthenticated ? (
              <Button asChild variant="outline" className="h-10 rounded-md px-5 text-sm font-semibold text-primary">
                <Link href="/login">Login / Signup</Link>
              </Button>
            ) : null}
          </header>

          <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 pt-0 max-w-6xl mx-auto w-full">
            {authError && (
              <div className="sticky top-4 z-50 flex items-center justify-between rounded-lg bg-amber-900/80 border border-amber-500/50 px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <p className="text-sm font-medium text-white">{authError}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-semibold text-white underline hover:text-white/80">Log in</Link>
                  <button onClick={() => setAuthError(null)} className="text-xs text-white/50 hover:text-white">✕</button>
                </div>
              </div>
            )}

            {!data ? (
              <p className="text-muted-foreground text-sm animate-pulse">Loading...</p>
            ) : (
              <>
                <BudgetSummaryCard key={data.net_income} data={data} onUpdateIncome={handleUpdateIncome} />

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-[#1d2d44] border border-white/10 w-full h-11 p-1 gap-0.5 overflow-hidden">
                    <TabsTrigger value="overview" className="flex-1 h-9 rounded-md font-medium text-[10px] sm:text-sm transition-all text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#748cab] data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white/70">
                      <span className="hidden sm:inline">📊 </span>Overview
                    </TabsTrigger>
                    <TabsTrigger value="spending" className="flex-1 h-9 rounded-md font-medium text-[10px] sm:text-sm transition-all text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#748cab] data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white/70">
                      <span className="hidden sm:inline">💸 </span>Spending
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="flex-1 h-9 rounded-md font-medium text-[10px] sm:text-sm transition-all text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#748cab] data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white/70">
                      <span className="hidden sm:inline">🧾 </span>Transactions
                    </TabsTrigger>
                    <TabsTrigger value="savings" className="flex-1 h-9 rounded-md font-medium text-[10px] sm:text-sm transition-all text-white/40 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-2 data-[state=active]:border-[#748cab] data-[state=inactive]:hover:bg-white/5 data-[state=inactive]:hover:text-white/70">
                      <span className="hidden sm:inline">🎯 </span>Savings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <div className="grid gap-4 xl:grid-cols-2">
                      <BudgetScore data={data} />
                      <BudgetAlerts alerts={data.alerts} />
                    </div>
                    <Card className="bg-[#1d2d44] border-border/60 shadow-none">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg mt-0.5">💡</span>
                          <div>
                            <p className="text-sm font-medium text-white mb-1">
                              {isAuthenticated && firstName ? `Hello, ${firstName} 👋` : "Monthly Insight"}
                            </p>
                            <p className="text-sm text-white/60 leading-relaxed">{generateInsight(data)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="spending" className="mt-4">
                    <BudgetBreakdown
                      breakdown={data.category_breakdown}
                      onAdd={handleAddCategory}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                      netIncome={data.net_income}
                    />
                  </TabsContent>

                  <TabsContent value="transactions" className="mt-4">
                    <BudgetTransactions
                      transactions={transactions}
                      categories={data.category_breakdown}
                      onAdd={handleAddTransaction}
                      onEdit={handleEditTransaction}
                      onDelete={handleDeleteTransaction}
                    />
                  </TabsContent>

                  <TabsContent value="savings" className="mt-4">
                    <BudgetSavingsGoals
                      goals={data.savings_goals}
                      onAdd={handleAddGoal}
                      onEdit={handleEditGoal}
                      onDelete={handleDeleteGoal}
                    />
                  </TabsContent>

                </Tabs>
              </>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}