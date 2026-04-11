"use client"

import { PieChart, Pie, Cell } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalaryCalculationResult } from "@/lib/salary-calculator/types"

type Props = {
  result: SalaryCalculationResult
}

export function SalaryBreakdownChart({ result }: Props) {
  const total = result.grossAnnualSalary

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

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader>
        <CardTitle>Pay Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}