import { DEFAULT_MOCK_SALARY_RESULT } from "@/data/salary-calculator.mock"
import { getApiBaseUrl } from "@/lib/api/base-url"
import type {
  SalaryCalculationApiRequest,
  SalaryCalculationApiResponse,
  SalaryCalculationInput,
  SalaryCalculationResult,
  StudentLoanType,
} from "@/lib/salary-calculator/types"

const SALARY_CALCULATE_PATH = "/api/salary/calculate/"
const SALARY_REQUEST_TIMEOUT_MS = 10_000

function getRequestFailureMessage(status: number): string {
  if (status === 400) {
    return "Please check your entries and try again."
  }

  if (status >= 500) {
    return "Something went wrong on our side. Please try again in a moment."
  }

  return "We could not complete your calculation right now. Please try again."
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
  const controller = new AbortController()
  const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    controller.abort()
  }, SALARY_REQUEST_TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${SALARY_CALCULATE_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("This is taking longer than expected. Please try again.")
    }

    throw new Error("We could not connect right now. Please check your internet and try again.")
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const errorText = await response.text()

    if (process.env.NODE_ENV === "development") {
      console.error("Salary API request failed", {
        status: response.status,
        body: errorText,
      })
    }

    throw new Error(getRequestFailureMessage(response.status))
  }

  const apiResponse = (await response.json()) as SalaryCalculationApiResponse

  return fromApiResponse(apiResponse)
}
