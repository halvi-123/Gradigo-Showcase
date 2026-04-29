import { getApiBaseUrl } from "@/lib/api/base-url"
import type { PensionApiRequest, PensionProjectionInput, PensionProjectionResult } from "@/lib/pension/types"

function toApiRequest(input: PensionProjectionInput): PensionApiRequest {
  return {
    current_age: input.currentAge,
    retirement_age: input.retirementAge,
    current_salary: input.currentSalary,
    employee_contribution_percent: input.employeeContributionPercent,
    employer_contribution_percent: input.employerContributionPercent,
    current_pot: input.currentPot,
    inflation_rate: input.inflationRate,
  }
}

export const DEFAULT_PENSION_INPUT: PensionProjectionInput = {
  currentAge: 22,
  retirementAge: 67,
  currentSalary: 30000,
  employeeContributionPercent: 5,
  employerContributionPercent: 3,
  currentPot: 0,
  inflationRate: 2.5,
}

export async function calculatePension(input: PensionProjectionInput): Promise<PensionProjectionResult> {
  const request = toApiRequest(input)
  const response = await fetch(`${getApiBaseUrl()}/api/pension/project/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })
  if (!response.ok) {
    throw new Error("Failed to calculate pension projection")
  }
  return response.json()
}