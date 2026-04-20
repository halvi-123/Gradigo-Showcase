import { useMemo, useState } from "react"
import type { MoveOutReadinessFieldErrors, MoveOutReadinessInput } from "@/lib/move-out-readiness/types"
import {
  createDefaultExpenseItems,
  normalizeNumberInput,
  parseClampedAmount,
  type MoveOutReadinessExpenseItem,
} from "@/lib/move-out-readiness/input-form"

type UseMoveOutReadinessInputFormOptions = {
  initialInput?: Partial<MoveOutReadinessInput>
  onSubmit: (payload: MoveOutReadinessInput) => Promise<void> | void
  isSubmitting?: boolean
  validationErrors?: MoveOutReadinessFieldErrors
  onClearSubmitErrors?: () => void
}

export type UseMoveOutReadinessInputFormResult = {
  postcode: string
  monthlyIncomeInput: string
  monthlyExpensesInput: string
  localErrors: MoveOutReadinessFieldErrors
  isExpenseDialogOpen: boolean
  expenseItems: MoveOutReadinessExpenseItem[]
  expenseTotal: number
  handlePostcodeChange: (value: string) => void
  handleMonthlyIncomeChange: (value: string) => void
  handleMonthlyIncomeBlur: () => void
  handleMonthlyExpensesChange: (value: string) => void
  handleMonthlyExpensesBlur: () => void
  handleExpenseLabelChange: (id: string, value: string) => void
  handleExpenseAmountChange: (id: string, value: string) => void
  handleExpenseAmountBlur: (id: string) => void
  handleAddExpense: () => void
  handleRemoveExpense: (id: string) => void
  applyExpenseTotal: () => void
  setIsExpenseDialogOpen: (value: boolean) => void
  handleSubmit: () => Promise<void>
}

export function useMoveOutReadinessInputForm({
  initialInput,
  onSubmit,
  onClearSubmitErrors,
  validationErrors,
}: UseMoveOutReadinessInputFormOptions): UseMoveOutReadinessInputFormResult {
  const [postcode, setPostcode] = useState(initialInput?.postcode ?? "")
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState(
    initialInput?.monthlyIncome != null ? String(initialInput.monthlyIncome) : "",
  )
  const [monthlyExpensesInput, setMonthlyExpensesInput] = useState(
    initialInput?.monthlyExpenses != null ? String(initialInput.monthlyExpenses) : "",
  )
  const [localErrors, setLocalErrors] = useState<MoveOutReadinessFieldErrors>({})
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [expenseItems, setExpenseItems] = useState<MoveOutReadinessExpenseItem[]>(createDefaultExpenseItems)

  const expenseTotal = useMemo(() => {
    return expenseItems.reduce((sum, item) => sum + parseClampedAmount(item.amountInput), 0)
  }, [expenseItems])

  function clearErrors() {
    setLocalErrors({})
    onClearSubmitErrors?.()
  }

  function handlePostcodeChange(value: string) {
    clearErrors()
    setPostcode(value.toUpperCase())
  }

  function handleMonthlyIncomeChange(value: string) {
    clearErrors()
    setMonthlyIncomeInput(normalizeNumberInput(value))
  }

  function handleMonthlyIncomeBlur() {
    const amount = parseClampedAmount(monthlyIncomeInput)
    setMonthlyIncomeInput(String(amount))
  }

  function handleMonthlyExpensesChange(value: string) {
    clearErrors()
    setMonthlyExpensesInput(normalizeNumberInput(value))
  }

  function handleMonthlyExpensesBlur() {
    const amount = parseClampedAmount(monthlyExpensesInput)
    setMonthlyExpensesInput(String(amount))
  }

  function handleExpenseLabelChange(id: string, value: string) {
    setExpenseItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, label: value } : item)),
    )
  }

  function handleExpenseAmountChange(id: string, value: string) {
    setExpenseItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              amountInput: normalizeNumberInput(value),
            }
          : item,
      ),
    )
  }

  function handleExpenseAmountBlur(id: string) {
    setExpenseItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              amountInput: String(parseClampedAmount(item.amountInput)),
            }
          : item,
      ),
    )
  }

  function handleAddExpense() {
    setExpenseItems((previous) => [
      ...previous,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: "",
        amountInput: "0",
      },
    ])
  }

  function handleRemoveExpense(id: string) {
    setExpenseItems((previous) => previous.filter((item) => item.id !== id))
  }

  function applyExpenseTotal() {
    setMonthlyExpensesInput(String(expenseTotal))
    setIsExpenseDialogOpen(false)
    clearErrors()
  }

  async function handleSubmit() {
    const trimmedPostcode = postcode.trim().toUpperCase()
    const monthlyIncome = parseClampedAmount(monthlyIncomeInput)
    const monthlyExpenses = parseClampedAmount(monthlyExpensesInput)

    const nextLocalErrors: MoveOutReadinessFieldErrors = {}

    if (!trimmedPostcode) {
      nextLocalErrors.postcode = "Postcode is required"
    }

    if (monthlyIncome <= 0) {
      nextLocalErrors.monthlyIncome = "Monthly salary must be greater than zero"
    }

    if (monthlyExpenses < 0) {
      nextLocalErrors.monthlyExpenses = "Monthly expenses cannot be negative"
    }

    if (Object.keys(nextLocalErrors).length > 0) {
      setLocalErrors(nextLocalErrors)
      return
    }

    setLocalErrors({})

    await onSubmit({
      postcode: trimmedPostcode,
      monthlyIncome,
      monthlyExpenses,
    })
  }

  const resolvedLocalErrors = {
    postcode: localErrors.postcode ?? validationErrors?.postcode,
    monthlyIncome: localErrors.monthlyIncome ?? validationErrors?.monthlyIncome,
    monthlyExpenses: localErrors.monthlyExpenses ?? validationErrors?.monthlyExpenses,
  }

  return {
    postcode,
    monthlyIncomeInput,
    monthlyExpensesInput,
    localErrors: resolvedLocalErrors,
    isExpenseDialogOpen,
    expenseItems,
    expenseTotal,
    handlePostcodeChange,
    handleMonthlyIncomeChange,
    handleMonthlyIncomeBlur,
    handleMonthlyExpensesChange,
    handleMonthlyExpensesBlur,
    handleExpenseLabelChange,
    handleExpenseAmountChange,
    handleExpenseAmountBlur,
    handleAddExpense,
    handleRemoveExpense,
    applyExpenseTotal,
    setIsExpenseDialogOpen,
    handleSubmit,
  }
}