import { getApiBaseUrl } from "@/lib/api/base-url"
import { calculateSalary, getDefaultSalaryCalculationResult } from "@/lib/salary-calculator/service"
import type { SalaryCalculationApiResponse, SalaryCalculationInput } from "@/lib/salary-calculator/types"

jest.mock("@/lib/api/base-url", () => ({
  getApiBaseUrl: jest.fn(),
}))

const mockGetApiBaseUrl = getApiBaseUrl as jest.MockedFunction<typeof getApiBaseUrl>

function createMockResponse({
  ok,
  status,
  jsonData,
  textData = "",
}: {
  ok: boolean
  status: number
  jsonData?: unknown
  textData?: string
}): Response {
  return {
    ok,
    status,
    json: async () => jsonData,
    text: async () => textData,
  } as Response
}

function getLastRequestBody(): SalaryCalculationInput | Record<string, unknown> {
  const calls = (global.fetch as jest.Mock).mock.calls
  const lastCall = calls[calls.length - 1]
  const init = lastCall?.[1] as RequestInit | undefined
  const body = init?.body
  return body ? (JSON.parse(body as string) as Record<string, unknown>) : {}
}

describe("salary service", () => {
  const mutableEnv = process.env as Record<string, string | undefined>
  const originalNodeEnv = mutableEnv.NODE_ENV

  function setNodeEnv(value: string | undefined) {
    mutableEnv.NODE_ENV = value
  }

  beforeEach(() => {
    mockGetApiBaseUrl.mockReturnValue("http://api.test")
    global.fetch = jest.fn()
    setNodeEnv("test")
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
    setNodeEnv(originalNodeEnv)
  })

  it("returns the default salary calculation result with monthly derived from annual", () => {
    const result = getDefaultSalaryCalculationResult()

    expect(result.netMonthlyPay).toBe(result.netAnnualPay / 12)
    expect(result.grossAnnualSalary).toBe(30_000)
    expect(result.studentLoanRepayment).toBe(0)
  })

  it("maps input to API request and maps API response back to domain result", async () => {
    const apiResponse: SalaryCalculationApiResponse = {
      gross_salary: 50_000,
      tax_region: "england",
      income_tax: 7_500,
      national_insurance: 3_200,
      student_loan: 1_100,
      pension: 2_500,
      total_deductions: 14_300,
      net_annual: 35_700,
      net_monthly: 2_975,
    }

    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: true, status: 200, jsonData: apiResponse }),
    )

    const input: SalaryCalculationInput = {
      region: "england",
      grossAnnualSalary: 50_000,
      pensionContributionPercent: 5,
      studentLoanType: "plan2",
    }

    const result = await calculateSalary(input)

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      "http://api.test/api/salary/calculate/",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gross_salary: 50_000,
          pension_percent: 5,
          tax_region: "england",
          student_loan_plan: "plan2",
        }),
        signal: expect.any(AbortSignal),
      }),
    )

    expect(result).toEqual({
      grossAnnualSalary: 50_000,
      netAnnualPay: 35_700,
      netMonthlyPay: 2_975,
      totalDeductions: 14_300,
      incomeTax: 7_500,
      nationalInsurance: 3_200,
      pensionContribution: 2_500,
      studentLoanRepayment: 1_100,
    })
  })

  it("normalizes invalid request values before API call", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 0,
          tax_region: "scotland",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 0,
          net_monthly: 0,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "scotland",
      grossAnnualSalary: -100,
      pensionContributionPercent: 120,
      studentLoanType: "none",
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          gross_salary: 0,
          pension_percent: 100,
          tax_region: "scotland",
          student_loan_plan: null,
        }),
      }),
    )
  })

  it.each([
    [-1, 0],
    [0, 0],
    [1, 1],
    [999_999_999, 999_999_999],
  ])("normalizes gross salary %s to %s", async (grossAnnualSalary, expectedGrossSalary) => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: expectedGrossSalary,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: expectedGrossSalary,
          net_monthly: expectedGrossSalary / 12,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary,
      pensionContributionPercent: 5,
      studentLoanType: "none",
    })

    expect(getLastRequestBody()).toMatchObject({
      gross_salary: expectedGrossSalary,
    })
  })

  it.each([
    [-0.1, 0],
    [0, 0],
    [100, 100],
    [100.1, 100],
  ])("normalizes pension percent %s to %s", async (pensionContributionPercent, expectedPensionPercent) => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 50_000,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 50_000,
          net_monthly: 4_166.67,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary: 50_000,
      pensionContributionPercent,
      studentLoanType: "none",
    })

    expect(getLastRequestBody()).toMatchObject({
      pension_percent: expectedPensionPercent,
    })
  })

  it("clamps negative pension contribution to 0", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 30_000,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 30_000,
          net_monthly: 2_500,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary: 30_000,
      pensionContributionPercent: -2,
      studentLoanType: "none",
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          gross_salary: 30_000,
          pension_percent: 0,
          tax_region: "england",
          student_loan_plan: null,
        }),
      }),
    )
  })

  it.each([
    ["plan1", "plan1"],
    ["plan2", "plan2"],
    ["plan4", "plan4"],
    ["plan5", "plan5"],
  ] as const)("maps student loan type %s to API plan %s", async (studentLoanType, expectedPlan) => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 42_000,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 42_000,
          net_monthly: 3_500,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary: 42_000,
      pensionContributionPercent: 5,
      studentLoanType,
    })

    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          gross_salary: 42_000,
          pension_percent: 5,
          tax_region: "england",
          student_loan_plan: expectedPlan,
        }),
      }),
    )
  })

  it("calls getApiBaseUrl once per request", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 40_000,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 40_000,
          net_monthly: 3_333.33,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary: 40_000,
      pensionContributionPercent: 5,
      studentLoanType: "none",
    })

    expect(mockGetApiBaseUrl).toHaveBeenCalledTimes(1)
  })

  it("throws a friendly timeout message when the request exceeds timeout", async () => {
    jest.useFakeTimers()

    ;(global.fetch as jest.Mock).mockImplementation((_url: string, init?: RequestInit) => {
      const signal = init?.signal
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          const abortError = new Error("Aborted")
          abortError.name = "AbortError"
          reject(abortError)
        })
      })
    })

    const requestPromise = calculateSalary({
      region: "england",
      grossAnnualSalary: 45_000,
      pensionContributionPercent: 5,
      studentLoanType: "none",
    })

    jest.advanceTimersByTime(10_001)

    await expect(requestPromise).rejects.toThrow(
      "This is taking longer than expected. Please try again.",
    )
  })

  it("clears request timeout when request resolves successfully", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")

    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({
        ok: true,
        status: 200,
        jsonData: {
          gross_salary: 36_000,
          tax_region: "england",
          income_tax: 0,
          national_insurance: 0,
          student_loan: 0,
          pension: 0,
          total_deductions: 0,
          net_annual: 36_000,
          net_monthly: 3_000,
        } satisfies SalaryCalculationApiResponse,
      }),
    )

    await calculateSalary({
      region: "england",
      grossAnnualSalary: 36_000,
      pensionContributionPercent: 5,
      studentLoanType: "none",
    })

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it("clears request timeout when fetch rejects", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network down"))

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "none",
      }),
    ).rejects.toThrow("We could not connect right now. Please check your internet and try again.")

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it("clears request timeout when response is non-OK", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout")
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 400, textData: "Bad request" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "none",
      }),
    ).rejects.toThrow("Please check your entries and try again.")

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it("throws a friendly connectivity message on non-timeout fetch failures", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network down"))

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("We could not connect right now. Please check your internet and try again.")
  })

  it("maps HTTP 400 to a user input guidance error", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 400, textData: "Bad request" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("Please check your entries and try again.")
  })

  it("maps HTTP 500+ to a server-side friendly error", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 503, textData: "Service unavailable" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("Something went wrong on our side. Please try again in a moment.")
  })

  it("maps other non-OK statuses to a generic calculation failure", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 418, textData: "Teapot" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("We could not complete your calculation right now. Please try again.")
  })

  it.each([401, 403, 404, 429])(
    "maps HTTP %s to generic non-OK calculation failure message",
    async (status) => {
      ;(global.fetch as jest.Mock).mockResolvedValue(
        createMockResponse({ ok: false, status, textData: "Request failed" }),
      )

      await expect(
        calculateSalary({
          region: "england",
          grossAnnualSalary: 45_000,
          pensionContributionPercent: 5,
          studentLoanType: "plan1",
        }),
      ).rejects.toThrow("We could not complete your calculation right now. Please try again.")
    },
  )

  it("maps getApiBaseUrl failures to connectivity message and does not call fetch", async () => {
    mockGetApiBaseUrl.mockImplementation(() => {
      throw new Error("Missing NEXT_PUBLIC_API_BASE_URL for non-development environment")
    })

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "none",
      }),
    ).rejects.toThrow("We could not connect right now. Please check your internet and try again.")

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("surfaces JSON parsing failures for successful responses", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => {
        throw new Error("Invalid JSON payload")
      },
    } as unknown as Response)

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "none",
      }),
    ).rejects.toThrow("Invalid JSON payload")
  })

  it("logs API error details in development for non-OK responses", async () => {
    setNodeEnv("development")
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 500, textData: "Detailed backend stack" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("Something went wrong on our side. Please try again in a moment.")

    expect(consoleErrorSpy).toHaveBeenCalledWith("Salary API request failed", {
      status: 500,
      body: "Detailed backend stack",
    })
  })

  it("does not log API error details outside development", async () => {
    setNodeEnv("test")
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

    ;(global.fetch as jest.Mock).mockResolvedValue(
      createMockResponse({ ok: false, status: 400, textData: "Validation details" }),
    )

    await expect(
      calculateSalary({
        region: "england",
        grossAnnualSalary: 45_000,
        pensionContributionPercent: 5,
        studentLoanType: "plan1",
      }),
    ).rejects.toThrow("Please check your entries and try again.")

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})
