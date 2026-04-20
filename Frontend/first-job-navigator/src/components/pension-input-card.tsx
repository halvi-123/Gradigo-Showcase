"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CircleHelpIcon } from "lucide-react"
import { DEFAULT_PENSION_INPUT } from "@/lib/pension/service"
import type { PensionProjectionInput } from "@/lib/pension/types"

type Props = {
  onCalculate: (input: PensionProjectionInput) => void
  isCalculating: boolean
}

function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[#f0ebd8]/70">{label}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white/60 hover:text-white"
          >
            <CircleHelpIcon className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function PensionInputCard({ onCalculate, isCalculating }: Props) {
  const [input, setInput] = useState<PensionProjectionInput>(DEFAULT_PENSION_INPUT)

  function updateField<K extends keyof PensionProjectionInput>(
    field: K,
    value: PensionProjectionInput[K]
  ) {
    setInput((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader>
        <CardTitle>Pension Inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#f0ebd8]/70">Current Age</span>
            <span className="text-white font-medium">{input.currentAge}</span>
          </div>
          <Slider
            min={16} max={80} step={1}
            value={[input.currentAge]}
            onValueChange={([v]) => updateField("currentAge", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#f0ebd8]/70">Retirement Age</span>
            <span className="text-white font-medium">{input.retirementAge}</span>
          </div>
          <Slider
            min={55} max={90} step={1}
            value={[input.retirementAge]}
            onValueChange={([v]) => updateField("retirementAge", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#f0ebd8]/70">Current Salary</span>
            <span className="text-white font-medium">£{input.currentSalary.toLocaleString("en-GB")}</span>
          </div>
          <Slider
            min={10000} max={200000} step={1000}
            value={[input.currentSalary]}
            onValueChange={([v]) => updateField("currentSalary", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <FieldLabel
              label="Your Contribution"
              tooltip="The percentage of your salary you contribute to your pension each month. The UK auto-enrolment minimum is 5% of qualifying earnings."
            />
            <span className="text-white font-medium">{input.employeeContributionPercent}%</span>
          </div>
          <Slider
            min={0} max={100} step={0.5}
            value={[input.employeeContributionPercent]}
            onValueChange={([v]) => updateField("employeeContributionPercent", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <FieldLabel
              label="Employer Contribution"
              tooltip="The percentage your employer adds to your pension on top of your own contributions. The UK auto-enrolment minimum for employers is 3%."
            />
            <span className="text-white font-medium">{input.employerContributionPercent}%</span>
          </div>
          <Slider
            min={0} max={20} step={0.5}
            value={[input.employerContributionPercent]}
            onValueChange={([v]) => updateField("employerContributionPercent", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <FieldLabel
              label="Current Pot"
              tooltip="The total amount already saved in your pension pot. If you are just starting out, this will be 0."
            />
            <span className="text-white font-medium">£{input.currentPot.toLocaleString("en-GB")}</span>
          </div>
          <Slider
            min={0} max={500000} step={1000}
            value={[input.currentPot]}
            onValueChange={([v]) => updateField("currentPot", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <FieldLabel
              label="Inflation Rate"
              tooltip="The expected rate of inflation per year. The default is 2.5%, which is the UK government's target rate. This reduces the real value of your pension pot over time."
            />
            <span className="text-white font-medium">{input.inflationRate}%</span>
          </div>
          <Slider
            min={0} max={10} step={0.1}
            value={[input.inflationRate]}
            onValueChange={([v]) => updateField("inflationRate", v)}
            className="[&_[data-slot=slider-range]]:bg-[#748cab] [&_[data-slot=slider-thumb]]:border-[#748cab] [&_[data-slot=slider-track]]:bg-white/25"
          />
        </div>

        <Button
          onClick={() => onCalculate(input)}
          disabled={isCalculating}
          className="w-full h-12 rounded-xl border border-[#748cab]/50 bg-[#748cab] text-base font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3e5c76] active:translate-y-0 active:bg-[#1d2d44]"
        >
          {isCalculating ? "Calculating..." : "Project My Pension"}
        </Button>

      </CardContent>
    </Card>
  )
}