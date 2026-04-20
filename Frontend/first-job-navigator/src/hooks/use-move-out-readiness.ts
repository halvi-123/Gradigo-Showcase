import { useCallback, useEffect, useRef, useState } from "react"
import {
  getSavedMoveOutPlan,
  saveMoveOutPlan,
} from "@/lib/move-out-readiness/service"
import type {
  MoveOutReadinessApiError,
  MoveOutReadinessFieldErrors,
  MoveOutReadinessInput,
  MoveOutReadinessPlan,
} from "@/lib/move-out-readiness/types"

type UseMoveOutReadinessOptions = {
  autoLoad?: boolean
}

export type MoveOutReadinessState = {
  plan: MoveOutReadinessPlan | null
  isInitialLoading: boolean
  isRefreshing: boolean
  isSubmitting: boolean
  isEmpty: boolean
  loadError: string | null
  submitError: string | null
  validationErrors: MoveOutReadinessFieldErrors
}

export type MoveOutReadinessActions = {
  loadSavedPlan: () => Promise<void>
  submitPlan: (input: MoveOutReadinessInput) => Promise<MoveOutReadinessPlan | null>
  clearSubmitErrors: () => void
}

export type UseMoveOutReadinessResult = MoveOutReadinessState & MoveOutReadinessActions

const EMPTY_FIELD_ERRORS: MoveOutReadinessFieldErrors = {}

function normalizePostcodeForCompare(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "")
}

function areAmountsEquivalent(a: number, b: number) {
  return Math.abs(a - b) < 0.01
}

function shouldReuseSavedPlan(
  input: MoveOutReadinessInput,
  plan: MoveOutReadinessPlan | null,
) {
  if (!plan) {
    return false
  }

  return (
    normalizePostcodeForCompare(input.postcode) === normalizePostcodeForCompare(plan.targetPostcode) &&
    areAmountsEquivalent(input.monthlyIncome, plan.monthlyIncome) &&
    areAmountsEquivalent(input.monthlyExpenses, plan.monthlyExpenses)
  )
}

function normalizeError(error: unknown): MoveOutReadinessApiError {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const source = error as MoveOutReadinessApiError

    return {
      message: source.message,
      status: typeof source.status === "number" ? source.status : 0,
      fieldErrors: source.fieldErrors,
    }
  }

  if (error instanceof Error && error.message) {
    return {
      message: error.message,
      status: 0,
    }
  }

  return {
    message: "We could not complete this action. Please try again.",
    status: 0,
  }
}

export function useMoveOutReadiness(
  options: UseMoveOutReadinessOptions = {},
): UseMoveOutReadinessResult {
  const { autoLoad = true } = options

  const [plan, setPlan] = useState<MoveOutReadinessPlan | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(autoLoad)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<MoveOutReadinessFieldErrors>(EMPTY_FIELD_ERRORS)
  const hasLoadedOnceRef = useRef(false)

  const loadSavedPlan = useCallback(async () => {
    setLoadError(null)

    const shouldUseInitialLoader = !hasLoadedOnceRef.current
    if (shouldUseInitialLoader) {
      setIsInitialLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const nextPlan = await getSavedMoveOutPlan()
      if (!nextPlan) {
        setPlan(null)
        setIsEmpty(true)
        setLoadError(null)
      } else {
        setPlan(nextPlan)
        setIsEmpty(false)
      }
    } catch (error) {
      const normalized = normalizeError(error)
      if (normalized.status === 404) {
        setPlan(null)
        setIsEmpty(true)
        setLoadError(null)
      } else {
        setLoadError(normalized.message)
      }
    } finally {
      hasLoadedOnceRef.current = true
      setIsInitialLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  const submitPlan = useCallback(async (input: MoveOutReadinessInput) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setValidationErrors(EMPTY_FIELD_ERRORS)

    try {
      if (shouldReuseSavedPlan(input, plan)) {
        try {
          const savedPlan = await getSavedMoveOutPlan()

          if (savedPlan) {
            setPlan(savedPlan)
            setIsEmpty(false)
            return savedPlan
          }
        } catch {
          if (plan) {
            setPlan(plan)
            setIsEmpty(false)
            return plan
          }
        }
      }

      const nextPlan = await saveMoveOutPlan(input)
      setPlan(nextPlan)
      setIsEmpty(false)
      return nextPlan
    } catch (error) {
      const normalized = normalizeError(error)
      setSubmitError(normalized.message)
      setValidationErrors(normalized.fieldErrors ?? EMPTY_FIELD_ERRORS)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [plan])

  const clearSubmitErrors = useCallback(() => {
    setSubmitError(null)
    setValidationErrors(EMPTY_FIELD_ERRORS)
  }, [])

  useEffect(() => {
    if (!autoLoad) {
      setIsInitialLoading(false)
      return
    }

    void loadSavedPlan()
  }, [autoLoad, loadSavedPlan])

  return {
    plan,
    isInitialLoading,
    isRefreshing,
    isSubmitting,
    isEmpty,
    loadError,
    submitError,
    validationErrors,
    loadSavedPlan,
    submitPlan,
    clearSubmitErrors,
  }
}
