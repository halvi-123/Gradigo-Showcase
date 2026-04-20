"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
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
import { PensionInputCard } from "@/components/pension-input-card"
import { PensionProjectionChart } from "@/components/pension-projection-chart"
import { calculatePension, DEFAULT_PENSION_INPUT } from "@/lib/pension/service"
import type { PensionProjectionInput, PensionProjectionResult } from "@/lib/pension/types"

export function PensionContent() {
  const [result, setResult] = useState<PensionProjectionResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCalculate(input: PensionProjectionInput) {
    setIsCalculating(true)
    setError(null)
    try {
      const nextResult = await calculatePension(input)
      setResult(nextResult)
    } catch {
      setError("Failed to calculate pension projection. Please make sure the backend is running.")
    } finally {
      setIsCalculating(false)
    }
  }

  useEffect(() => {
    handleCalculate(DEFAULT_PENSION_INPUT)
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">First Job Navigator</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Pension</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {error && (
              <div className="rounded-lg bg-red-900/30 border border-red-500/50 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {result && <PensionProjectionChart result={result} />}

            <PensionInputCard
              onCalculate={handleCalculate}
              isCalculating={isCalculating}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}