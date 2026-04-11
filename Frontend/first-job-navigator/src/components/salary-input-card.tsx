"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Region, SalaryCalculationInput, StudentLoanType } from "@/lib/salary-calculator/types"
import { CalculatorIcon, CircleHelpIcon } from "lucide-react"

const MIN_SALARY = 1
const MAX_SALARY = 999_000_000
const MAX_SLIDER_SALARY = 500_000

type SalaryInputCardProps = {
  onCalculate?: (payload: SalaryCalculationInput) => Promise<void> | void
  isCalculating?: boolean
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

function FieldHeading({
  label,
  tooltip,
  optional = false,
}: {
  label: string
  tooltip: string
  optional?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <FieldLabel className="text-white">
        {label}
        {optional ? (
          <span className="ml-2 text-xs font-medium italic text-[#f0ebd8]/75">
            Optional
          </span>
        ) : null}
      </FieldLabel>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Info about ${label}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/80 transition hover:text-white"
          >
            <CircleHelpIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function SalaryInputCard({ onCalculate, isCalculating = false }: SalaryInputCardProps) {
  const [region, setRegion] = useState<Region>("england")
  const [annualSalary, setAnnualSalary] = useState<number>(30000)
  const [annualSalaryInput, setAnnualSalaryInput] = useState<string>("30000")
  const [hoursWorked, setHoursWorked] = useState<number>(40)
  const [hourlyRate, setHourlyRate] = useState<number>(15)
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
    const digitsOnly = rawValue.replace(/\D/g, "")
    if (digitsOnly === "") {
      setAnnualSalaryInput("")
      return
    }

    const normalizedInput = digitsOnly.replace(/^0+(?=\d)/, "")
    const parsedValue = clampSalary(Number(normalizedInput))
    setAnnualSalary(parsedValue)
    setAnnualSalaryInput(parsedValue.toString())
  }

  function handleAnnualSalaryBlur() {
    if (annualSalaryInput === "") {
      setAnnualSalary(MIN_SALARY)
      setAnnualSalaryInput(MIN_SALARY.toString())
      return
    }

    const parsedValue = clampSalary(Number(annualSalaryInput))
    setAnnualSalary(parsedValue)
    setAnnualSalaryInput(parsedValue.toString())
  }

  function handlePensionContributionChange(rawValue: string) {
    const digitsOnly = rawValue.replace(/\D/g, "")
    if (digitsOnly === "") {
      setPensionContributionInput("")
      return
    }

    const normalizedInput = digitsOnly.replace(/^0+(?=\d)/, "")
    const parsedValue = clampPercentage(Number(normalizedInput))
    setPensionContribution(parsedValue)
    setPensionContributionInput(parsedValue.toString())
  }

  function handlePensionContributionBlur() {
    if (pensionContributionInput === "") {
      setPensionContribution(0)
      setPensionContributionInput("0")
      return
    }

    const parsedValue = clampPercentage(Number(pensionContributionInput))
    setPensionContribution(parsedValue)
    setPensionContributionInput(parsedValue.toString())
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

  return (
    <Card className="border-0 bg-[#0d1321] text-white ring-0">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={region} onValueChange={(value) => setRegion(value as Region)} className="gap-0">
            <TabsList className="h-9 bg-[#1d2d44] p-1">
              <TabsTrigger value="england" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
                England
              </TabsTrigger>
              <TabsTrigger value="scotland" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
                Scotland
              </TabsTrigger>
            </TabsList>
          </Tabs>

        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight text-white">Salary Inputs</CardTitle>
        <p className="text-sm text-[#f0ebd8]/85">
          Enter your gross annual salary and deduction preferences to preview estimated net pay.
        </p>
      </CardHeader>

      <CardContent>
        <FieldGroup className="gap-5">
          <Field>
            <FieldHeading
              label="Gross annual salary"
              tooltip="Enter your annual salary before tax and deductions."
            />
            <Input
              id="salary-amount"
              type="number"
              step={1}
              value={annualSalaryInput}
              min={MIN_SALARY}
              max={MAX_SALARY}
              onChange={(event) => handleAnnualSalaryChange(event.target.value)}
              onBlur={handleAnnualSalaryBlur}
              className="h-11 border-white/30 bg-white text-[#0d1321]"
            />
            <Dialog open={estimatorOpen} onOpenChange={setEstimatorOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 justify-start px-0 text-xs font-semibold text-[#748cab] hover:bg-transparent hover:text-[#f0ebd8]"
                >
                  Not sure about your annual income? Click here to calculate it.
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Estimate Annual Salary</DialogTitle>
                  <DialogDescription>
                    Use hourly rate and hours worked per week to estimate gross annual salary.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <Field>
                    <FieldLabel htmlFor="hourly-rate">Hourly Rate (£)</FieldLabel>
                    <Input
                      id="hourly-rate"
                      type="number"
                      min={0}
                      value={hourlyRate}
                      onChange={(event) => setHourlyRate(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="hours-week">Hours worked per week</FieldLabel>
                    <Input
                      id="hours-week"
                      type="number"
                      min={0}
                      value={hoursWorked}
                      onChange={(event) => setHoursWorked(Math.max(0, Number(event.target.value) || 0))}
                    />
                  </Field>
                  <p className="text-sm text-muted-foreground">
                    Estimated annual salary: <span className="font-semibold text-foreground">£{new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(estimatedAnnualSalary)}</span>
                  </p>
                </div>

                <DialogFooter showCloseButton>
                  <Button
                    type="button"
                    onClick={() => {
                      setAnnualSalary(estimatedAnnualSalary)
                      setAnnualSalaryInput(estimatedAnnualSalary.toString())
                      setEstimatorOpen(false)
                    }}
                  >
                    Use this estimate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Field>

          <Field>
            <FieldHeading
              label="Adjust estimate"
              tooltip="Quick-adjust values in a practical range. You can still type larger values in the salary input."
            />
            <Slider
              value={[sliderSalary]}
              min={MIN_SALARY}
              max={MAX_SLIDER_SALARY}
              step={1}
              onValueChange={(value) => {
                const rawValue = value[0] ?? MIN_SALARY
                const nextSalary = clampSalary(normalizeSliderSalary(rawValue))
                setAnnualSalary(nextSalary)
                setAnnualSalaryInput(nextSalary.toString())
              }}
              className="py-1 [&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-[#f0ebd8]/90">
              <span>1</span>
              <span>500k</span>
            </div>
            <p className="text-xs text-[#f0ebd8]/70">Current: £{annualSalaryText}</p>
            {annualSalary > MAX_SLIDER_SALARY ? (
              <p className="text-xs text-[#f0ebd8]/70">
                Slider caps at £500,000 for usability. Manual input still supports up to £999,000,000.
              </p>
            ) : null}
          </Field>

          <Field>
            <FieldHeading
              label="Pension contribution %"
              tooltip="Optional pension deduction percentage from gross pay."
              optional
            />
            <Input
              id="pension"
              type="number"
              step={1}
              min={0}
              max={100}
              value={pensionContributionInput}
              onChange={(event) => handlePensionContributionChange(event.target.value)}
              onBlur={handlePensionContributionBlur}
              className="h-11 border-white/30 bg-white text-[#0d1321]"
            />
          </Field>

          <Field>
            <FieldHeading
              label="Student loan type"
              tooltip="Optional UK student loan plan used for repayment deductions."
              optional
            />
            <Select value={studentLoanType} onValueChange={(value) => setStudentLoanType(value as StudentLoanType)}>
              <SelectTrigger className="h-11 w-full border-white/30 bg-white text-[#0d1321]">
                <SelectValue placeholder="Choose a student loan plan" />
              </SelectTrigger>
              <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)]">
                <SelectItem value="none">No student loan</SelectItem>
                <SelectItem value="plan1">Plan 1</SelectItem>
                <SelectItem value="plan2">Plan 2</SelectItem>
                <SelectItem value="plan4">Plan 4</SelectItem>
                <SelectItem value="plan5">Plan 5</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <div className="pt-1">
            <Button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="group h-12 w-full rounded-xl border border-[#748cab]/50 bg-[#748cab] text-base font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3e5c76] active:translate-y-0 active:bg-[#1d2d44]"
            >
              <CalculatorIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
              {isCalculating ? "Calculating..." : "Calculate Take-Home Pay"}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}