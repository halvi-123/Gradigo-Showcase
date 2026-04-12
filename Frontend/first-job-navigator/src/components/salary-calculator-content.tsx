"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SalaryInputCard } from "@/components/salary-input-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { calculateSalary, getDefaultSalaryCalculationResult } from "@/lib/salary-calculator/service"
import type { SalaryCalculationInput } from "@/lib/salary-calculator/types"
import { SalaryResultsCard } from "@/components/salary-results-card"

export function SalaryCalculatorContent() {
  const [result, setResult] = useState(getDefaultSalaryCalculationResult)
  const [isCalculating, setIsCalculating] = useState(false)

  async function handleCalculate(input: SalaryCalculationInput) {
    setIsCalculating(true)
    try {
      const nextResult = await calculateSalary(input)
      setResult(nextResult)
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                      First Job Navigator
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Salary Calculator</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <Button variant="outline" className="h-10 rounded-md px-5 text-sm font-semibold text-primary">
              Login / Signup
            </Button>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 xl:grid-cols-[minmax(420px,560px)_1fr]">
              <SalaryInputCard onCalculate={handleCalculate} isCalculating={isCalculating} />

              <div className="grid gap-4 content-start">
                <SalaryResultsCard result={result} />

                <Card className="border border-border/60 bg-transparent shadow-none">
                  <CardHeader>
                    <CardTitle>Disposable Income Tracker (Uses random expense values or user-defined inputs)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-56 rounded-xl border border-dashed border-border/70" />
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border border-border/60 bg-transparent shadow-none">
              <CardHeader>
                <CardTitle>Pay Breakdown Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Gross Annual Salary: £{result.grossAnnualSalary.toLocaleString("en-GB")}</p>
                  <p>Total Deductions: £{result.totalDeductions.toLocaleString("en-GB")}</p>
                  <p>Income Tax: £{result.incomeTax.toLocaleString("en-GB")}</p>
                  <p>National Insurance: £{result.nationalInsurance.toLocaleString("en-GB")}</p>
                  <p>Pension: £{result.pensionContribution.toLocaleString("en-GB")}</p>
                  <p>Student Loan: £{result.studentLoanRepayment.toLocaleString("en-GB")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
