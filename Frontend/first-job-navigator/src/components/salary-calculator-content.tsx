"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
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
import { useAuthSessionState } from "@/hooks/use-auth-session-state"
import { calculateSalary, getDefaultSalaryCalculationResult } from "@/lib/salary-calculator/service"
import type { SalaryCalculationInput, SalaryCalculationResult } from "@/lib/salary-calculator/types"
import { SalaryResultsCard } from "@/components/salary-results-card"
import { PayBreakdownTable } from "@/components/pay-breakdown-table"

export function SalaryCalculatorContent() {
  const { isAuthenticated } = useAuthSessionState()
  const [result, setResult] = useState<SalaryCalculationResult>(getDefaultSalaryCalculationResult)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true)
    }, 30)

    return () => clearTimeout(timeout)
  }, [])

  async function handleCalculate(input: SalaryCalculationInput) {
    setIsCalculating(true)
    setCalculationError(null)

    try {
      const nextResult = await calculateSalary(input)
      setResult(nextResult)
    } catch (error) {
      if (error instanceof Error && error.message) {
        setCalculationError(error.message)
      } else {
        setCalculationError("We could not calculate your salary right now. Please try again in a moment.")
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 380ms ease, transform 380ms ease",
            }}
          >
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
                      Gradigo
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

              {!isAuthenticated ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-md px-5 text-sm font-semibold text-primary"
                >
                  <Link href="/login">Login / Signup</Link>
                </Button>
              ) : null}
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="grid gap-4 xl:grid-cols-[minmax(420px,560px)_1fr]">
                <SalaryInputCard
                  onCalculate={handleCalculate}
                  isCalculating={isCalculating}
                  calculationError={calculationError}
                />

                <div className="grid gap-4 content-start">
                  <SalaryResultsCard result={result} />
                  <PayBreakdownTable result={result} />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}