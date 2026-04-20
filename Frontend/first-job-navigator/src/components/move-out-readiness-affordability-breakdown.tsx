"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"
import { useMoveOutAffordabilityBreakdown } from "@/hooks/use-move-out-affordability-breakdown"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalculatorIcon, CircleHelpIcon, InfoIcon } from "lucide-react"
import { formatCurrency, formatSignedCurrency } from "@/lib/move-out-readiness/affordability-breakdown"

type MoveOutReadinessAffordabilityBreakdownProps = {
  plan: MoveOutReadinessPlan | null
}

export function MoveOutReadinessAffordabilityBreakdown({
  plan,
}: MoveOutReadinessAffordabilityBreakdownProps) {
  const breakdown = useMoveOutAffordabilityBreakdown(plan)

  if (!plan) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalculatorIcon className="h-4 w-4" />
            Affordability breakdown
          </CardTitle>
          <CardDescription>
            Submit a plan to see the month-by-month affordability formulas.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!breakdown) {
    return null
  }

  return (
    <Card className="overflow-hidden border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalculatorIcon className="h-4 w-4" />
          Affordability breakdown
        </CardTitle>
        <CardDescription>
          Transparent planning view using known values from your input and API rent estimate.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--chart-3)]/40 bg-[var(--chart-3)] p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-primary-foreground/75">Estimated monthly outgoings</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{formatCurrency(breakdown.totalMonthlyOutgoings)}</p>
            <p className="mt-1 text-xs text-primary-foreground/80">
              This combines API rent plus your own reported monthly outgoings.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--chart-4)]/45 bg-[var(--chart-4)] p-4 text-white">
            <p className="text-xs uppercase tracking-wide text-white/80">Monthly headroom</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatSignedCurrency(breakdown.monthlyHeadroom)}
            </p>
            <p className="mt-1 text-xs text-white/80">
              What remains each month after rent and your outgoings.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--chart-4)]/45 bg-gradient-to-b from-[var(--chart-4)]/14 to-[var(--chart-3)]/10">
          <Table>
            <TableHeader className="bg-[var(--chart-4)]/85 [&_th]:h-9 [&_th]:text-white">
              <TableRow className="border-[var(--chart-4)]/90 hover:bg-[var(--chart-4)]/85">
                <TableHead className="px-3 whitespace-normal">Monthly outgoings</TableHead>
                <TableHead className="px-3 whitespace-normal text-right">Est. monthly</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {breakdown.lines.map((line) => (
                <TableRow key={line.key}>
                  <TableCell className="px-3 py-2.5 align-top whitespace-normal">
                    <div>
                      <p className="font-medium text-foreground">{line.label}</p>
                      <p className="text-xs text-muted-foreground">{line.detail}</p>
                    </div>
                  </TableCell>

                  <TableCell className="px-3 py-2.5 text-right align-top whitespace-normal">
                    <span className="text-base font-semibold text-foreground">{formatCurrency(line.amount)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p className="inline-flex items-center gap-1.5">
            <span>Rent uses API data, and non-rent categories are an estimated split of your own outgoings input.</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Affordability data note" className="inline-flex h-4 w-4 items-center justify-center rounded-full">
                  <CircleHelpIcon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={4}>
                Categories are planning estimates, not provider quotes.
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
