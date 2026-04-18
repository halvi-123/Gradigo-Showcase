export type PensionProjectionInput = {
  currentAge: number
  retirementAge: number
  currentSalary: number
  employeeContributionPercent: number
  employerContributionPercent: number
  currentPot: number
  inflationRate: number
}

export type YearlyBreakdown = {
  year: number
  age: number
  pot_value: number
}

export type PensionScenario = {
  growth_rate_percent: number
  real_growth_rate_percent: number
  projected_pot: number
  yearly_breakdown: YearlyBreakdown[]
}

export type PensionProjectionResult = {
  current_age: number
  retirement_age: number
  years_to_retirement: number
  annual_employee_contribution: number
  annual_employer_contribution: number
  total_annual_contribution: number
  inflation_rate: number
  projections: {
    low: PensionScenario
    mid: PensionScenario
    high: PensionScenario
  }
}

export type PensionApiRequest = {
  current_age: number
  retirement_age: number
  current_salary: number
  employee_contribution_percent: number
  employer_contribution_percent: number
  current_pot?: number
  inflation_rate?: number
}
