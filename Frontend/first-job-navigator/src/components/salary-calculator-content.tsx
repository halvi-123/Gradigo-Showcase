"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SalaryInputCard } from "@/components/salary-input-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
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
import type { SalaryCalculationInput, SalaryCalculationResult } from "@/lib/salary-calculator/types"
import { SalaryResultsCard } from "@/components/salary-results-card"
import { PayBreakdownTable } from "@/components/pay-breakdown-table"

export function SalaryCalculatorContent() {
  const [result, setResult] = useState<SalaryCalculationResult>(getDefaultSalaryCalculationResult)
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
                    <BreadcrumbPage className="text-primary text-lg font-semibold">
                      Salary Calculator
                    </BreadcrumbPage>
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
              <SalaryInputCard
                onCalculate={handleCalculate}
                isCalculating={isCalculating}
              />

              <div className="grid gap-4 content-start">
                <SalaryResultsCard result={result} />
                <PayBreakdownTable result={result} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}