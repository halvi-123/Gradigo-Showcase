import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BudgetSummaryCard } from "@/components/budget-planner/budget-summary-card"
import type { BudgetDashboard } from "@/lib/budget-planner/types"

function buildData(overrides: Partial<BudgetDashboard> = {}): BudgetDashboard {
  return {
    net_income: 2200,
    remaining_income: 1400,
    total_spent: 800,
    total_saved: 0,
    financial_snapshot_score: 85,
    alerts: [],
    category_breakdown: [],
    savings_goals: [],
    summary: "",
    ...overrides,
  }
}

describe("BudgetSummaryCard", () => {
  it("displays monthly income correctly", () => {
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 2200 })} onUpdateIncome={onUpdateIncome} />)
    expect(screen.getByText("£2,200")).toBeInTheDocument()
  })

  it("shows Edit button when income is set", () => {
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 2200 })} onUpdateIncome={onUpdateIncome} />)
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument()
  })

  it("automatically opens income editor when net_income is 0", () => {
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 0 })} onUpdateIncome={onUpdateIncome} />)
    expect(screen.getByPlaceholderText(/enter your monthly income/i)).toBeInTheDocument()
  })

  it("opens income editor when Edit is clicked", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 2200 })} onUpdateIncome={onUpdateIncome} />)

    await user.click(screen.getByRole("button", { name: /edit/i }))
    expect(screen.getByPlaceholderText(/enter your monthly income/i)).toBeInTheDocument()
  })

  it("calls onUpdateIncome with correct value when Save is clicked", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn().mockResolvedValue(undefined)
    render(<BudgetSummaryCard data={buildData({ net_income: 0 })} onUpdateIncome={onUpdateIncome} />)

    const input = screen.getByPlaceholderText(/enter your monthly income/i)
    await user.clear(input)
    await user.type(input, "3000")
    await user.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(onUpdateIncome).toHaveBeenCalledWith(3000)
    })
  })

  it("shows error when saving zero income", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 0 })} onUpdateIncome={onUpdateIncome} />)

    const input = screen.getByPlaceholderText(/enter your monthly income/i)
    await user.clear(input)
    await user.type(input, "0")
    await user.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/income must be greater than £0/i)).toBeInTheDocument()
    })
    expect(onUpdateIncome).not.toHaveBeenCalled()
  })

  it("shows error for negative income", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 0 })} onUpdateIncome={onUpdateIncome} />)

    const input = screen.getByPlaceholderText(/enter your monthly income/i)
    await user.clear(input)
    await user.type(input, "-500")
    await user.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/cannot be negative/i)).toBeInTheDocument()
    })
    expect(onUpdateIncome).not.toHaveBeenCalled()
  })

  it("displays remaining, spent and saved stat cards", () => {
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ remaining_income: 1400, total_spent: 800, total_saved: 200 })} onUpdateIncome={onUpdateIncome} />)
    expect(screen.getByText(/remaining/i)).toBeInTheDocument()
    expect(screen.getByText(/spent/i)).toBeInTheDocument()
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })

  it("shows cancel button when editing and income is already set", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 2200 })} onUpdateIncome={onUpdateIncome} />)

    await user.click(screen.getByRole("button", { name: /edit/i }))
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
  })

  it("closes income editor when cancel is clicked", async () => {
    const user = userEvent.setup()
    const onUpdateIncome = jest.fn()
    render(<BudgetSummaryCard data={buildData({ net_income: 2200 })} onUpdateIncome={onUpdateIncome} />)

    await user.click(screen.getByRole("button", { name: /edit/i }))
    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(screen.queryByPlaceholderText(/enter your monthly income/i)).not.toBeInTheDocument()
  })
})