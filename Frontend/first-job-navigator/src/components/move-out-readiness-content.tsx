"use client"

import Link from "next/link"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { MoveOutReadinessAffordabilityBreakdown } from "@/components/move-out-readiness-affordability-breakdown"
import { MoveOutReadinessInputCard } from "@/components/move-out-readiness-input-card"
import { MoveOutReadinessMapCard } from "@/components/move-out-readiness-map-card"
import { MoveOutReadinessPropertyListings } from "@/components/move-out-readiness-property-listings"
import { MoveOutReadinessSummaryPanel } from "./move-out-readiness-summary-panel"
import { useMoveOutReadiness } from "@/hooks/use-move-out-readiness"
import { useAuthSessionState } from "@/hooks/use-auth-session-state"
import type { MoveOutReadinessInput } from "@/lib/move-out-readiness/types"

export function MoveOutReadinessContent() {
  const { isAuthenticated } = useAuthSessionState()
  const [authSubmitError, setAuthSubmitError] = useState<string | null>(null)
  const {
    plan,
    isInitialLoading,
    isRefreshing,
    isSubmitting,
    loadError,
    submitError,
    validationErrors,
    submitPlan,
    clearSubmitErrors,
  } = useMoveOutReadiness()

  async function handleSubmit(payload: MoveOutReadinessInput) {
    if (!isAuthenticated) {
      setAuthSubmitError("Please sign up/login to use this feature.")
      return
    }

    setAuthSubmitError(null)
    await submitPlan(payload)
  }

  function handleClearSubmitErrors() {
    setAuthSubmitError(null)
    clearSubmitErrors()
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
                      Move-Out Readiness
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {!isAuthenticated ? (
              <Button asChild variant="outline" className="h-10 rounded-md px-5 text-sm font-semibold text-primary">
                <Link href="/login">Login / Signup</Link>
              </Button>
            ) : null}
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
              <div className="flex flex-col gap-4">
                <MoveOutReadinessInputCard
                  key={plan ? `${plan.id}-${plan.updatedAt}` : "move-out-new-plan"}
                  initialInput={
                    plan
                      ? {
                          postcode: plan.targetPostcode,
                          monthlyIncome: plan.monthlyIncome,
                          monthlyExpenses: plan.monthlyExpenses,
                        }
                      : undefined
                  }
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  submitError={authSubmitError ?? submitError}
                  validationErrors={validationErrors}
                  onClearSubmitErrors={handleClearSubmitErrors}
                />

                <MoveOutReadinessSummaryPanel plan={plan} loadError={loadError} />
              </div>

              <div className="flex flex-col gap-4">
                <MoveOutReadinessMapCard
                  plan={plan}
                  isInitialLoading={isInitialLoading}
                  loadError={loadError}
                />

                <MoveOutReadinessAffordabilityBreakdown plan={plan} />
              </div>
            </div>

            <MoveOutReadinessPropertyListings
              listings={plan?.propertyListings ?? []}
              isLoading={isInitialLoading || isRefreshing}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
