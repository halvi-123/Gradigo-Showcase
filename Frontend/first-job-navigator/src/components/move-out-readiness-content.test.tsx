import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { MoveOutReadinessContent } from "@/components/move-out-readiness-content"
import type {
  MoveOutReadinessFieldErrors,
  MoveOutReadinessInput,
  MoveOutReadinessPlan,
} from "@/lib/move-out-readiness/types"

const mockUseAuthSessionState = jest.fn()
const mockUseMoveOutReadiness = jest.fn()

const mockSubmitPlan = jest.fn<Promise<MoveOutReadinessPlan | null>, [MoveOutReadinessInput]>()
const mockClearSubmitErrors = jest.fn()

jest.mock("@/hooks/use-auth-session-state", () => ({
  useAuthSessionState: () => mockUseAuthSessionState(),
}))

jest.mock("@/hooks/use-move-out-readiness", () => ({
  useMoveOutReadiness: () => mockUseMoveOutReadiness(),
}))

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

jest.mock("@/components/move-out-readiness-input-card", () => ({
  MoveOutReadinessInputCard: ({
    onSubmit,
    submitError,
  }: {
    onSubmit?: (payload: MoveOutReadinessInput) => Promise<void> | void
    submitError?: string | null
  }) => (
    <section>
      <button
        type="button"
        onClick={() =>
          onSubmit?.({
            postcode: "EH1 1YZ",
            monthlyIncome: 3200,
            monthlyExpenses: 1200,
          })
        }
      >
        trigger move-out submit
      </button>
      <div data-testid="move-out-submit-error">{submitError ?? ""}</div>
    </section>
  ),
}))

jest.mock("@/components/move-out-readiness-summary-panel", () => ({
  MoveOutReadinessSummaryPanel: () => <div data-testid="summary-panel">summary</div>,
}))

jest.mock("@/components/move-out-readiness-map-card", () => ({
  MoveOutReadinessMapCard: () => <div data-testid="map-card">map</div>,
}))

jest.mock("@/components/move-out-readiness-affordability-breakdown", () => ({
  MoveOutReadinessAffordabilityBreakdown: () => <div data-testid="affordability-breakdown">breakdown</div>,
}))

jest.mock("@/components/move-out-readiness-property-listings", () => ({
  MoveOutReadinessPropertyListings: () => <div data-testid="property-listings">listings</div>,
}))

function buildPlan(overrides: Partial<MoveOutReadinessPlan> = {}): MoveOutReadinessPlan {
  return {
    id: 1,
    targetPostcode: "EH1 1YZ",
    areaName: "Edinburgh",
    monthlyIncome: 3200,
    monthlyExpenses: 1200,
    estimatedMonthlyRent: 1100,
    disposableIncome: 2000,
    rentRatioPercent: 34.4,
    readinessScore: 60,
    status: "borderline",
    statusLabel: "Borderline",
    statusTone: "warning",
    crimeLevel: "Moderate",
    crimeSeverity: 3,
    crimeIntensity: 0.6,
    affordabilityBand: "stretched",
    propertyListings: [],
    summary: "Plan summary",
    updatedAt: "2026-04-16T12:00:00Z",
    ...overrides,
  }
}

function createHookState(overrides?: {
  plan?: MoveOutReadinessPlan | null
  validationErrors?: MoveOutReadinessFieldErrors
  submitError?: string | null
}) {
  return {
    plan: overrides?.plan ?? buildPlan(),
    isInitialLoading: false,
    isRefreshing: false,
    isSubmitting: false,
    isEmpty: false,
    loadError: null,
    submitError: overrides?.submitError ?? null,
    validationErrors: overrides?.validationErrors ?? {},
    submitPlan: mockSubmitPlan,
    clearSubmitErrors: mockClearSubmitErrors,
  }
}

describe("MoveOutReadinessContent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSubmitPlan.mockResolvedValue(buildPlan())
    mockUseMoveOutReadiness.mockReturnValue(createHookState())
  })

  it("shows Login / Signup button when user is not authenticated", () => {
    mockUseAuthSessionState.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logoutUser: jest.fn(),
    })

    render(<MoveOutReadinessContent />)

    expect(screen.getByRole("link", { name: /login \/ signup/i })).toBeInTheDocument()
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
  })

  it("hides Login / Signup button when user is authenticated", () => {
    mockUseAuthSessionState.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "User", email: "user@example.com" },
      logoutUser: jest.fn(),
    })

    render(<MoveOutReadinessContent />)

    expect(screen.queryByRole("link", { name: /login \/ signup/i })).not.toBeInTheDocument()
  })

  it("shows auth-required submit message when signed out and trying to calculate", async () => {
    const user = userEvent.setup()
    mockUseAuthSessionState.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logoutUser: jest.fn(),
    })

    render(<MoveOutReadinessContent />)

    await user.click(screen.getByRole("button", { name: /trigger move-out submit/i }))

    await waitFor(() => {
      expect(screen.getByTestId("move-out-submit-error")).toHaveTextContent(
        "Please sign up/login to use this feature.",
      )
    })
    expect(mockSubmitPlan).not.toHaveBeenCalled()
  })

  it("submits plan through hook when user is authenticated", async () => {
    const user = userEvent.setup()
    mockUseAuthSessionState.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "User", email: "user@example.com" },
      logoutUser: jest.fn(),
    })

    render(<MoveOutReadinessContent />)

    await user.click(screen.getByRole("button", { name: /trigger move-out submit/i }))

    await waitFor(() => {
      expect(mockSubmitPlan).toHaveBeenCalledWith({
        postcode: "EH1 1YZ",
        monthlyIncome: 3200,
        monthlyExpenses: 1200,
      })
    })
  })
})
