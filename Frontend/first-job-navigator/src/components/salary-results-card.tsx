"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CircleHelpIcon } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SalaryCalculationResult } from "@/lib/salary-calculator/types"

type PayFrequency = "hourly" | "weekly" | "monthly" | "yearly"

type Props = {
  result: SalaryCalculationResult
  hoursPerWeek?: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function SalaryResultsCard({ result, hoursPerWeek = 40 }: Props) {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("monthly")
  const total = result.grossAnnualSalary

  const displayValue = useMemo(() => {
    if (payFrequency === "yearly") return result.netAnnualPay
    if (payFrequency === "monthly") return result.netAnnualPay / 12
    if (payFrequency === "weekly") return result.netAnnualPay / 52
    return result.netAnnualPay / (52 * Math.max(1, hoursPerWeek))
  }, [result.netAnnualPay, payFrequency, hoursPerWeek])

  const data = [
    { name: "takeHome", value: result.netAnnualPay },
    { name: "incomeTax", value: result.incomeTax },
    { name: "nationalInsurance", value: result.nationalInsurance },
    { name: "pension", value: result.pensionContribution },
    { name: "studentLoan", value: result.studentLoanRepayment },
  ].filter((item) => item.value > 0)

  const chartConfig = {
    takeHome: { label: `Take Home (${Math.round((result.netAnnualPay / total) * 100)}%)`, color: "#f0ebd8" },
    incomeTax: { label: `Income Tax (${Math.round((result.incomeTax / total) * 100)}%)`, color: "#1d2d44" },
    nationalInsurance: { label: `NI (${Math.round((result.nationalInsurance / total) * 100)}%)`, color: "#3e5c76" },
    pension: { label: `Pension (${Math.round((result.pensionContribution / total) * 100)}%)`, color: "#748cab" },
    studentLoan: { label: `Student Loan (${Math.round((result.studentLoanRepayment / total) * 100)}%)`, color: "#0d1321" },
  }

  const Legend = ({ horizontal = false }: { horizontal?: boolean }) => (
    <div className={`pt-4 ${horizontal ? "flex flex-wrap gap-x-4 gap-y-1" : "space-y-1"}`}>
      {data.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs text-[#f0ebd8]/70">
          <div
            className="h-2 w-2 rounded-sm shrink-0"
            style={{ backgroundColor: chartConfig[entry.name as keyof typeof chartConfig]?.color }}
          />
          <span>{chartConfig[entry.name as keyof typeof chartConfig]?.label}</span>
        </div>
      ))}
    </div>
  )

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader>
        <CardTitle>Take Home Pay</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2">

          {/* Left: Take Home Pay */}
          <div className="flex flex-col space-y-3">
            <Tabs value={payFrequency} onValueChange={(v) => setPayFrequency(v as PayFrequency)}>
              <TabsList className="h-9 bg-[#1d2d44] p-1">
                <TabsTrigger value="hourly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Hourly</TabsTrigger>
                <TabsTrigger value="weekly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Weekly</TabsTrigger>
                <TabsTrigger value="monthly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Monthly</TabsTrigger>
                <TabsTrigger value="yearly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-[#f0ebd8]/70">Estimated take-home ({payFrequency})</p>
            <p className="text-4xl font-bold tracking-tight text-white">{formatCurrency(displayValue)}</p>
            <p className="text-xs text-[#f0ebd8]/50">Currently powered by mock service data.</p>
            <div className="hidden md:block mt-auto">
              <Legend />
            </div>
          </div>

          {/* Right: Pie Chart */}
          <div className="overflow-visible">
            <ChartContainer config={chartConfig} className="h-[200px] md:h-[250px] w-full mx-auto">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name">
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={chartConfig[entry.name as keyof typeof chartConfig]?.color}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            <div className="block md:hidden">
              <Legend horizontal />
            </div>
          </div>

        </div>

        {/* Allowance Meter */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-[#f0ebd8]/70">Personal Allowance Used</span>
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
                  Your personal allowance is the amount you can earn before paying income tax. The standard allowance is £12,570.
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-white font-medium">
              {Math.min(Math.round((result.grossAnnualSalary / 12570) * 100), 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-[#748cab] transition-all duration-300"
              style={{ width: `${Math.min((result.grossAnnualSalary / 12570) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[#f0ebd8]/50">Standard personal allowance: £12,570</p>
        </div>
      </CardContent>
    </Card>
  )
}