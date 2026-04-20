import { act, renderHook, waitFor } from "@testing-library/react"
import { useMoveOutReadiness } from "@/hooks/use-move-out-readiness"
import { getSavedMoveOutPlan, saveMoveOutPlan } from "@/lib/move-out-readiness/service"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

jest.mock("@/lib/move-out-readiness/service", () => ({
  getSavedMoveOutPlan: jest.fn(),
  saveMoveOutPlan: jest.fn(),
}))

const mockGetSavedMoveOutPlan = getSavedMoveOutPlan as jest.MockedFunction<typeof getSavedMoveOutPlan>
const mockSaveMoveOutPlan = saveMoveOutPlan as jest.MockedFunction<typeof saveMoveOutPlan>

function createPlan(overrides: Partial<MoveOutReadinessPlan> = {}): MoveOutReadinessPlan {
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

describe("useMoveOutReadiness", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("loads saved plan on mount when autoLoad is enabled", async () => {
    mockGetSavedMoveOutPlan.mockResolvedValueOnce(createPlan())

    const { result } = renderHook(() => useMoveOutReadiness())

    expect(result.current.isInitialLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    expect(result.current.plan?.targetPostcode).toBe("EH1 1YZ")
    expect(result.current.isEmpty).toBe(false)
    expect(result.current.loadError).toBeNull()
  })

  it("sets empty state when saved plan returns 404", async () => {
    mockGetSavedMoveOutPlan.mockRejectedValueOnce({
      status: 404,
      message: "No saved move out plan found for this user",
    })

    const { result } = renderHook(() => useMoveOutReadiness())

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    expect(result.current.plan).toBeNull()
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.loadError).toBeNull()
  })

  it("submits plan and stores returned payload", async () => {
    mockSaveMoveOutPlan.mockResolvedValueOnce(createPlan({ status: "ready", statusLabel: "Ready" }))

    const { result } = renderHook(() => useMoveOutReadiness({ autoLoad: false }))

    await act(async () => {
      const saved = await result.current.submitPlan({
        postcode: "EH1 1YZ",
        monthlyIncome: 3400,
        monthlyExpenses: 1200,
      })

      expect(saved?.status).toBe("ready")
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.submitError).toBeNull()
    expect(result.current.plan?.status).toBe("ready")
  })

  it("maps submit validation errors and keeps plan unchanged", async () => {
    mockSaveMoveOutPlan.mockRejectedValueOnce({
      status: 400,
      message: "Please review the form and correct any issues.",
      fieldErrors: {
        postcode: "Postcode is needed",
      },
    })

    const { result } = renderHook(() => useMoveOutReadiness({ autoLoad: false }))

    await act(async () => {
      const saved = await result.current.submitPlan({
        postcode: "",
        monthlyIncome: 0,
        monthlyExpenses: 1000,
      })

      expect(saved).toBeNull()
    })

    expect(result.current.submitError).toBe("Please review the form and correct any issues.")
    expect(result.current.validationErrors.postcode).toBe("Postcode is needed")
  })

  it("supports manual load when a plan already exists", async () => {
    mockGetSavedMoveOutPlan
      .mockResolvedValueOnce(createPlan())
      .mockResolvedValueOnce(createPlan({ areaName: "Glasgow" }))

    const { result } = renderHook(() => useMoveOutReadiness())

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    await act(async () => {
      await result.current.loadSavedPlan()
    })

    expect(mockGetSavedMoveOutPlan).toHaveBeenCalledTimes(2)
    expect(result.current.plan?.areaName).toBe("Glasgow")
  })

  it("reuses saved GET plan for unchanged inputs instead of posting again", async () => {
    mockGetSavedMoveOutPlan
      .mockResolvedValueOnce(createPlan())
      .mockResolvedValueOnce(createPlan({ areaName: "Leeds" }))

    const { result } = renderHook(() => useMoveOutReadiness())

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    await act(async () => {
      const saved = await result.current.submitPlan({
        postcode: "eh1 1yz",
        monthlyIncome: 3200,
        monthlyExpenses: 1200,
      })

      expect(saved?.areaName).toBe("Leeds")
    })

    expect(mockSaveMoveOutPlan).not.toHaveBeenCalled()
    expect(mockGetSavedMoveOutPlan).toHaveBeenCalledTimes(2)
    expect(result.current.plan?.areaName).toBe("Leeds")
  })

  it("falls back to POST when unchanged inputs are submitted but saved GET plan is empty", async () => {
    mockGetSavedMoveOutPlan
      .mockResolvedValueOnce(createPlan())
      .mockResolvedValueOnce(null)
    mockSaveMoveOutPlan.mockResolvedValueOnce(createPlan({ status: "ready", statusLabel: "Ready" }))

    const { result } = renderHook(() => useMoveOutReadiness())

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    await act(async () => {
      const saved = await result.current.submitPlan({
        postcode: "EH1 1YZ",
        monthlyIncome: 3200,
        monthlyExpenses: 1200,
      })

      expect(saved?.status).toBe("ready")
    })

    expect(mockGetSavedMoveOutPlan).toHaveBeenCalledTimes(2)
    expect(mockSaveMoveOutPlan).toHaveBeenCalledTimes(1)
  })

  it("reuses in-memory plan when unchanged-input GET refresh fails", async () => {
    mockGetSavedMoveOutPlan
      .mockResolvedValueOnce(createPlan({ areaName: "Edinburgh" }))
      .mockRejectedValueOnce({ status: 503, message: "Service unavailable" })

    const { result } = renderHook(() => useMoveOutReadiness())

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false)
    })

    await act(async () => {
      const saved = await result.current.submitPlan({
        postcode: "EH1 1YZ",
        monthlyIncome: 3200,
        monthlyExpenses: 1200,
      })

      expect(saved?.areaName).toBe("Edinburgh")
    })

    expect(mockSaveMoveOutPlan).not.toHaveBeenCalled()
    expect(result.current.submitError).toBeNull()
  })
})
