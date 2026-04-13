import { useMemo, useState } from "react"
import type { Region, SalaryCalculationInput, StudentLoanType } from "@/lib/salary-calculator/types"

const MIN_SALARY = 1
const MAX_SALARY = 999_000_000
const MAX_SLIDER_SALARY = 500_000

type UseSalaryInputFormOptions = {
  onCalculate?: (payload: SalaryCalculationInput) => Promise<void> | void
}

function clampSalary(value: number) {
  if (Number.isNaN(value)) return MIN_SALARY
  return Math.min(MAX_SALARY, Math.max(MIN_SALARY, value))
}

function normalizeSliderSalary(value: number) {
  if (value <= MIN_SALARY) return MIN_SALARY
  return Math.round(value / 1000) * 1000
}

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function parseDecimalInput(rawValue: string): number {
  // Allow only digits and one decimal point
  const allowedChars = rawValue.replace(/[^0-9.]/g, "")
  // Ensure only one decimal point
  const parts = allowedChars.split(".")
  if (parts.length > 2) {
    return Number(parts[0] + "." + parts[1])
  }
  const parsed = Number(allowedChars)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function useSalaryInputForm({ onCalculate }: UseSalaryInputFormOptions) {
  const [region, setRegion] = useState<Region>("england")
  const [annualSalary, setAnnualSalary] = useState<number>(30000)
  const [annualSalaryInput, setAnnualSalaryInput] = useState<string>("30000")
  const [hoursWorked, setHoursWorked] = useState<number>(40)
  const [hoursWorkedInput, setHoursWorkedInput] = useState<string>("40")
  const [hourlyRate, setHourlyRate] = useState<number>(15)
  const [hourlyRateInput, setHourlyRateInput] = useState<string>("15")
  const [pensionContribution, setPensionContribution] = useState<number>(5)
  const [pensionContributionInput, setPensionContributionInput] = useState<string>("5")
  const [studentLoanType, setStudentLoanType] = useState<StudentLoanType>("none")
  const [estimatorOpen, setEstimatorOpen] = useState(false)

  const estimatedAnnualSalary = useMemo(() => {
    return clampSalary(Math.round(hourlyRate * hoursWorked * 52))
  }, [hourlyRate, hoursWorked])

  const annualSalaryText = useMemo(() => {
    return new Intl.NumberFormat("en-GB", {
      maximumFractionDigits: 0,
    }).format(annualSalary)
  }, [annualSalary])

  const sliderSalary = normalizeSliderSalary(Math.min(annualSalary, MAX_SLIDER_SALARY))

  function handleAnnualSalaryChange(rawValue: string) {
    if (rawValue === "") {
      setAnnualSalaryInput("")
      return
    }

    const parsedValue = parseDecimalInput(rawValue)
    if (!Number.isNaN(parsedValue) && parsedValue >= MIN_SALARY) {
      setAnnualSalary(Math.round(parsedValue))
      setAnnualSalaryInput(rawValue)
    }
  }

  function handleAnnualSalaryBlur() {
    if (annualSalaryInput === "") {
      setAnnualSalary(MIN_SALARY)
      setAnnualSalaryInput(MIN_SALARY.toString())
      return
    }

    const parsedValue = clampSalary(Math.round(parseDecimalInput(annualSalaryInput)))
    setAnnualSalary(parsedValue)
    setAnnualSalaryInput(parsedValue.toString())
  }

  function handlePensionContributionChange(rawValue: string) {
    if (rawValue === "") {
      setPensionContributionInput("")
      return
    }

    const parsedValue = parseDecimalInput(rawValue)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setPensionContribution(parsedValue)
      setPensionContributionInput(rawValue)
    }
  }

  function handlePensionContributionBlur() {
    if (pensionContributionInput === "") {
      setPensionContribution(0)
      setPensionContributionInput("0")
      return
    }

    const parsedValue = clampPercentage(parseDecimalInput(pensionContributionInput))
    setPensionContribution(parsedValue)
    setPensionContributionInput(parsedValue.toString())
  }

  function handleHourlyRateChange(rawValue: string) {
    if (rawValue === "") {
      setHourlyRateInput("")
      return
    }

    const parsedValue = parseDecimalInput(rawValue)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
      setHourlyRate(parsedValue)
      setHourlyRateInput(rawValue)
    }
  }

  function handleHourlyRateBlur() {
    if (hourlyRateInput === "") {
      setHourlyRateInput(hourlyRate.toString())
      return
    }

    const parsedValue = parseDecimalInput(hourlyRateInput)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
      setHourlyRate(parsedValue)
      setHourlyRateInput(parsedValue.toString())
    }
  }

  function handleHoursWorkedChange(rawValue: string) {
    if (rawValue === "") {
      setHoursWorkedInput("")
      return
    }

    const parsedValue = parseDecimalInput(rawValue)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
      setHoursWorked(parsedValue)
      setHoursWorkedInput(rawValue)
    }
  }

  function handleHoursWorkedBlur() {
    if (hoursWorkedInput === "") {
      setHoursWorkedInput(hoursWorked.toString())
      return
    }

    const parsedValue = parseDecimalInput(hoursWorkedInput)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0) {
      setHoursWorked(parsedValue)
      setHoursWorkedInput(parsedValue.toString())
    }
  }

  function handleSliderChange(value: number[]) {
    const rawValue = value[0] ?? MIN_SALARY
    const nextSalary = clampSalary(normalizeSliderSalary(rawValue))
    setAnnualSalary(nextSalary)
    setAnnualSalaryInput(nextSalary.toString())
  }

  function applyEstimatedSalary() {
    setAnnualSalary(estimatedAnnualSalary)
    setAnnualSalaryInput(estimatedAnnualSalary.toString())
    setEstimatorOpen(false)
  }

  async function handleCalculate() {
    const payload = {
      region,
      grossAnnualSalary: annualSalary,
      pensionContributionPercent: pensionContribution,
      studentLoanType,
    }

    if (onCalculate) {
      await onCalculate(payload)
      return
    }

    console.log("Salary calculation payload", payload)
  }

  return {
    annualSalary,
    annualSalaryInput,
    annualSalaryText,
    applyEstimatedSalary,
    estimatorOpen,
    estimatedAnnualSalary,
    handleAnnualSalaryBlur,
    handleAnnualSalaryChange,
    handleCalculate,
    handleHoursWorkedBlur,
    handleHoursWorkedChange,
    handleHourlyRateBlur,
    handleHourlyRateChange,
    handlePensionContributionBlur,
    handlePensionContributionChange,
    handleSliderChange,
    hourlyRate,
    hourlyRateInput,
    hoursWorked,
    hoursWorkedInput,
    pensionContributionInput,
    region,
    setEstimatorOpen,
    setHourlyRate,
    setHoursWorked,
    setRegion,
    setStudentLoanType,
    sliderSalary,
    studentLoanType,
  }
}

export const salaryInputLimits = {
  MAX_SALARY,
  MAX_SLIDER_SALARY,
  MIN_SALARY,
}
