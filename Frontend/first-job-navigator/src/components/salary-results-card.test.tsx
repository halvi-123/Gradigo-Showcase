import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SalaryResultsCard } from "@/components/salary-results-card"
import type { SalaryCalculationResult } from "@/lib/salary-calculator/types"

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}))

jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: ({ content }: { content?: React.ReactNode }) => <div data-testid="chart-tooltip">{content}</div>,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content">tooltip</div>,
}))

jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}))

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

describe("SalaryResultsCard", () => {
  it("renders the default yearly take-home value", () => {
    render(<SalaryResultsCard result={buildResult()} />)

    expect(screen.getByText(/take home pay/i)).toBeInTheDocument()
    expect(screen.getByText(/estimated take-home \(yearly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£36,000")).toBeInTheDocument()
  })

  it("updates displayed amount when switching pay frequency tabs", async () => {
    const user = userEvent.setup()
    render(<SalaryResultsCard result={buildResult()} />)

    await user.click(screen.getByRole("tab", { name: /monthly/i }))
    expect(screen.getByText(/estimated take-home \(monthly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£3,000")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /weekly/i }))
    expect(screen.getByText(/estimated take-home \(weekly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£692")).toBeInTheDocument()
  })

  it("uses provided hoursPerWeek when showing hourly amount", async () => {
    const user = userEvent.setup()
    render(<SalaryResultsCard result={buildResult()} hoursPerWeek={35} />)

    await user.click(screen.getByRole("tab", { name: /hourly/i }))
    expect(screen.getByText(/estimated take-home \(hourly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£20")).toBeInTheDocument()
  })

  it("renders legend entries only for deduction buckets with values greater than zero", () => {
    render(
      <SalaryResultsCard
        result={buildResult({
          pensionContribution: 0,
          studentLoanRepayment: 0,
        })}
      />
    )

    expect(screen.getAllByText(/take home \(72%\)/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/income tax \(18%\)/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/ni \(6%\)/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/pension \(/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/student loan \(/i)).not.toBeInTheDocument()
  })

  it("shows allowance meter details and tooltip content", () => {
    render(<SalaryResultsCard result={buildResult({ grossAnnualSalary: 6285 })} />)

    expect(screen.getByText(/personal allowance used/i)).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(screen.getByText(/standard personal allowance: £12,570/i)).toBeInTheDocument()
    expect(
      screen.getByText(/your personal allowance is the amount you can earn before paying income tax/i)
    ).toBeInTheDocument()
  })

  it("caps allowance percentage at 100% for high salaries", () => {
    render(<SalaryResultsCard result={buildResult({ grossAnnualSalary: 50000 })} />)

    expect(screen.getByText("100%")).toBeInTheDocument()
  })
})
