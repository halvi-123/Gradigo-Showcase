import type { SalaryCalculationResult } from "@/lib/salary-calculator/types"

export const DEFAULT_MOCK_SALARY_RESULT: SalaryCalculationResult = {
  grossAnnualSalary: 30_000,
  netAnnualPay: 23_457,
  netMonthlyPay: 1_954.75,
  totalDeductions: 6_543,
  incomeTax: 3_486,
  nationalInsurance: 2_157,
  pensionContribution: 900,
  studentLoanRepayment: 0,
}
