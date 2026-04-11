export type Region = "england" | "scotland"

export type StudentLoanType = "none" | "plan1" | "plan2" | "plan4" | "plan5"

export type SalaryCalculationInput = {
  region: Region
  grossAnnualSalary: number
  pensionContributionPercent: number
  studentLoanType: StudentLoanType
}

export type SalaryCalculationResult = {
  grossAnnualSalary: number
  netAnnualPay: number
  netMonthlyPay: number
  totalDeductions: number
  incomeTax: number
  nationalInsurance: number
  pensionContribution: number
  studentLoanRepayment: number
}

export type BackendStudentLoanPlan = "plan1" | "plan2" | "plan4" | "plan5"

export type SalaryCalculationApiRequest = {
  gross_salary: number
  pension_percent: number
  tax_region: Region
  student_loan_plan?: BackendStudentLoanPlan | null
}

export type SalaryCalculationApiResponse = {
  gross_salary: number
  tax_region: Region
  income_tax: number
  national_insurance: number
  student_loan: number
  pension: number
  total_deductions: number
  net_annual: number
  net_monthly: number
}
