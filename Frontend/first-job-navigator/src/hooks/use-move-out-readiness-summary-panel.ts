import { useMemo, useState } from "react"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"
import {
  getMetricCards,
  getReadinessChartViewModel,
  getReadinessNarrative,
  type MetricKey,
} from "@/lib/move-out-readiness/summary-panel"

type UseMoveOutReadinessSummaryPanelArgs = {
  plan: MoveOutReadinessPlan | null
}

export function useMoveOutReadinessSummaryPanel({ plan }: UseMoveOutReadinessSummaryPanelArgs) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("disposableIncome")

  const readinessChart = useMemo(() => {
    if (!plan) {
      return null
    }

    return getReadinessChartViewModel(plan.readinessScore)
  }, [plan])

  const readinessNarrative = useMemo(() => {
    if (!plan) {
      return null
    }

    return getReadinessNarrative(plan)
  }, [plan])

  const metricCards = useMemo(() => {
    if (!plan) {
      return null
    }

    return getMetricCards(plan)
  }, [plan])

  const metricOrder = useMemo<MetricKey[]>(() => {
    return ["disposableIncome", "estimatedRent", "rentRatio", "crimeLevel"]
  }, [])

  const selectedMetricCard = metricCards ? metricCards[selectedMetric] : null

  return {
    metricOrder,
    metricCards,
    readinessChart,
    readinessNarrative,
    selectedMetric,
    selectedMetricCard,
    setSelectedMetric,
  }
}