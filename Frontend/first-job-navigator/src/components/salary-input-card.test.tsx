import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SalaryInputCard } from "@/components/salary-input-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { SalaryCalculationInput } from "@/lib/salary-calculator/types"
import type { ReactNode } from "react"

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}))

function renderSalaryInputCard(props?: Partial<React.ComponentProps<typeof SalaryInputCard>>) {
  return render(
    <TooltipProvider>
      <SalaryInputCard {...props} />
    </TooltipProvider>
  )
}

describe("SalaryInputCard", () => {
  it("renders the salary inputs form with default values", () => {
    const { container } = renderSalaryInputCard()

    expect(screen.getByText(/salary inputs/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your gross annual salary/i)).toBeInTheDocument()

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    expect(salaryInput).toHaveValue(30000)

    const pensionInput = container.querySelector("#pension") as HTMLInputElement
    expect(pensionInput).toHaveValue(5)

    expect(screen.getByRole("button", { name: /calculate take-home pay/i })).toBeEnabled()
  })

  it("renders both region tabs with england selected by default", () => {
    renderSalaryInputCard()

    const englandTab = screen.getByRole("tab", { name: /england/i })
    const scotlandTab = screen.getByRole("tab", { name: /scotland/i })

    expect(englandTab).toBeInTheDocument()
    expect(scotlandTab).toBeInTheDocument()
    expect(englandTab).toHaveAttribute("aria-selected", "true")
    expect(scotlandTab).toHaveAttribute("aria-selected", "false")
  })

  it("allows the user to switch between regions", async () => {
    const user = userEvent.setup()
    renderSalaryInputCard()

    const scotlandTab = screen.getByRole("tab", { name: /scotland/i })
    await user.click(scotlandTab)

    expect(scotlandTab).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: /england/i })).toHaveAttribute("aria-selected", "false")
  })

  it("lets the user type into the salary input and see the value update", async () => {
    const user = userEvent.setup()
    const { container } = renderSalaryInputCard()

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    await user.clear(salaryInput)
    await user.type(salaryInput, "50000")

    expect(salaryInput).toHaveValue(50000)
  })

  it("opens and closes the estimator dialog when the button is clicked", async () => {
    const user = userEvent.setup()
    renderSalaryInputCard()

    expect(screen.queryByRole("dialog", { name: /estimate annual salary/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /calculate it/i }))
    const dialog = screen.getByRole("dialog", { name: /estimate annual salary/i })
    expect(dialog).toBeInTheDocument()

    // Close dialog using Escape key (standard dialog behavior)
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog", { name: /estimate annual salary/i })).not.toBeInTheDocument()
  })



  it("displays the slider cap notice when salary exceeds the slider max", async () => {
    const user = userEvent.setup()
    const { container } = renderSalaryInputCard()

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    await user.clear(salaryInput)
    await user.type(salaryInput, "600000")

    await user.click(document.body)

    expect(screen.getByText(/slider caps at £500,000 for usability/i)).toBeInTheDocument()
    expect(screen.getByText(/current: £600,000/i)).toBeInTheDocument()
  })

  it("lets the user update the pension contribution", async () => {
    const user = userEvent.setup()
    const { container } = renderSalaryInputCard()

    const pensionInput = container.querySelector("#pension") as HTMLInputElement
    await user.clear(pensionInput)
    await user.type(pensionInput, "10")

    expect(pensionInput).toHaveValue(10)
  })

  it("renders the student loan type dropdown", () => {
    const { container } = renderSalaryInputCard()

    const studentLoanSelect = container.querySelector("[role=combobox]") as HTMLElement
    expect(studentLoanSelect).toBeInTheDocument()
  })

  it("calls onCalculate with the correct payload when calculate is clicked", async () => {
    const user = userEvent.setup()
    const onCalculate = jest.fn<Promise<void> | void, [SalaryCalculationInput]>()
    const { container } = renderSalaryInputCard({ onCalculate })

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    const pensionInput = container.querySelector("#pension") as HTMLInputElement

    await user.clear(salaryInput)
    await user.type(salaryInput, "45000")

    await user.clear(pensionInput)
    await user.type(pensionInput, "7.5")

    await user.click(screen.getByRole("tab", { name: /scotland/i }))

    await user.click(screen.getByRole("button", { name: /calculate take-home pay/i }))

    expect(onCalculate).toHaveBeenCalledWith(
      expect.objectContaining({
        region: "scotland",
        grossAnnualSalary: 45000,
        pensionContributionPercent: 7.5,
      })
    )
  })

  it("disables the calculate button when isCalculating is true", () => {
    renderSalaryInputCard({ isCalculating: true })

    const button = screen.getByRole("button", { name: /calculating/i })
    expect(button).toBeDisabled()
  })

  it("shows the calculating state on the button text", () => {
    renderSalaryInputCard({ isCalculating: true })

    expect(screen.getByRole("button", { name: /calculating/i })).toBeInTheDocument()
  })

  it("displays an error message when calculationError is provided", () => {
    renderSalaryInputCard({
      calculationError: "We could not calculate your salary right now. Please try again.",
    })

    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("We could not calculate your salary right now. Please try again.")
  })

  it("clears the error message when no error is provided", () => {
    const { rerender } = renderSalaryInputCard({
      calculationError: "An error occurred",
    })

    expect(screen.getByRole("alert")).toBeInTheDocument()

    rerender(
      <TooltipProvider>
        <SalaryInputCard calculationError={null} />
      </TooltipProvider>
    )

    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows optional labels for pension contribution and student loan fields", () => {
    renderSalaryInputCard()

    expect(screen.getAllByText(/^optional$/i).length).toBe(2)
  })

  it("renders expected tooltip content for salary fields", () => {
    renderSalaryInputCard()

    const tooltipContents = screen
      .getAllByTestId("tooltip-content")
      .map((element) => element.textContent?.trim())

    expect(tooltipContents).toEqual(
      expect.arrayContaining([
        "Enter your annual salary before tax and deductions.",
        "Quick-adjust values in a practical range. You can still type larger values in the salary input.",
        "Optional pension deduction percentage from gross pay.",
        "Optional UK student loan plan used for repayment deductions.",
      ])
    )
  })

  it("maintains form state through multiple interactions", async () => {
    const user = userEvent.setup()
    const { container } = renderSalaryInputCard()

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    const pensionInput = container.querySelector("#pension") as HTMLInputElement

    await user.clear(salaryInput)
    await user.type(salaryInput, "55000")

    await user.clear(pensionInput)
    await user.type(pensionInput, "8")

    await user.click(screen.getByRole("tab", { name: /scotland/i }))

    expect(salaryInput).toHaveValue(55000)
    expect(pensionInput).toHaveValue(8)
    expect(screen.getByRole("tab", { name: /scotland/i })).toHaveAttribute("aria-selected", "true")
  })

  it("renders the salary text formatter for display", async () => {
    const user = userEvent.setup()
    const { container } = renderSalaryInputCard()

    const salaryInput = container.querySelector("#salary-amount") as HTMLInputElement
    await user.clear(salaryInput)
    await user.type(salaryInput, "1500000")

    await user.click(document.body)

    expect(screen.getByText(/current: £1,500,000/i)).toBeInTheDocument()
  })
})
