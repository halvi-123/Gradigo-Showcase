// Shared validation utilities for budget planner input fields
// Matches Django DecimalField(max_digits=10, decimal_places=2)

export const MAX_MONEY = 99999999.99
export const MONEY_STEP = 0.01

/**
 * Rounds a number to 2 decimal places before sending to backend
 * Matches Django DecimalField(decimal_places=2)
 */
export function roundMoney(val: number): number {
  return Math.round(val * 100) / 100
}

/**
 * Validates a money input string
 * Returns an error message or null if valid
 */
export function validateMoney(val: string, fieldName = "Amount", required = true): string | null {
  if (!val || val === "") {
    return required ? `${fieldName} is required.` : null
  }
  const num = Number(val)
  if (isNaN(num)) return `${fieldName} must be a valid number.`
  if (num < 0) return `${fieldName} cannot be negative.`
  if (num > MAX_MONEY) return `${fieldName} is too large.`
  // Check max 2 decimal places
  if (val.includes(".") && val.split(".")[1]?.length > 2) return `${fieldName} can have at most 2 decimal places.`
  return null
}

/**
 * Validates net income specifically — must be positive
 */
export function validateIncome(val: string): string | null {
  const base = validateMoney(val, "Income")
  if (base) return base
  if (Number(val) <= 0) return "Income must be greater than £0."
  return null
}

export function blockNegativeInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
    e.preventDefault()
  }
}