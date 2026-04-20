import type { ChartConfig } from "@/components/ui/chart"
import type { MoveOutReadinessPlan } from "@/lib/move-out-readiness/types"

export type MetricKey = "disposableIncome" | "estimatedRent" | "rentRatio" | "crimeLevel"

export type MetricCardViewModel = {
  label: string
  value: string
  shell: string
  labelTone: string
  valueTone: string
  detailTitle: string
  detailDescription: string
  detailMethod: string
  detailImpact: string
  shortHint: string
}

export type ReadinessNarrative = {
  headline: string
  tone: string
}

export type ReadinessChartViewModel = {
  config: ChartConfig
  data: Array<{ segment: string; score: number; fill: string }>
  rounded: number
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatBand(value: MoveOutReadinessPlan["affordabilityBand"]) {
  if (value === "high-risk") {
    return "High risk"
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getReadinessNarrative(plan: MoveOutReadinessPlan): ReadinessNarrative {
  const score = Math.round(plan.readinessScore)
  const area = plan.areaName || "this area"

  if (score >= 75) {
    return {
      headline: `You are in a strong position to move to ${area}!`,
      tone: "text-green-700 dark:text-green-400",
    }
  }

  if (score >= 50) {
    return {
      headline: `You could move to ${area}, but budget pressure is building.`,
      tone: "text-amber-700 dark:text-amber-400",
    }
  }

  return {
    headline: `You are not move-ready for ${area} yet.`,
    tone: "text-red-700 dark:text-red-400",
  }
}

export function getBandExplanation(rentRatioPercent: number) {
  if (rentRatioPercent <= 30) {
    return "Comfortable band: rent is within 30% of monthly income."
  }

  if (rentRatioPercent <= 40) {
    return "Stretched band: rent is between 31% and 40%, so monthly cash flow is tighter."
  }

  return "High-risk band: rent is above 40%, which often creates monthly budget stress."
}

export function getReadinessChartViewModel(score: number): ReadinessChartViewModel {
  const rounded = Math.max(0, Math.min(100, Math.round(score)))
  const band = rounded >= 75 ? "good" : rounded >= 50 ? "fair" : "low"

  const config = {
    score: {
      label: "Readiness",
    },
    good: {
      label: "Good",
      color: "var(--chart-2)",
    },
    fair: {
      label: "Fair",
      color: "var(--chart-3)",
    },
    low: {
      label: "Low",
      color: "var(--destructive)",
    },
  } satisfies ChartConfig

  const data = [{ segment: band, score: rounded, fill: `var(--color-${band})` }]

  return { config, data, rounded }
}

export function getMetricCards(plan: MoveOutReadinessPlan) {
  return {
    disposableIncome: {
      label: "Disposable income",
      value: formatCurrency(plan.disposableIncome),
      shell: "border-[var(--primary)] bg-[var(--primary)] text-white",
      labelTone: "text-white/80",
      valueTone: "text-white",
      detailTitle: "Disposable income baseline",
      detailDescription:
        "This shows the money left after covering expected monthly essentials in this area.",
      detailMethod:
        "We compare your monthly income against typical local living costs and your entered spend profile.",
      detailImpact:
        "The more headroom you keep here, the easier it is to handle bills, save, and absorb surprises.",
      shortHint: "Money left after expected monthly essentials.",
    },
    estimatedRent: {
      label: "Estimated rent",
      value: formatCurrency(plan.estimatedMonthlyRent),
      shell: "border-[var(--chart-3)] bg-[var(--chart-3)] text-white",
      labelTone: "text-white/80",
      valueTone: "text-white",
      detailTitle: "Estimated monthly rent",
      detailDescription:
        "This is a realistic monthly rent expectation for homes in your selected area.",
      detailMethod:
        "We estimate this using recent area-level rental pricing patterns for the postcode.",
      detailImpact:
        "If this figure rises, move-out readiness can drop quickly because housing is your largest recurring cost.",
      shortHint: "Typical monthly rent for your selected area.",
    },
    rentRatio: {
      label: "Rent ratio",
      value: `${plan.rentRatioPercent.toFixed(1)}%`,
      shell: "border-[var(--chart-4)] bg-[var(--chart-4)] text-white",
      labelTone: "text-white/85",
      valueTone: "text-white",
      detailTitle: "Rent-to-income ratio",
      detailDescription:
        "This is the share of your monthly income that rent would consume.",
      detailMethod:
        "We calculate it as estimated rent divided by monthly income, then convert it to a percentage.",
      detailImpact:
        `${getBandExplanation(plan.rentRatioPercent)} Lower ratio usually means healthier cash flow each month.`,
      shortHint: "How much of your income would go to rent.",
    },
    crimeLevel: {
      label: "Crime level",
      value: plan.crimeLevel,
      shell: "border-[var(--chart-5)] bg-[var(--chart-5)] text-[var(--chart-1)]",
      labelTone: "text-[var(--chart-1)]/70",
      valueTone: "text-[var(--chart-1)]",
      detailTitle: "Area crime classification",
      detailDescription:
        "This gives a quick safety signal for the area you are evaluating.",
      detailMethod:
        "We use the area classification to keep the safety view simple and comparable across postcodes.",
      detailImpact:
        "It affects day-to-day confidence, travel comfort, and whether an area feels practical long term.",
      shortHint: "Simple safety classification for this area.",
    },
  } satisfies Record<
    MetricKey,
    MetricCardViewModel
  >
}