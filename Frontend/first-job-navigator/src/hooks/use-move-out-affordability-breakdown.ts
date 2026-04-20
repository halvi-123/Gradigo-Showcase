import { useMemo } from "react"
import { buildAffordabilityBreakdown } from "@/lib/move-out-readiness/affordability-breakdown"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

export function useMoveOutAffordabilityBreakdown(plan: MoveOutReadinessPlan | null) {
  return useMemo(() => {
    if (!plan) {
      return null
    }

    return buildAffordabilityBreakdown(plan)
  }, [plan])
}
