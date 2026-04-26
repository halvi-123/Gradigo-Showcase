export const MAX_MONEY = 99999999.99
export const MONEY_STEP = 0.01


export function roundMoney(val: number): number {
  return Math.round(val * 100) / 100
}


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