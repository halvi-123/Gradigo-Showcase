import { act, renderHook } from "@testing-library/react"
import { useSalaryInputForm, salaryInputLimits } from "@/hooks/use-salary-input-form"
import type { SalaryCalculationInput } from "@/lib/salary-calculator/types"

describe("useSalaryInputForm", () => {
  it("starts with the expected default state", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    expect(result.current.region).toBe("england")
    expect(result.current.annualSalary).toBe(30_000)
    expect(result.current.annualSalaryInput).toBe("30000")
    expect(result.current.annualSalaryText).toBe("30,000")
    expect(result.current.hoursWorked).toBe(40)
    expect(result.current.hourlyRate).toBe(15)
    expect(result.current.pensionContributionInput).toBe("5")
    expect(result.current.studentLoanType).toBe("none")
    expect(result.current.estimatorOpen).toBe(false)
    expect(result.current.sliderSalary).toBe(30_000)
    expect(result.current.estimatedAnnualSalary).toBe(31_200)
  })

  it("updates annual salary as the user types and rounds on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("12345.67")
    })

    expect(result.current.annualSalary).toBe(12_346)
    expect(result.current.annualSalaryInput).toBe("12345.67")

    act(() => {
      result.current.handleAnnualSalaryBlur()
    })

    expect(result.current.annualSalary).toBe(12_346)
    expect(result.current.annualSalaryInput).toBe("12346")
  })

  it("resets empty annual salary input to the minimum on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("")
    })

    expect(result.current.annualSalaryInput).toBe("")

    act(() => {
      result.current.handleAnnualSalaryBlur()
    })

    expect(result.current.annualSalary).toBe(salaryInputLimits.MIN_SALARY)
    expect(result.current.annualSalaryInput).toBe(String(salaryInputLimits.MIN_SALARY))
  })

  it("strips non-numeric annual salary characters and normalizes on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("12k34")
    })

    expect(result.current.annualSalaryInput).toBe("12k34")
    expect(result.current.annualSalary).toBe(1_234)

    act(() => {
      result.current.handleAnnualSalaryBlur()
    })

    expect(result.current.annualSalary).toBe(1_234)
    expect(result.current.annualSalaryInput).toBe("1234")
  })

  it("clamps annual salary to the supported range on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("9999999999")
    })

    act(() => {
      result.current.handleAnnualSalaryBlur()
    })

    expect(result.current.annualSalary).toBe(salaryInputLimits.MAX_SALARY)
    expect(result.current.annualSalaryInput).toBe(String(salaryInputLimits.MAX_SALARY))
  })

  it("ignores inputs that do not contain any usable salary digits", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("abc")
      result.current.handleAnnualSalaryBlur()
    })

    expect(result.current.annualSalary).toBe(30_000)
    expect(result.current.annualSalaryInput).toBe("30000")
  })

  it("updates pension contribution with decimals and clamps it on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handlePensionContributionChange("3.8")
    })

    expect(result.current.pensionContributionInput).toBe("3.8")

    act(() => {
      result.current.handlePensionContributionBlur()
    })

    expect(result.current.pensionContributionInput).toBe("3.8")
  })

  it("resets empty pension input to zero on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handlePensionContributionChange("")
    })

    act(() => {
      result.current.handlePensionContributionBlur()
    })

    expect(result.current.pensionContributionInput).toBe("0")
  })

  it("keeps pension contribution within a valid percentage range", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handlePensionContributionChange("125")
    })

    expect(result.current.pensionContributionInput).toBe("5")

    act(() => {
      result.current.handlePensionContributionBlur()
    })

    expect(result.current.pensionContributionInput).toBe("5")

    act(() => {
      result.current.handlePensionContributionChange("-10")
    })

    act(() => {
      result.current.handlePensionContributionBlur()
    })

    expect(result.current.pensionContributionInput).toBe("10")
  })

  it("ignores pension input without digits and leaves the existing contribution unchanged", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handlePensionContributionChange("abc")
      result.current.handlePensionContributionBlur()
    })

    expect(result.current.pensionContributionInput).toBe("5")
  })

  it("allows decimal hourly rate and hours worked inputs for estimator calculations", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHourlyRateChange("16.5")
      result.current.handleHoursWorkedChange("37.5")
    })

    expect(result.current.hourlyRate).toBe(16.5)
    expect(result.current.hourlyRateInput).toBe("16.5")
    expect(result.current.hoursWorked).toBe(37.5)
    expect(result.current.hoursWorkedInput).toBe("37.5")
    expect(result.current.estimatedAnnualSalary).toBe(32_175)
  })

  it("rounds estimator inputs on blur", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHourlyRateChange("16.5")
      result.current.handleHoursWorkedChange("37.5")
    })

    act(() => {
      result.current.handleHourlyRateBlur()
      result.current.handleHoursWorkedBlur()
    })

    expect(result.current.hourlyRate).toBe(16.5)
    expect(result.current.hourlyRateInput).toBe("16.5")
    expect(result.current.hoursWorked).toBe(37.5)
    expect(result.current.hoursWorkedInput).toBe("37.5")
  })

  it("restores the live estimator values if the user clears and blurs an input", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHourlyRateChange("18")
      result.current.handleHoursWorkedChange("35")
    })

    act(() => {
      result.current.handleHourlyRateChange("")
      result.current.handleHoursWorkedChange("")
    })

    act(() => {
      result.current.handleHourlyRateBlur()
      result.current.handleHoursWorkedBlur()
    })

    expect(result.current.hourlyRate).toBe(18)
    expect(result.current.hourlyRateInput).toBe("18")
    expect(result.current.hoursWorked).toBe(35)
    expect(result.current.hoursWorkedInput).toBe("35")
    expect(result.current.estimatedAnnualSalary).toBe(32_760)
  })

  it("caps the estimated salary when hourly inputs would exceed the salary ceiling", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHourlyRateChange("200000")
      result.current.handleHoursWorkedChange("100000")
    })

    expect(result.current.estimatedAnnualSalary).toBe(salaryInputLimits.MAX_SALARY)
  })

  it("ignores hourly estimator fields that contain no usable digits", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHourlyRateChange("abc")
      result.current.handleHoursWorkedChange("xyz")
      result.current.handleHourlyRateBlur()
      result.current.handleHoursWorkedBlur()
    })

    expect(result.current.hourlyRate).toBe(15)
    expect(result.current.hourlyRateInput).toBe("15")
    expect(result.current.hoursWorked).toBe(40)
    expect(result.current.hoursWorkedInput).toBe("40")
    expect(result.current.estimatedAnnualSalary).toBe(31_200)
  })

  it("updates salary from slider and rounds large values to the nearest thousand", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleSliderChange([12_345])
    })

    expect(result.current.annualSalary).toBe(12_000)
    expect(result.current.annualSalaryInput).toBe("12000")

    act(() => {
      result.current.handleSliderChange([999_999])
    })

    expect(result.current.annualSalary).toBe(1_000_000)
    expect(result.current.annualSalaryInput).toBe("1000000")
  })

  it("keeps the slider pinned to the minimum when the handle is dragged below range", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleSliderChange([0])
    })

    expect(result.current.annualSalary).toBe(salaryInputLimits.MIN_SALARY)
    expect(result.current.annualSalaryInput).toBe(String(salaryInputLimits.MIN_SALARY))
    expect(result.current.sliderSalary).toBe(salaryInputLimits.MIN_SALARY)
  })

  it("applies the estimated salary and closes the estimator dialog", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.setEstimatorOpen(true)
      result.current.handleHourlyRateChange("20")
      result.current.handleHoursWorkedChange("40")
    })

    expect(result.current.estimatedAnnualSalary).toBe(41_600)

    act(() => {
      result.current.applyEstimatedSalary()
    })

    expect(result.current.annualSalary).toBe(41_600)
    expect(result.current.annualSalaryInput).toBe("41600")
    expect(result.current.estimatorOpen).toBe(false)
  })

  it("sends the current form values to onCalculate", async () => {
    const onCalculate = jest.fn<Promise<void> | void, [SalaryCalculationInput]>().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSalaryInputForm({ onCalculate }))

    act(() => {
      result.current.setRegion("scotland")
      result.current.setStudentLoanType("plan4")
      result.current.handleAnnualSalaryChange("45000")
      result.current.handlePensionContributionChange("7.5")
    })

    await act(async () => {
      await result.current.handleCalculate()
    })

    expect(onCalculate).toHaveBeenCalledWith({
      region: "scotland",
      grossAnnualSalary: 45_000,
      pensionContributionPercent: 7.5,
      studentLoanType: "plan4",
    })
  })

  it("updates the selected region and loan type through the exposed setters", async () => {
    const onCalculate = jest.fn<Promise<void> | void, [SalaryCalculationInput]>().mockResolvedValue(undefined)
    const { result } = renderHook(() => useSalaryInputForm({ onCalculate }))

    act(() => {
      result.current.setRegion("scotland")
      result.current.setStudentLoanType("plan5")
      result.current.handleAnnualSalaryChange("60000")
      result.current.handlePensionContributionChange("10")
    })

    await act(async () => {
      await result.current.handleCalculate()
    })

    expect(onCalculate).toHaveBeenCalledWith({
      region: "scotland",
      grossAnnualSalary: 60_000,
      pensionContributionPercent: 10,
      studentLoanType: "plan5",
    })
  })

  it("logs a payload when no onCalculate callback is provided", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => undefined)
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleAnnualSalaryChange("30000")
      result.current.handlePensionContributionChange("5")
    })

    await act(async () => {
      await result.current.handleCalculate()
    })

    expect(consoleLogSpy).toHaveBeenCalledWith("Salary calculation payload", {
      region: "england",
      grossAnnualSalary: 30_000,
      pensionContributionPercent: 5,
      studentLoanType: "none",
    })

    consoleLogSpy.mockRestore()
  })

  it("clamps hours worked per week to a maximum of 168", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHoursWorkedChange("200")
    })
    expect(result.current.hoursWorked).toBe(168)
    expect(result.current.hoursWorkedInput).toBe("168")

    act(() => {
      result.current.handleHoursWorkedChange("168")
    })
    expect(result.current.hoursWorked).toBe(168)
    expect(result.current.hoursWorkedInput).toBe("168")

    act(() => {
      result.current.handleHoursWorkedChange("167")
    })
    expect(result.current.hoursWorked).toBe(167)
    expect(result.current.hoursWorkedInput).toBe("167")
  })

  it("clamps hours worked per week to a minimum of 0", () => {
    const { result } = renderHook(() => useSalaryInputForm({}))

    act(() => {
      result.current.handleHoursWorkedChange("-10")
    })
    expect(result.current.hoursWorked).toBe(0)
    expect(result.current.hoursWorkedInput).toBe("0")
  })
})
