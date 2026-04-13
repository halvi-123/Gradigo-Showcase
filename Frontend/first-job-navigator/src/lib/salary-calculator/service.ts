import { DEFAULT_MOCK_SALARY_RESULT } from "@/data/salary-calculator.mock"
import type {
  SalaryCalculationApiRequest,
  SalaryCalculationApiResponse,
  SalaryCalculationInput,
  SalaryCalculationResult,
  StudentLoanType,
} from "@/lib/salary-calculator/types"

const DEV_FALLBACK_API_BASE_URL = "http://127.0.0.1:8000"
const SALARY_CALCULATE_PATH = "/api/salary/calculate/"

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "")
  }

  if (process.env.NODE_ENV === "development") {
    return DEV_FALLBACK_API_BASE_URL
  }

  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL for non-development environment")
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const studentLoanTypeToApiPlan: Record<StudentLoanType, SalaryCalculationApiRequest["student_loan_plan"]> = {
  none: null,
  plan1: "plan1",
  plan2: "plan2",
  plan4: "plan4",
  plan5: "plan5",
}

function toApiRequest(input: SalaryCalculationInput): SalaryCalculationApiRequest {
  return {
    gross_salary: Math.max(0, input.grossAnnualSalary),
    pension_percent: clamp(input.pensionContributionPercent, 0, 100),
    tax_region: input.region,
    student_loan_plan: studentLoanTypeToApiPlan[input.studentLoanType],
  }
}

function fromApiResponse(response: SalaryCalculationApiResponse): SalaryCalculationResult {
  return {
    grossAnnualSalary: response.gross_salary,
    netAnnualPay: response.net_annual,
    netMonthlyPay: response.net_monthly,
    totalDeductions: response.total_deductions,
    incomeTax: response.income_tax,
    nationalInsurance: response.national_insurance,
    pensionContribution: response.pension,
    studentLoanRepayment: response.student_loan,
  }
}

export function getDefaultSalaryCalculationResult(): SalaryCalculationResult {
  return {
    ...DEFAULT_MOCK_SALARY_RESULT,
    netMonthlyPay: DEFAULT_MOCK_SALARY_RESULT.netAnnualPay / 12,
  }
}

export async function calculateSalary(input: SalaryCalculationInput): Promise<SalaryCalculationResult> {
  const request = toApiRequest(input)

  const response = await fetch(`${getApiBaseUrl()}${SALARY_CALCULATE_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Salary API request failed (${response.status}): ${errorText}`)
  }

  const apiResponse = (await response.json()) as SalaryCalculationApiResponse

  return fromApiResponse(apiResponse)
}
