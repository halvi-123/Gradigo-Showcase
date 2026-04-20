import { getApiBaseUrl } from "@/lib/api/base-url"
import { getSavedMoveOutPlan, saveMoveOutPlan } from "@/lib/move-out-readiness/service"
import type { MoveOutReadinessApiResponse } from "@/lib/move-out-readiness/types"

jest.mock("@/lib/api/base-url", () => ({
  getApiBaseUrl: jest.fn(),
}))

const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>

function createMockResponse({
  ok,
  status,
  jsonData,
}: {
  ok: boolean
  status: number
  jsonData?: unknown
}): Response {
  return {
    ok,
    status,
    json: async () => jsonData,
  } as Response
}

function createSampleResponse(overrides: Partial<MoveOutReadinessApiResponse> = {}): MoveOutReadinessApiResponse {
  return {
    id: 12,
    target_postcode: "EH1 1YZ",
    area_name: "Edinburgh",
    monthly_income: "3200.00",
    monthly_expenses: "1200.00",
    estimated_monthly_rent: "1100.00",
    disposable_income: "2000.00",
    rent_ratio_percent: "34.38",
    readiness_score: 60,
    status: "borderline",
    crime_level: "Moderate",
    property_listings: [
      {
        listing_id: "abc-1",
        display_address: "Leith Walk, Edinburgh",
        latest_price: "1050",
      },
    ],
    summary: "Affordability is tight but manageable.",
    updated_at: "2026-04-16T12:00:00Z",
    ...overrides,
  }
}

describe("move-out readiness service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    mockGetApiBaseUrl.mockReturnValue("http://api.test")
  })

  it("maps GET saved plan response to frontend model with derived fields", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: createSampleResponse(),
      }),
    )

    const result = await getSavedMoveOutPlan()

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api.test/api/moveout/check/",
      expect.objectContaining({
        method: "GET",
      }),
    )

    expect(result).toMatchObject({
      targetPostcode: "EH1 1YZ",
      areaName: "Edinburgh",
      status: "borderline",
      statusLabel: "Borderline",
      statusTone: "warning",
      crimeLevel: "Moderate",
      crimeSeverity: 3,
      affordabilityBand: "stretched",
    })

    expect(result.propertyListings[0]).toMatchObject({
      listingId: "abc-1",
      displayAddress: "Leith Walk, Edinburgh",
      latestPrice: 1050,
    })
  })

  it("returns null for GET when backend reports no saved plan with 204", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 204,
      }),
    )

    const result = await getSavedMoveOutPlan()

    expect(result).toBeNull()
  })

  it("normalizes POST request payload and maps response", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: createSampleResponse({ status: "ready", rent_ratio_percent: "28.10" }),
      }),
    )

    const result = await saveMoveOutPlan({
      postcode: " eh1 1yz ",
      monthlyIncome: 3500,
      monthlyExpenses: 900,
    })

    expect(global.fetch).toHaveBeenCalledWith(
      "http://api.test/api/moveout/check/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          postcode: "EH1 1YZ",
          monthly_income: 3500,
          monthly_expenses: 900,
        }),
      }),
    )

    expect(result.status).toBe("ready")
    expect(result.affordabilityBand).toBe("comfortable")
  })

  it("returns field-level validation details on 400", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 400,
        jsonData: {
          postcode: ["Postcode is needed"],
          monthly_income: ["Monthly income must be greater than zero"],
        },
      }),
    )

    await expect(
      saveMoveOutPlan({
        postcode: "",
        monthlyIncome: 0,
        monthlyExpenses: 1200,
      }),
    ).rejects.toMatchObject({
      status: 400,
      fieldErrors: {
        postcode: "Postcode is needed",
        monthlyIncome: "Monthly income must be greater than zero",
      },
    })
  })

  it("maps 404 no-plan detail to an API error", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 404,
        jsonData: {
          detail: "No saved move out plan found for this user",
        },
      }),
    )

    await expect(getSavedMoveOutPlan()).rejects.toMatchObject({
      status: 404,
      message: "No saved move out plan found for this user",
    })
  })

  it("maps AbortError failures to request timeout API error", async () => {
    const abortError = new Error("aborted")
    abortError.name = "AbortError"

    ;(global.fetch as jest.Mock).mockRejectedValue(abortError)

    await expect(getSavedMoveOutPlan()).rejects.toMatchObject({
      status: 408,
      message: "This request is taking longer than expected. Please try again.",
    })
  })

  it("maps unknown network failures to connectivity fallback message", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce("network-down")

    await expect(getSavedMoveOutPlan()).rejects.toMatchObject({
      status: 0,
      message: "We could not connect right now. Please check your internet and try again.",
    })
  })

})
