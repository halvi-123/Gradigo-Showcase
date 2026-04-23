import { buildBearerAuthHeaders } from "@/lib/auth/session"
import { getApiBaseUrl } from "@/lib/api/base-url"
import type {
  BudgetDashboard,
  Transaction,
  UpdateBudgetInput,
  AddCategoryInput,
  EditCategoryInput,
  AddSavingsGoalInput,
  EditSavingsGoalInput,
  AddTransactionInput,
  EditTransactionInput,
} from "./types"

const BASE = `${getApiBaseUrl()}/api/budget`

// Auth headers

function authHeaders(): Record<string, string> {
  return {
    ...buildBearerAuthHeaders(),
    "Content-Type": "application/json",
  }
}

// Error handling

async function handleResponse(res: Response): Promise<void> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
}

async function handleJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json()
}

// Dashboard

export async function getBudgetDashboard(): Promise<BudgetDashboard> {

  // Dashboard gives values (spent, remaining, score, alerts)

  const [dashRes, budgetRes, goalsRes] = await Promise.all([
    fetch(`${BASE}/dashboard/`, { headers: authHeaders() }),
    fetch(`${BASE}/budget/`, { headers: authHeaders() }),
    fetch(`${BASE}/savings-goals/`, { headers: authHeaders() }),
  ])
  const data = await handleJsonResponse<any>(dashRes)
  const budget = await handleJsonResponse<any>(budgetRes)
  const goalsData = await handleJsonResponse<any[]>(goalsRes)

  const categoryIdMap: Record<string, number> = {}
  if (budget.categories && Array.isArray(budget.categories)) {
    for (const cat of budget.categories) {
      categoryIdMap[cat.category_name] = cat.id
    }
  }

  return {
    net_income: parseFloat(budget.net_income ?? 0),
    remaining_income: data.remaining_income,
    total_spent: data.total_spent,
    total_saved: data.total_saved,
    financial_snapshot_score: data.financial_snapshot_score,
    alerts: data.alerts ?? [],
    category_breakdown: (data.category_breakdown ?? []).map((c: any) => ({
      id: c.id ?? categoryIdMap[c.category_name] ?? 0,
      category_name: c.category_name,
      spent_amount: c.spent_amount,
      limit_amount: c.limit_amount ?? null,
      percentage: c.percentage,
    })),
    savings_goals: (goalsData ?? []).map((g: any) => ({
      id: g.id,
      name: g.name,
      current_amount: parseFloat(g.current_amount),
      target_amount: parseFloat(g.target_amount),
      target_date: g.target_date ?? null,
    })),
    summary: data.summary ?? "",
  }
}

// Budget (net income)

export async function updateBudget(input: UpdateBudgetInput): Promise<void> {
  const res = await fetch(`${BASE}/budget/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ net_income: input.net_income }),
  })
  await handleResponse(res)
}

// Transactions

export async function getTransactions(): Promise<Transaction[]> {
  const [txRes, budgetRes] = await Promise.all([
    fetch(`${BASE}/transactions/`, { headers: authHeaders() }),
    fetch(`${BASE}/budget/`, { headers: authHeaders() }),
  ])
  const txData = await handleJsonResponse<any[]>(txRes)
  const budgetData = await handleJsonResponse<any>(budgetRes)

  const categoryMap: Record<number, string> = {}
  if (budgetData.categories && Array.isArray(budgetData.categories)) {
    for (const cat of budgetData.categories) {
      categoryMap[cat.id] = cat.category_name
    }
  }

  return txData.map((t: any) => ({
    id: t.id,
    name: t.name,
    amount: parseFloat(t.amount),
    date: t.date,
    category_id: t.category,
    category_name: categoryMap[t.category] ?? "",
  }))
}

export async function addTransaction(input: AddTransactionInput): Promise<void> {

  // TransactionCreateSerializer fields: ["budget", "category", "name", "amount", "date"]

  const budgetRes = await fetch(`${BASE}/budget/`, { headers: authHeaders() })
  const budget = await handleJsonResponse<any>(budgetRes)

  const res = await fetch(`${BASE}/transactions/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      budget: budget.id,
      category: input.category_id,
      name: input.name,
      amount: input.amount,
      date: input.date,
    }),
  })
  await handleResponse(res)
}

export async function editTransaction(input: EditTransactionInput): Promise<void> {
  const budgetRes = await fetch(`${BASE}/budget/`, { headers: authHeaders() })
  const budget = await handleJsonResponse<any>(budgetRes)

  const res = await fetch(`${BASE}/transactions/${input.id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      budget: budget.id,
      category: input.category_id,
      name: input.name,
      amount: input.amount,
      date: input.date,
    }),
  })
  await handleResponse(res)
}

export async function deleteTransaction(id: number): Promise<void> {
  const res = await fetch(`${BASE}/transactions/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  await handleResponse(res)
}

// Categories

export async function addCategory(input: AddCategoryInput): Promise<void> {

  // CategoryCreateSerializer likely accepts: category_name, allocated_amount, limit_amount

  const res = await fetch(`${BASE}/categories/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      category_name: input.name,
      allocated_amount: input.allocated,
      limit_amount: input.limit ?? null,
    }),
  })
  await handleResponse(res)
}

export async function editCategory(input: EditCategoryInput): Promise<void> {

  // CategoryUpdateSerializer : allocated_amount, limit_amount

  const res = await fetch(`${BASE}/categories/${input.id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({
      allocated_amount: input.allocated,
      limit_amount: input.limit ?? null,
    }),
  })
  await handleResponse(res)
}

// Savings Goals 

export async function addSavingsGoal(input: AddSavingsGoalInput): Promise<void> {

  // SavingsGoalCreateSerializer fields: ["name", "current_amount", "target_amount", "target_date"]

  const res = await fetch(`${BASE}/savings-goals/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      name: input.name,
      current_amount: input.current_amount,
      target_amount: input.target_amount,
      ...(input.target_date ? { target_date: input.target_date } : {}),
    }),
  })
  await handleResponse(res)
}

export async function editSavingsGoal(input: EditSavingsGoalInput): Promise<void> {

  const res = await fetch(`${BASE}/savings-goals/${input.id}/`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      name: input.name,
      current_amount: input.current_amount,
      target_amount: input.target_amount,
      ...(input.target_date ? { target_date: input.target_date } : {}),
    }),
  })
  await handleResponse(res)
}

export async function deleteSavingsGoal(id: number): Promise<void> {
  const res = await fetch(`${BASE}/savings-goals/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  await handleResponse(res)
}