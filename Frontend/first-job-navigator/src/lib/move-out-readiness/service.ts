import { getApiBaseUrl } from "@/lib/api/base-url"
import { buildBearerAuthHeaders } from "@/lib/auth/session"
import type {
  MoveOutCrimeLevel,
  MoveOutReadinessApiError,
  MoveOutReadinessApiRequest,
  MoveOutReadinessApiResponse,
  MoveOutReadinessFieldErrors,
  MoveOutReadinessInput,
  MoveOutReadinessPlan,
  MoveOutReadinessStatus,
} from "@/lib/move-out-readiness/types"

const MOVE_OUT_CHECK_PATH = "/api/moveout/check/"
const MOVE_OUT_GET_TIMEOUT_MS = 15_000
const MOVE_OUT_POST_TIMEOUT_MS = 90_000

const statusLabelMap: Record<MoveOutReadinessStatus, string> = {
  ready: "Ready",
  borderline: "Borderline",
  needs_improvement: "Needs Improvement",
  not_ready: "Not Ready",
}

const statusToneMap: Record<MoveOutReadinessStatus, MoveOutReadinessPlan["statusTone"]> = {
  ready: "success",
  borderline: "warning",
  needs_improvement: "critical",
  not_ready: "critical",
}

const crimeSeverityMap: Record<MoveOutCrimeLevel, MoveOutReadinessPlan["crimeSeverity"]> = {
  "Very Low": 1,
  Low: 2,
  Moderate: 3,
  High: 4,
  "Very High": 5,
  Unknown: 0,
}

function asMoveOutStatus(value: string): MoveOutReadinessStatus {
  switch (value) {
    case "ready":
    case "borderline":
    case "needs_improvement":
    case "not_ready":
      return value
    default:
      return "not_ready"
  }
}

function asCrimeLevel(value: string): MoveOutCrimeLevel {
  switch (value) {
    case "Very Low":
    case "Low":
    case "Moderate":
    case "High":
    case "Very High":
    case "Unknown":
      return value
    default:
      return "Unknown"
  }
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function toApiRequest(input: MoveOutReadinessInput): MoveOutReadinessApiRequest {
  return {
    postcode: input.postcode.trim().toUpperCase(),
    monthly_income: Math.max(0, input.monthlyIncome),
    monthly_expenses: Math.max(0, input.monthlyExpenses),
  }
}

function getAffordabilityBand(rentRatioPercent: number): MoveOutReadinessPlan["affordabilityBand"] {
  if (rentRatioPercent <= 30) {
    return "comfortable"
  }

  if (rentRatioPercent <= 40) {
    return "stretched"
  }

  return "high-risk"
}

function fromApiResponse(payload: MoveOutReadinessApiResponse): MoveOutReadinessPlan {
  const status = asMoveOutStatus(payload.status)
  const crimeLevel = asCrimeLevel(payload.crime_level)
  const crimeSeverity = crimeSeverityMap[crimeLevel]
  const rentRatioPercent = toNumber(payload.rent_ratio_percent)

  return {
    id: payload.id,
    targetPostcode: payload.target_postcode,
    areaName: payload.area_name,
    monthlyIncome: toNumber(payload.monthly_income),
    monthlyExpenses: toNumber(payload.monthly_expenses),
    estimatedMonthlyRent: toNumber(payload.estimated_monthly_rent),
    disposableIncome: toNumber(payload.disposable_income),
    rentRatioPercent,
    readinessScore: payload.readiness_score,
    status,
    statusLabel: statusLabelMap[status],
    statusTone: statusToneMap[status],
    crimeLevel,
    crimeSeverity,
    crimeIntensity: crimeSeverity / 5,
    affordabilityBand: getAffordabilityBand(rentRatioPercent),
    propertyListings: payload.property_listings.map((listing) => ({
      listingId: listing.listing_id == null ? null : String(listing.listing_id),
      displayAddress: listing.display_address ?? "",
      latestPrice: listing.latest_price == null ? null : toNumber(listing.latest_price),
      displayPrice: listing.display_price ?? null,
      bedrooms: listing.bedrooms ?? null,
      bathrooms: listing.bathrooms ?? null,
      propertyType: listing.property_type ?? null,
      propertySubType: listing.property_sub_type ?? null,
      agent: listing.agent ?? null,
      agentBranch: listing.agent_branch ?? null,
      addedDate: listing.added_date ?? null,
      imageUrl: listing.image_url ?? null,
      listingUrl: listing.listing_url ?? null,
      source: listing.source ?? null,
    })),
    summary: payload.summary,
    updatedAt: payload.updated_at,
  }
}

function getErrorMessageByStatus(status: number): string {
  if (status === 400) {
    return "Please review the form and correct any issues."
  }

  if (status === 401 || status === 403) {
    return "Please log in to manage your move-out readiness plan."
  }

  if (status >= 500) {
    return "The service is temporarily unavailable. Please try again shortly."
  }

  return "We could not complete the request right now. Please try again."
}

function joinErrorMessages(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  if (Array.isArray(value)) {
    const joined = value
      .filter((item): item is string => typeof item === "string")
      .join(" ")
      .trim()

    return joined || null
  }

  return null
}

function parseFieldErrors(payload: unknown): MoveOutReadinessFieldErrors | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined
  }

  const errors = payload as Record<string, unknown>

  const fieldErrors: MoveOutReadinessFieldErrors = {
    postcode: joinErrorMessages(errors.postcode) ?? undefined,
    monthlyIncome: joinErrorMessages(errors.monthly_income) ?? undefined,
    monthlyExpenses: joinErrorMessages(errors.monthly_expenses) ?? undefined,
  }

  if (!fieldErrors.postcode && !fieldErrors.monthlyIncome && !fieldErrors.monthlyExpenses) {
    return undefined
  }

  return fieldErrors
}

async function parseErrorPayload(response: Response): Promise<MoveOutReadinessApiError> {
  const fallbackMessage = getErrorMessageByStatus(response.status)

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {}

  const maybeDetail =
    payload && typeof payload === "object"
      ? joinErrorMessages((payload as Record<string, unknown>).detail)
      : null

  return {
    status: response.status,
    message: maybeDetail ?? fallbackMessage,
    fieldErrors: parseFieldErrors(payload),
  }
}

async function requestMoveOutPlan(
  method: "GET" | "POST",
  input?: MoveOutReadinessInput,
): Promise<MoveOutReadinessPlan | null> {
  const controller = new AbortController()
  const timeoutMs = method === "GET" ? MOVE_OUT_GET_TIMEOUT_MS : MOVE_OUT_POST_TIMEOUT_MS
  const timeoutId: ReturnType<typeof setTimeout> = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  try {
    const response = await fetch(`${getApiBaseUrl()}${MOVE_OUT_CHECK_PATH}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...buildBearerAuthHeaders(),
      },
      body: input ? JSON.stringify(toApiRequest(input)) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw await parseErrorPayload(response)
    }

    if (method === "GET" && response.status === 204) {
      return null
    }

    const payload = (await response.json()) as MoveOutReadinessApiResponse
    return fromApiResponse(payload)
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw {
        status: 408,
        message: "This request is taking longer than expected. Please try again.",
      } satisfies MoveOutReadinessApiError
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      "message" in error
    ) {
      throw error
    }

    throw {
      status: 0,
      message: "We could not connect right now. Please check your internet and try again.",
    } satisfies MoveOutReadinessApiError
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getSavedMoveOutPlan(): Promise<MoveOutReadinessPlan | null> {
  return requestMoveOutPlan("GET")
}

export async function saveMoveOutPlan(input: MoveOutReadinessInput): Promise<MoveOutReadinessPlan> {
  const plan = await requestMoveOutPlan("POST", input)

  if (!plan) {
    throw {
      status: 500,
      message: "The service returned an empty response. Please try again.",
    } satisfies MoveOutReadinessApiError
  }

  return plan
}
