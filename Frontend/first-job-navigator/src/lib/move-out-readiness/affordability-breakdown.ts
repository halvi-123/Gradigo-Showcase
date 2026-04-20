import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

export type AffordabilityBreakdownLine = {
  key: string
  label: string
  amount: number
  detail: string
  isHighlight?: boolean
}

export type AffordabilityBreakdownViewModel = {
  lines: AffordabilityBreakdownLine[]
  totalMonthlyOutgoings: number
  monthlyHeadroom: number
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatSignedCurrency(value: number) {
  const absolute = formatCurrency(Math.abs(value))
  return value < 0 ? `-${absolute}` : absolute
}

function roundCurrency(value: number) {
  return Math.round(value)
}

function splitEstimatedOutgoings(total: number) {
  const safeTotal = Math.max(0, roundCurrency(total))

  const councilTax = roundCurrency(safeTotal * 0.12)
  const utilities = roundCurrency(safeTotal * 0.17)
  const waterAndBroadband = roundCurrency(safeTotal * 0.08)
  const groceriesAndHousehold = roundCurrency(safeTotal * 0.31)
  const transport = roundCurrency(safeTotal * 0.2)
  const insuranceAndBuffer = roundCurrency(safeTotal * 0.12)

  const allocated =
    councilTax + utilities + waterAndBroadband + groceriesAndHousehold + transport + insuranceAndBuffer
  const adjustment = safeTotal - allocated

  return {
    councilTax,
    utilities,
    waterAndBroadband,
    groceriesAndHousehold,
    transport,
    insuranceAndBuffer: insuranceAndBuffer + adjustment,
  }
}

export function buildAffordabilityBreakdown(plan: MoveOutReadinessPlan): AffordabilityBreakdownViewModel {
  const estimatedRent = roundCurrency(plan.estimatedMonthlyRent)
  const reportedOutgoings = roundCurrency(plan.monthlyExpenses)
  const split = splitEstimatedOutgoings(reportedOutgoings)
  const totalMonthlyOutgoings = roundCurrency(estimatedRent + reportedOutgoings)
  const monthlyHeadroom = roundCurrency(plan.monthlyIncome - totalMonthlyOutgoings)

  const lines: AffordabilityBreakdownLine[] = [
    {
      key: "rent",
      label: "Rent",
      amount: estimatedRent,
      detail: "Estimated monthly rent from API for the selected postcode.",
    },
    {
      key: "council-tax",
      label: "Council tax (estimated share)",
      amount: split.councilTax,
      detail: "Local tax contribution allowance.",
    },
    {
      key: "utilities",
      label: "Gas & electricity",
      amount: split.utilities,
      detail: "Home energy costs allowance.",
    },
    {
      key: "water-broadband",
      label: "Water + broadband",
      amount: split.waterAndBroadband,
      detail: "Core home services allowance.",
    },
    {
      key: "groceries-household",
      label: "Groceries & household",
      amount: split.groceriesAndHousehold,
      detail: "Food and household essentials allowance.",
    },
    {
      key: "transport",
      label: "Transport",
      amount: split.transport,
      detail: "Travel and commuting allowance.",
    },
    {
      key: "insurance-buffer",
      label: "Insurance & misc buffer",
      amount: split.insuranceAndBuffer,
      detail: "Cover and contingency allowance.",
    },
  ]

  return {
    lines,
    totalMonthlyOutgoings,
    monthlyHeadroom,
  }
}
