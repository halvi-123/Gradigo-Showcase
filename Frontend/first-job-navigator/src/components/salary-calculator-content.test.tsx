import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SalaryCalculatorContent } from "@/components/salary-calculator-content"
import type { SalaryCalculationInput, SalaryCalculationResult } from "@/lib/salary-calculator/types"

const mockCalculationInput: SalaryCalculationInput = {
  region: "england",
  grossAnnualSalary: 42000,
  pensionContributionPercent: 5,
  studentLoanType: "none",
}

const initialResult: SalaryCalculationResult = {
  grossAnnualSalary: 30000,
  netAnnualPay: 24000,
  netMonthlyPay: 2000,
  totalDeductions: 6000,
  incomeTax: 3500,
  nationalInsurance: 2000,
  pensionContribution: 500,
  studentLoanRepayment: 0,
}

const successResult: SalaryCalculationResult = {
  grossAnnualSalary: 42000,
  netAnnualPay: 32000,
  netMonthlyPay: 2666.67,
  totalDeductions: 10000,
  incomeTax: 6000,
  nationalInsurance: 3000,
  pensionContribution: 1000,
  studentLoanRepayment: 0,
}

const mockCalculateSalary = jest.fn<Promise<SalaryCalculationResult>, [SalaryCalculationInput]>()
const mockGetDefaultSalaryCalculationResult = jest.fn<SalaryCalculationResult, []>(() => initialResult)

jest.mock("@/lib/salary-calculator/service", () => ({
  calculateSalary: (input: SalaryCalculationInput) => mockCalculateSalary(input),
  getDefaultSalaryCalculationResult: () => mockGetDefaultSalaryCalculationResult(),
}))

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

jest.mock("@/components/salary-input-card", () => ({
  SalaryInputCard: ({
    onCalculate,
    isCalculating,
    calculationError,
  }: {
    onCalculate?: (payload: SalaryCalculationInput) => Promise<void> | void
    isCalculating?: boolean
    calculationError?: string | null
  }) => (
    <section>
      <button type="button" onClick={() => onCalculate?.(mockCalculationInput)}>
        trigger calculate
      </button>
      <div data-testid="input-loading">{String(Boolean(isCalculating))}</div>
      <div data-testid="input-error">{calculationError ?? ""}</div>
    </section>
  ),
}))

jest.mock("@/components/salary-results-card", () => ({
  SalaryResultsCard: ({ result }: { result: SalaryCalculationResult }) => (
    <div data-testid="results-net-annual">{result.netAnnualPay}</div>
  ),
}))

jest.mock("@/components/pay-breakdown-table", () => ({
  PayBreakdownTable: ({ result }: { result: SalaryCalculationResult }) => (
    <div data-testid="table-gross-annual">{result.grossAnnualSalary}</div>
  ),
}))

jest.mock("@/hooks/use-auth-session-state", () => ({
  useAuthSessionState: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    logoutUser: jest.fn(),
  }),
}))

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe("SalaryCalculatorContent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders shell elements and initializes children with default result", () => {
    render(<SalaryCalculatorContent />)

    expect(screen.getByText(/salary calculator/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /login \/ signup/i })).toBeInTheDocument()
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    expect(screen.getByTestId("results-net-annual")).toHaveTextContent("24000")
    expect(screen.getByTestId("table-gross-annual")).toHaveTextContent("30000")
    expect(mockGetDefaultSalaryCalculationResult).toHaveBeenCalledTimes(1)
  })

  it("calls calculateSalary and propagates updated result to child cards", async () => {
    const user = userEvent.setup()
    mockCalculateSalary.mockResolvedValueOnce(successResult)

    render(<SalaryCalculatorContent />)
    await user.click(screen.getByRole("button", { name: /trigger calculate/i }))

    expect(mockCalculateSalary).toHaveBeenCalledWith(mockCalculationInput)
    await waitFor(() => {
      expect(screen.getByTestId("results-net-annual")).toHaveTextContent("32000")
      expect(screen.getByTestId("table-gross-annual")).toHaveTextContent("42000")
    })
  })

  it("sets loading state while calculation is in flight and clears it after resolve", async () => {
    const user = userEvent.setup()
    const deferred = createDeferred<SalaryCalculationResult>()
    mockCalculateSalary.mockReturnValueOnce(deferred.promise)

    render(<SalaryCalculatorContent />)

    expect(screen.getByTestId("input-loading")).toHaveTextContent("false")
    await user.click(screen.getByRole("button", { name: /trigger calculate/i }))

    await waitFor(() => {
      expect(screen.getByTestId("input-loading")).toHaveTextContent("true")
    })

    deferred.resolve(successResult)
    await waitFor(() => {
      expect(screen.getByTestId("input-loading")).toHaveTextContent("false")
    })
  })

  it("passes explicit service error message to SalaryInputCard", async () => {
    const user = userEvent.setup()
    mockCalculateSalary.mockRejectedValueOnce(new Error("Service unavailable"))

    render(<SalaryCalculatorContent />)
    await user.click(screen.getByRole("button", { name: /trigger calculate/i }))

    await waitFor(() => {
      expect(screen.getByTestId("input-error")).toHaveTextContent("Service unavailable")
    })
  })

  it("uses fallback error message for non-error failures", async () => {
    const user = userEvent.setup()
    mockCalculateSalary.mockRejectedValueOnce("unexpected")

    render(<SalaryCalculatorContent />)
    await user.click(screen.getByRole("button", { name: /trigger calculate/i }))

    await waitFor(() => {
      expect(screen.getByTestId("input-error")).toHaveTextContent(
        "We could not calculate your salary right now. Please try again in a moment."
      )
    })
  })
})
