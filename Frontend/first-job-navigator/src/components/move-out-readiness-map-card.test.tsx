import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"

import { MoveOutReadinessMapCard } from "@/components/move-out-readiness-map-card"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"
import type { UseMoveOutReadinessMapCardResult } from "@/hooks/use-move-out-readiness-map-card"

const mockUseMoveOutReadinessMapCard = jest.fn()

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock("@/hooks/use-move-out-readiness-map-card", () => ({
  useMoveOutReadinessMapCard: (args: unknown) => mockUseMoveOutReadinessMapCard(args),
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

function buildHookResult(overrides?: Partial<UseMoveOutReadinessMapCardResult>): UseMoveOutReadinessMapCardResult {
  return {
    ...defaultHookResult(),
    ...overrides,
  }
}

function defaultHookResult(): UseMoveOutReadinessMapCardResult {
  return {
    activeOverlay: "crime" as const,
    setActiveOverlay: jest.fn(),
    isGeocoding: false,
    geocodeError: null,
    targetLocation: {
      longitude: -3.1883,
      latitude: 55.9533,
      placeName: "Edinburgh",
    },
    mapImageUrl: "/api/mapbox/static?lng=-3.1883&lat=55.9533&zoom=13",
    showLoadingState: false,
    activeLayer: {
      label: "Crime: Moderate",
      opacity: 0.2,
      color: "#f59e0b",
    },
    inMapOverlayDescription: "In this area, crime is around a moderate level.",
    crimeOverlayLabel: "Moderate",
    affordabilityOverlayLabel: "Stretched",
    crimeOverlayAvailable: true,
    affordabilityOverlayAvailable: true,
    layerBaseDiameter: 138,
    layerOuterDiameter: 236,
  }
}

describe("MoveOutReadinessMapCard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMoveOutReadinessMapCard.mockReturnValue(buildHookResult())
  })

  it("renders loading skeleton when map state is loading", () => {
    mockUseMoveOutReadinessMapCard.mockReturnValue(
      buildHookResult({
        showLoadingState: true,
      }),
    )

    render(<MoveOutReadinessMapCard plan={buildPlan()} isInitialLoading />)

    expect(screen.getByText(/area map/i)).toBeInTheDocument()
    expect(screen.queryByText(/crime:/i)).not.toBeInTheDocument()
  })

  it("renders map details, overlays, and location metadata", () => {
    render(<MoveOutReadinessMapCard plan={buildPlan()} />)

    expect(screen.getByRole("img", { name: /move-out target map/i })).toBeInTheDocument()
    expect(screen.getByText("Edinburgh")).toBeInTheDocument()
    expect(screen.getByText(/55\.9533, -3\.1883/)).toBeInTheDocument()
    expect(screen.getAllByText(/crime:/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/affordability:/i).length).toBeGreaterThan(0)
  })

  it("shows load and geocode errors when provided", () => {
    mockUseMoveOutReadinessMapCard.mockReturnValue(
      buildHookResult({
        geocodeError: "Could not load map coordinates for this postcode. Showing fallback map.",
      }),
    )

    render(<MoveOutReadinessMapCard plan={buildPlan()} loadError="Service unavailable" />)

    expect(screen.getByText("Service unavailable")).toBeInTheDocument()
    expect(
      screen.getByText("Could not load map coordinates for this postcode. Showing fallback map."),
    ).toBeInTheDocument()
  })

  it("calls setActiveOverlay when affordability toggle is clicked", async () => {
    const user = userEvent.setup()
    const setActiveOverlay = jest.fn()

    mockUseMoveOutReadinessMapCard.mockReturnValue(
      buildHookResult({
        activeOverlay: "crime",
        setActiveOverlay,
      }),
    )

    render(<MoveOutReadinessMapCard plan={buildPlan()} />)

    const affordabilityButtons = screen.getAllByRole("button", { name: /affordability/i })
    await user.click(affordabilityButtons[0])

    expect(setActiveOverlay).toHaveBeenCalledWith("affordability")
  })

  it("calls setActiveOverlay when crime toggle is clicked", async () => {
    const user = userEvent.setup()
    const setActiveOverlay = jest.fn()

    mockUseMoveOutReadinessMapCard.mockReturnValue(
      buildHookResult({
        activeOverlay: "affordability",
        setActiveOverlay,
      }),
    )

    render(<MoveOutReadinessMapCard plan={buildPlan()} />)

    const crimeButtons = screen.getAllByRole("button", { name: /crime/i })
    await user.click(crimeButtons[0])

    expect(setActiveOverlay).toHaveBeenCalledWith("crime")
  })
})
