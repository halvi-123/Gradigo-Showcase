export interface CategoryBreakdown {
  id: number
  category_name: string
  spent_amount: number
  limit_amount: number | null
  percentage: number
}

export interface SavingsGoal {
  id: number
  name: string
  current_amount: number
  target_amount: number
  target_date?: string | null
}

export interface Transaction {
  id: number
  name: string
  amount: number
  date: string          
  category_id: number
  category_name: string
}

export interface BudgetDashboard {
  remaining_income: number
  total_spent: number
  total_saved: number
  net_income: number
  financial_snapshot_score: number
  alerts: string[]
  category_breakdown: CategoryBreakdown[]
  savings_goals: SavingsGoal[]
  summary?: string
}

export interface UpdateBudgetInput {
  net_income: number
}

export interface AddCategoryInput {
  name: string
  allocated: number
  limit?: number
}

export interface EditCategoryInput {
  id: number
  name: string
  allocated: number
  limit?: number
}

export interface AddSavingsGoalInput {
  name: string
  current_amount: number
  target_amount: number
  target_date?: string | null
}

export interface EditSavingsGoalInput {
  id: number
  name: string
  current_amount: number
  target_amount: number
  target_date?: string | null
}

export interface AddTransactionInput {
  name: string
  amount: number
  date: string
  category_id: number
}

export interface EditTransactionInput {
  id: number
  name: string
  amount: number
  date: string
  category_id: number
}