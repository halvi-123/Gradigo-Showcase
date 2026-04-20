"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { MoveOutReadinessFieldErrors, MoveOutReadinessInput } from "@/lib/move-out-readiness/types"
import { CalculatorIcon, CircleHelpIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { moveOutReadinessInputLimits } from "@/lib/move-out-readiness/input-form"
import { useMoveOutReadinessInputForm } from "@/hooks/use-move-out-readiness-input-form"

type MoveOutReadinessInputCardProps = {
  initialInput?: Partial<MoveOutReadinessInput>
  onSubmit: (payload: MoveOutReadinessInput) => Promise<void> | void
  isSubmitting?: boolean
  submitError?: string | null
  validationErrors?: MoveOutReadinessFieldErrors
  onClearSubmitErrors?: () => void
}

function FieldHeading({
  label,
  tooltip,
}: {
  label: string
  tooltip: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <FieldLabel className="text-white">{label}</FieldLabel>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Info about ${label}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-white/80 transition hover:text-white"
          >
            <CircleHelpIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function MoveOutReadinessInputCard({
  initialInput,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  validationErrors,
  onClearSubmitErrors,
}: MoveOutReadinessInputCardProps) {
  const {
    localErrors,
    expenseItems,
    expenseTotal,
    handleAddExpense,
    handleExpenseAmountBlur,
    handleExpenseAmountChange,
    handleExpenseLabelChange,
    handleMonthlyExpensesBlur,
    handleMonthlyExpensesChange,
    handleMonthlyIncomeBlur,
    handleMonthlyIncomeChange,
    handlePostcodeChange,
    handleRemoveExpense,
    handleSubmit,
    isExpenseDialogOpen,
    monthlyExpensesInput,
    monthlyIncomeInput,
    postcode,
    applyExpenseTotal,
    setIsExpenseDialogOpen,
  } = useMoveOutReadinessInputForm({
    initialInput,
    onSubmit,
    onClearSubmitErrors,
    validationErrors,
  })

  const postcodeError = localErrors.postcode
  const monthlyIncomeError = localErrors.monthlyIncome
  const monthlyExpensesError = localErrors.monthlyExpenses

  return (
    <Card className="border-0 bg-[#0d1321] text-white ring-0">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight text-white">Move-Out Inputs</CardTitle>
        <CardDescription className="text-sm text-[#f0ebd8]/85">
          Enter one target UK location with your current monthly budget to calculate readiness.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <FieldGroup className="gap-4">
          <Field>
            <FieldHeading
              label="Target postcode"
              tooltip="Use the area you plan to move to. Example: EH1 1YZ or SW1A 1AA."
            />
            <Input
              id="target-postcode"
              type="text"
              value={postcode}
              onChange={(event) => handlePostcodeChange(event.target.value)}
              className="h-11 border-white/30 bg-white text-[#0d1321]"
              placeholder="e.g. EH1 1YZ"
            />
            <FieldError>{postcodeError}</FieldError>
          </Field>

          <Field>
            <FieldHeading
              label="Monthly salary (GBP)"
              tooltip={`Enter your current monthly take-home salary (after tax).`}
            />
            <Input
              id="monthly-income"
              type="number"
              step={1}
                  min={0}
                  max={moveOutReadinessInputLimits.MONTHLY_AMOUNT_MAX}
              value={monthlyIncomeInput}
              onChange={(event) => handleMonthlyIncomeChange(event.target.value)}
              onBlur={handleMonthlyIncomeBlur}
              className="h-11 border-white/30 bg-white text-[#0d1321]"
            />
            <div className="pt-0.5">
              <Button
                asChild
                type="button"
                variant="ghost"
                className="h-7 px-0 text-xs font-semibold text-[#748cab] hover:bg-transparent hover:text-[#f0ebd8]"
              >
                <Link href="/salary-calculator">Need help calculating monthly salary? Open Salary Calculator</Link>
              </Button>
            </div>
            <FieldError>{monthlyIncomeError}</FieldError>
          </Field>

          <Field>
            <FieldHeading
              label="Monthly expenses average (GBP)"
              tooltip={`Your current recurring spend excluding target rent.`}
            />
            <Input
              id="monthly-expenses"
              type="number"
              step={1}
                  min={0}
                  max={moveOutReadinessInputLimits.MONTHLY_AMOUNT_MAX}
              value={monthlyExpensesInput}
              onChange={(event) => handleMonthlyExpensesChange(event.target.value)}
              onBlur={handleMonthlyExpensesBlur}
              className="h-11 border-white/30 bg-white text-[#0d1321]"
            />

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-0.5 h-7 justify-start px-0 text-xs font-semibold text-[#748cab] hover:bg-transparent hover:text-[#f0ebd8]"
                >
                  Not sure? Build current expenses with categories
                </Button>
              </DialogTrigger>

              <DialogContent
                className="max-w-xl"
                onInteractOutside={(event) => {
                  event.preventDefault()
                }}
                onPointerDownOutside={(event) => {
                  event.preventDefault()
                }}
              >
                <DialogHeader>
                  <DialogTitle>Estimate Monthly Expenses</DialogTitle>
                  <DialogDescription>
                    Add or edit current spending categories, excluding the rent for the target area.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1">
                  {expenseItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_150px_auto] items-end gap-2">
                      <Field>
                        <FieldLabel className="text-xs">Category</FieldLabel>
                        <Input
                          type="text"
                          value={item.label}
                          onChange={(event) => handleExpenseLabelChange(item.id, event.target.value)}
                          placeholder="e.g. Utilities"
                        />
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs">Amount</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          max={moveOutReadinessInputLimits.MONTHLY_AMOUNT_MAX}
                          step={1}
                          value={item.amountInput}
                          onChange={(event) => handleExpenseAmountChange(item.id, event.target.value)}
                          onBlur={() => handleExpenseAmountBlur(item.id)}
                        />
                      </Field>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mb-1"
                        onClick={() => handleRemoveExpense(item.id)}
                        aria-label="Remove expense row"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <span className="font-medium">Estimated monthly total</span>
                  <span className="font-semibold">GBP {new Intl.NumberFormat("en-GB").format(expenseTotal)}</span>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleAddExpense}>
                    <PlusIcon className="h-4 w-4" />
                    Add category
                  </Button>
                  <Button type="button" onClick={applyExpenseTotal}>
                    Apply total
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <FieldError>{monthlyExpensesError}</FieldError>
          </Field>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group h-11 w-full rounded-xl border border-[#748cab]/50 bg-[#748cab] text-base font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#3e5c76] active:translate-y-0 active:bg-[#1d2d44]"
            >
              <CalculatorIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
              {isSubmitting ? "Checking..." : "Ready to Move?"}
            </Button>
            {submitError ? (
              <div
                role="alert"
                className="mt-3 rounded-md border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100"
              >
                {submitError}
              </div>
            ) : null}
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
