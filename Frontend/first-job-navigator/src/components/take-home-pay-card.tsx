"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PayFrequency = "hourly" | "weekly" | "monthly" | "yearly"

type TakeHomePayCardProps = {
  annualTakeHomePay: number
  hoursPerWeek?: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function TakeHomePayCard({
  annualTakeHomePay,
  hoursPerWeek = 40,
}: TakeHomePayCardProps) {
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("yearly")

  const displayValue = useMemo(() => {
    if (payFrequency === "yearly") return annualTakeHomePay
    if (payFrequency === "monthly") return annualTakeHomePay / 12
    if (payFrequency === "weekly") return annualTakeHomePay / 52
    return annualTakeHomePay / (52 * Math.max(1, hoursPerWeek))
  }, [annualTakeHomePay, payFrequency, hoursPerWeek])

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader className="space-y-3">
        <CardTitle>Take Home Pay</CardTitle>
        <CardDescription>
          Display preference only. API should return annual net pay.
        </CardDescription>
        <Tabs value={payFrequency} onValueChange={(value) => setPayFrequency(value as PayFrequency)}>
          <TabsList className="h-9 bg-[#1d2d44] p-1">
            <TabsTrigger value="hourly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
              Hourly
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">
              Yearly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
        <CardContent>
        <p className="text-sm text-[#f0ebd8]/70">Estimated take-home ({payFrequency})</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-white">{formatCurrency(displayValue)}</p>
        <p className="mt-4 text-xs text-[#f0ebd8]/70">
          Currently powered by mock service data. I will wire API response data here from backend once whole feature is ready.
        </p>
      </CardContent>
    </Card>
  )
}
