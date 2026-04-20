export type MoveOutReadinessStatus = "ready" | "borderline" | "needs_improvement" | "not_ready"

export type MoveOutCrimeLevel = "Very Low" | "Low" | "Moderate" | "High" | "Very High" | "Unknown"

export type MoveOutPropertyListing = {
  listingId: string | null
  displayAddress: string
  latestPrice: number | null
  displayPrice: string | null
  bedrooms: number | null
  bathrooms: number | null
  propertyType: string | null
  propertySubType: string | null
  agent: string | null
  agentBranch: string | null
  addedDate: string | null
  imageUrl: string | null
  listingUrl: string | null
  source: string | null
}

export type MoveOutReadinessPlan = {
  id: number
  targetPostcode: string
  areaName: string
  monthlyIncome: number
  monthlyExpenses: number
  estimatedMonthlyRent: number
  disposableIncome: number
  rentRatioPercent: number
  readinessScore: number
  status: MoveOutReadinessStatus
  statusLabel: string
  statusTone: "success" | "warning" | "critical" | "neutral"
  crimeLevel: MoveOutCrimeLevel
  crimeSeverity: 0 | 1 | 2 | 3 | 4 | 5
  crimeIntensity: number
  affordabilityBand: "comfortable" | "stretched" | "high-risk"
  propertyListings: MoveOutPropertyListing[]
  summary: string
  updatedAt: string
}

export type MoveOutReadinessInput = {
  postcode: string
  monthlyIncome: number
  monthlyExpenses: number
}

export type MoveOutReadinessApiRequest = {
  postcode: string
  monthly_income: number
  monthly_expenses: number
}

export type MoveOutPropertyListingApi = {
  listing_id?: string | number | null
  display_address?: string | null
  latest_price?: number | string | null
  display_price?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  property_type?: string | null
  property_sub_type?: string | null
  agent?: string | null
  agent_branch?: string | null
  added_date?: string | null
  image_url?: string | null
  listing_url?: string | null
  source?: string | null
}

export type MoveOutReadinessApiResponse = {
  id: number
  target_postcode: string
  area_name: string
  monthly_income: number | string
  monthly_expenses: number | string
  estimated_monthly_rent: number | string
  disposable_income: number | string
  rent_ratio_percent: number | string
  readiness_score: number
  status: string
  crime_level: string
  property_listings: MoveOutPropertyListingApi[]
  summary: string
  updated_at: string
}

export type MoveOutReadinessFieldErrors = Partial<{
  postcode: string
  monthlyIncome: string
  monthlyExpenses: string
}>

export type MoveOutReadinessApiError = {
  message: string
  status: number
  fieldErrors?: MoveOutReadinessFieldErrors
}
