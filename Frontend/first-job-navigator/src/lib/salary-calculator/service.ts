import { DEFAULT_MOCK_SALARY_RESULT } from "@/data/salary-calculator.mock"
import type {
  SalaryCalculationApiRequest,
  SalaryCalculationApiResponse,
  SalaryCalculationInput,
  SalaryCalculationResult,
  StudentLoanType,
} from "@/lib/salary-calculator/types"

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

function mockCalculateApi(request: SalaryCalculationApiRequest): SalaryCalculationApiResponse {
  const grossSalary = request.gross_salary
  const pension = grossSalary * (request.pension_percent / 100)

  // Mock only: this approximates deductions to unblock frontend rendering.
  const taxableIncome = Math.max(0, grossSalary - pension)
  const incomeTaxRate = request.tax_region === "scotland" ? 0.125 : 0.115
  const nationalInsuranceRate = 0.075

  const incomeTax = taxableIncome * incomeTaxRate
  const nationalInsurance = taxableIncome * nationalInsuranceRate

  const studentLoanRateByPlan: Record<NonNullable<SalaryCalculationApiRequest["student_loan_plan"]>, number> = {
    plan1: 0.01,
    plan2: 0.02,
    plan4: 0.015,
    plan5: 0.03,
  }

  const studentLoan = request.student_loan_plan
    ? taxableIncome * studentLoanRateByPlan[request.student_loan_plan]
    : 0

  const totalDeductions = incomeTax + nationalInsurance + pension + studentLoan
  const netAnnual = Math.max(0, grossSalary - totalDeductions)

  return {
    gross_salary: grossSalary,
    tax_region: request.tax_region,
    income_tax: incomeTax,
    national_insurance: nationalInsurance,
    student_loan: studentLoan,
    pension,
    total_deductions: totalDeductions,
    net_annual: netAnnual,
    net_monthly: netAnnual / 12,
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

  // Replace this with fetch("/api/salary/calculate/", ...) once backend integration is enabled.
  const apiResponse = mockCalculateApi(request)

  return fromApiResponse(apiResponse)
}
