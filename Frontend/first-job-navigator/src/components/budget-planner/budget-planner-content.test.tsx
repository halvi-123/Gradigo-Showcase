import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BudgetPlannerContent } from "@/components/budget-planner/budget-planner-content"


const mockUseAuthSessionState = jest.fn()

jest.mock("@/hooks/use-auth-session-state", () => ({
  useAuthSessionState: () => mockUseAuthSessionState(),
}))

jest.mock("@/lib/auth/session", () => ({
  buildBearerAuthHeaders: () => ({ Authorization: "Bearer mock-token" }),
  getStoredAuthSession: () => ({ fullName: "Test User", accessToken: "mock-token" }),
}))


jest.mock("@/lib/budget-planner/service", () => ({
  getBudgetDashboard: jest.fn().mockResolvedValue({
    net_income: 2200,
    remaining_income: 1400,
    total_spent: 800,
    total_saved: 0,
    financial_snapshot_score: 85,
    alerts: [],
    category_breakdown: [
      { id: 1, category_name: "Rent", spent_amount: 500, limit_amount: 600, percentage: 62.5 },
    ],
    savings_goals: [],
    summary: "",
  }),
  getTransactions: jest.fn().mockResolvedValue([]),
  updateBudget: jest.fn().mockResolvedValue(undefined),
  addCategory: jest.fn().mockResolvedValue(undefined),
  editCategory: jest.fn().mockResolvedValue(undefined),
  deleteCategory: jest.fn().mockResolvedValue(undefined),
  addSavingsGoal: jest.fn().mockResolvedValue(undefined),
  editSavingsGoal: jest.fn().mockResolvedValue(undefined),
  deleteSavingsGoal: jest.fn().mockResolvedValue(undefined),
  addTransaction: jest.fn().mockResolvedValue(undefined),
  editTransaction: jest.fn().mockResolvedValue(undefined),
  deleteTransaction: jest.fn().mockResolvedValue(undefined),
}))


jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

jest.mock("@/components/budget-planner/budget-summary-card", () => ({
  BudgetSummaryCard: ({ onUpdateIncome }: { onUpdateIncome: (n: number) => Promise<void> }) => (
    <div data-testid="budget-summary-card">
      <button onClick={() => onUpdateIncome(2200)}>update income</button>
    </div>
  ),
}))

jest.mock("@/components/budget-planner/budget-breakdown", () => ({
  BudgetBreakdown: ({ onAdd }: { onAdd: () => Promise<void> }) => (
    <div data-testid="budget-breakdown">
      <button onClick={() => onAdd()}>add category</button>
    </div>
  ),
}))

jest.mock("@/components/budget-planner/budget-score", () => ({
  BudgetScore: () => <div data-testid="budget-score">score</div>,
}))

jest.mock("@/components/budget-planner/budget-alerts", () => ({
  BudgetAlerts: () => <div data-testid="budget-alerts">alerts</div>,
}))

jest.mock("@/components/budget-planner/budget-savings-goals", () => ({
  BudgetSavingsGoals: ({ onAdd }: { onAdd: () => Promise<void> }) => (
    <div data-testid="budget-savings-goals">
      <button onClick={() => onAdd()}>add goal</button>
    </div>
  ),
}))

jest.mock("@/components/budget-planner/budget-transactions", () => ({
  BudgetTransactions: ({ onAdd }: { onAdd: () => Promise<void> }) => (
    <div data-testid="budget-transactions">
      <button onClick={() => onAdd()}>add transaction</button>
    </div>
  ),
}))

jest.mock("@/lib/api/base-url", () => ({
  getApiBaseUrl: () => "http://localhost:8000",
}))


function mockAuthenticated() {
  mockUseAuthSessionState.mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { name: "Test User", email: "test@test.com" },
    logoutUser: jest.fn(),
  })
}

function mockUnauthenticated() {
  mockUseAuthSessionState.mockReturnValue({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    logoutUser: jest.fn(),
  })
}


describe("BudgetPlannerContent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows Login / Signup button when not authenticated", () => {
    mockUnauthenticated()
    render(<BudgetPlannerContent />)
    expect(screen.getByRole("link", { name: /login \/ signup/i })).toBeInTheDocument()
  })

  it("hides Login / Signup button when authenticated", async () => {
    mockAuthenticated()
    render(<BudgetPlannerContent />)
    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /login \/ signup/i })).not.toBeInTheDocument()
    })
  })

  it("shows mock data when not authenticated", () => {
    mockUnauthenticated()
    render(<BudgetPlannerContent />)
    expect(screen.getByTestId("budget-summary-card")).toBeInTheDocument()
  })

  it("shows auth error banner when unauthenticated user tries to add a category", async () => {
    const user = userEvent.setup()
    mockUnauthenticated()
    render(<BudgetPlannerContent />)

    await user.click(screen.getByRole("tab", { name: /spending/i }))
    await user.click(screen.getByRole("button", { name: /add category/i }))

    await waitFor(() => {
      expect(screen.getByText(/please log in or sign up to use this feature/i)).toBeInTheDocument()
    })
  })

  it("shows auth error banner when unauthenticated user tries to add a transaction", async () => {
    const user = userEvent.setup()
    mockUnauthenticated()
    render(<BudgetPlannerContent />)

    await user.click(screen.getByRole("tab", { name: /transactions/i }))
    await user.click(screen.getByRole("button", { name: /add transaction/i }))

    await waitFor(() => {
      expect(screen.getByText(/please log in or sign up to use this feature/i)).toBeInTheDocument()
    })
  })

  it("shows auth error banner when unauthenticated user tries to add a savings goal", async () => {
    const user = userEvent.setup()
    mockUnauthenticated()
    render(<BudgetPlannerContent />)

    await user.click(screen.getByRole("tab", { name: /savings/i }))
    await user.click(screen.getByRole("button", { name: /add goal/i }))

    await waitFor(() => {
      expect(screen.getByText(/please log in or sign up to use this feature/i)).toBeInTheDocument()
    })
  })

  it("dismisses auth error banner when X is clicked", async () => {
    const user = userEvent.setup()
    mockUnauthenticated()
    render(<BudgetPlannerContent />)

    await user.click(screen.getByRole("tab", { name: /spending/i }))
    await user.click(screen.getByRole("button", { name: /add category/i }))
    await waitFor(() => {
      expect(screen.getByText(/please log in or sign up to use this feature/i)).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /✕/i }))
    await waitFor(() => {
      expect(screen.queryByText(/please log in or sign up to use this feature/i)).not.toBeInTheDocument()
    })
  })

  it("does not show auth error banner when authenticated user performs actions", async () => {
    const user = userEvent.setup()
    mockAuthenticated()
    render(<BudgetPlannerContent />)

    await waitFor(() => {
      expect(screen.getByTestId("budget-summary-card")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: /update income/i }))

    await waitFor(() => {
      expect(screen.queryByText(/please log in or sign up to use this feature/i)).not.toBeInTheDocument()
    })
  })

  it("renders all four tabs", async () => {
    mockAuthenticated()
    render(<BudgetPlannerContent />)

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /spending/i })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /transactions/i })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /savings/i })).toBeInTheDocument()
    })
  })

  it("renders sidebar", () => {
    mockUnauthenticated()
    render(<BudgetPlannerContent />)
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
  })
})