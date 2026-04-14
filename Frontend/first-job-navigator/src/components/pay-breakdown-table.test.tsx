import { render, screen } from "@testing-library/react"
import { PayBreakdownTable } from "@/components/pay-breakdown-table"
import type { SalaryCalculationResult } from "@/lib/salary-calculator/types"

function buildResult(overrides?: Partial<SalaryCalculationResult>): SalaryCalculationResult {
  return {
    grossAnnualSalary: 50000,
    netAnnualPay: 36000,
    netMonthlyPay: 3000,
    totalDeductions: 14000,
    incomeTax: 9000,
    nationalInsurance: 3000,
    pensionContribution: 1500,
    studentLoanRepayment: 500,
    ...overrides,
  }
}

describe("PayBreakdownTable", () => {
  it("renders heading and explanatory copy", () => {
    render(<PayBreakdownTable result={buildResult()} />)

    expect(screen.getByText(/pay breakdown/i)).toBeInTheDocument()
    expect(screen.getByText(/breakdown of gross salary, deductions, and final take-home pay/i)).toBeInTheDocument()
  })

  it("renders all salary and deduction rows with correct currency formatting", () => {
    render(<PayBreakdownTable result={buildResult()} />)

    expect(screen.getByText("Gross Salary")).toBeInTheDocument()
    expect(screen.getByText("£50,000")).toBeInTheDocument()

    expect(screen.getByText("Income Tax")).toBeInTheDocument()
    expect(screen.getByText("-£9,000")).toBeInTheDocument()

    expect(screen.getByText("National Insurance")).toBeInTheDocument()
    expect(screen.getByText("-£3,000")).toBeInTheDocument()

    expect(screen.getByText("Pension")).toBeInTheDocument()
    expect(screen.getByText("-£1,500")).toBeInTheDocument()

    expect(screen.getByText("Student Loan")).toBeInTheDocument()
    expect(screen.getByText("-£500")).toBeInTheDocument()

    expect(screen.getByText("Total Deductions")).toBeInTheDocument()
    expect(screen.getByText("-£14,000")).toBeInTheDocument()

    expect(screen.getByText(/take home pay/i)).toBeInTheDocument()
    expect(screen.getByText("£36,000")).toBeInTheDocument()
  })

  it("shows negative sign for deductions and positive take-home pay", () => {
    render(<PayBreakdownTable result={buildResult()} />)

    const negativeValues = ["-£9,000", "-£3,000", "-£1,500", "-£500", "-£14,000"]
    negativeValues.forEach((value) => {
      expect(screen.getByText(value)).toBeInTheDocument()
    })

    expect(screen.getByText("£36,000")).toBeInTheDocument()
  })

  it("renders zero-value deductions as £0 while preserving deduction sign", () => {
    render(
      <PayBreakdownTable
        result={buildResult({
          incomeTax: 0,
          nationalInsurance: 0,
          pensionContribution: 0,
          studentLoanRepayment: 0,
          totalDeductions: 0,
          netAnnualPay: 50000,
        })}
      />
    )

    expect(screen.getAllByText("-£0").length).toBe(5)
    expect(screen.getAllByText("£50,000").length).toBe(2)
  })
})
