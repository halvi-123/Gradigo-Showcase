export type MoveOutReadinessExpenseItem = {
  id: string
  label: string
  amountInput: string
}

const ANNUAL_SALARY_MAX = 999_000_000

export const moveOutReadinessInputLimits = {
  ANNUAL_SALARY_MAX,
  MONTHLY_AMOUNT_MAX: Math.floor(ANNUAL_SALARY_MAX / 12),
}

export function createDefaultExpenseItems(): MoveOutReadinessExpenseItem[] {
  return [
    { id: "housing", label: "Housing", amountInput: "650" },
    { id: "utilities", label: "Utilities", amountInput: "180" },
    { id: "groceries", label: "Groceries", amountInput: "260" },
    { id: "transport", label: "Transport", amountInput: "140" },
  ]
}

export function clampAmount(value: number): number {
  if (Number.isNaN(value)) {
    return 0
  }

  return Math.min(moveOutReadinessInputLimits.MONTHLY_AMOUNT_MAX, Math.max(0, value))
}

export function normalizeNumberInput(rawValue: string): string {
  const allowedChars = rawValue.replace(/[^0-9.]/g, "")
  const parts = allowedChars.split(".")

  if (parts.length > 2) {
    return `${parts[0]}.${parts[1]}`
  }

  return allowedChars
}

export function parseClampedAmount(rawValue: string): number {
  const parsed = Number(rawValue)
  return clampAmount(Number.isFinite(parsed) ? parsed : 0)
}