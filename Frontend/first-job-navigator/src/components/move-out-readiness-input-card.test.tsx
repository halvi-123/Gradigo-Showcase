import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { MoveOutReadinessInputCard } from "@/components/move-out-readiness-input-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { MoveOutReadinessInput } from "@/lib/move-out-readiness/types"

function renderInputCard(props?: Partial<React.ComponentProps<typeof MoveOutReadinessInputCard>>) {
  return render(
    <TooltipProvider>
      <MoveOutReadinessInputCard {...props} />
    </TooltipProvider>,
  )
}

describe("MoveOutReadinessInputCard", () => {
  it("shows local validation errors for required postcode and positive income", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn<Promise<void> | void, [MoveOutReadinessInput]>()

    renderInputCard({ onSubmit })

    await user.click(screen.getByRole("button", { name: /ready to move\?/i }))

    await waitFor(() => {
      expect(screen.getByText("Postcode is required")).toBeInTheDocument()
      expect(screen.getByText("Monthly salary must be greater than zero")).toBeInTheDocument()
    })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("supports add, remove, and apply actions in expense dialog", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn<Promise<void> | void, [MoveOutReadinessInput]>()
    const { container } = renderInputCard({ onSubmit })

    await user.click(
      screen.getByRole("button", { name: /not sure\? build current expenses with categories/i }),
    )

    expect(screen.getByRole("dialog", { name: /estimate monthly expenses/i })).toBeInTheDocument()

    expect(screen.getAllByLabelText("Remove expense row")).toHaveLength(4)

    await user.click(screen.getByRole("button", { name: /add category/i }))
    expect(screen.getAllByLabelText("Remove expense row")).toHaveLength(5)

    const removeButtons = screen.getAllByLabelText("Remove expense row")
    await user.click(removeButtons[0])
    expect(screen.getAllByLabelText("Remove expense row")).toHaveLength(4)

    await user.click(screen.getByRole("button", { name: /apply total/i }))

    const monthlyExpensesInput = container.querySelector("#monthly-expenses") as HTMLInputElement
    expect(monthlyExpensesInput).toHaveValue(580)
  })

  it("calls onClearSubmitErrors when user edits an input", async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn<Promise<void> | void, [MoveOutReadinessInput]>()
    const onClearSubmitErrors = jest.fn()

    const { container } = renderInputCard({
      onSubmit,
      submitError: "Please sign up/login to use this feature.",
      onClearSubmitErrors,
    })

    const postcodeInput = container.querySelector("#target-postcode") as HTMLInputElement
    await user.type(postcodeInput, "EH1 1YZ")

    expect(onClearSubmitErrors).toHaveBeenCalled()
  })
})
