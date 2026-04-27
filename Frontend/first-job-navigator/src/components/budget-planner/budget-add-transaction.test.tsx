import { render, screen, waitFor, within, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AddTransactionDialog } from "@/components/budget-planner/budget-add-transaction"
import type { CategoryBreakdown } from "@/lib/budget-planner/types"

const mockCategories: CategoryBreakdown[] = [
  { id: 1, category_name: "Rent", spent_amount: 500, limit_amount: 600, percentage: 62.5 },
  { id: 2, category_name: "Food", spent_amount: 200, limit_amount: 300, percentage: 25 },
]

async function openDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /\+ log transaction/i }))
  return screen.getByRole("dialog")
}

describe("AddTransactionDialog — Add mode", () => {
  it("opens dialog when Log Transaction button is clicked", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    await user.click(screen.getByRole("button", { name: /\+ log transaction/i }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("shows error when name is empty on submit", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    fireEvent.click(within(dialog).getByRole("button", { name: /log transaction/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/please enter a transaction name/i)).toBeInTheDocument()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("shows error when amount is zero", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByPlaceholderText(/tesco shop/i), "Test")
    await user.type(within(dialog).getByPlaceholderText(/0.00/i), "0")
    fireEvent.click(within(dialog).getByRole("button", { name: /log transaction/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/must be greater than £0/i)).toBeInTheDocument()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("shows error when no category is selected", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByPlaceholderText(/tesco shop/i), "Test")
    await user.type(within(dialog).getByPlaceholderText(/0.00/i), "50")
    fireEvent.click(within(dialog).getByRole("button", { name: /log transaction/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/please select a category/i)).toBeInTheDocument()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("calls onAdd with correct values when form is valid", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn().mockResolvedValue(undefined)
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByPlaceholderText(/tesco shop/i), "Groceries run")
    await user.type(within(dialog).getByPlaceholderText(/0.00/i), "45.50")
    await user.selectOptions(within(dialog).getByRole("combobox"), "1")
    fireEvent.click(within(dialog).getByRole("button", { name: /log transaction/i }))

    await waitFor(() => {
      expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({
        name: "Groceries run",
        amount: 45.50,
        category_id: 1,
      }))
    })
  })

  it("shows hint about adding categories in Spending tab", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    expect(within(dialog).getByText(/need a different category/i)).toBeInTheDocument()
  })

  it("shows error for future date", async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(<AddTransactionDialog mode="add" categories={mockCategories} onAdd={onAdd} />)

    const dialog = await openDialog(user)
    await user.type(within(dialog).getByPlaceholderText(/tesco shop/i), "Test")
    await user.type(within(dialog).getByPlaceholderText(/0.00/i), "50")
    await user.selectOptions(within(dialog).getByRole("combobox"), "1")

    const dateInput = within(dialog).getByDisplayValue(new Date().toISOString().split("T")[0])
    fireEvent.change(dateInput, { target: { value: "9999-12-31" } })

    fireEvent.click(within(dialog).getByRole("button", { name: /log transaction/i }))

    await waitFor(() => {
      expect(within(dialog).getByText(/must be today or in the past/i)).toBeInTheDocument()
    })
    expect(onAdd).not.toHaveBeenCalled()
  })
})

describe("AddTransactionDialog — Edit mode", () => {
  const mockTransaction = {
    id: 1,
    name: "Old name",
    amount: 100,
    date: "2026-04-01",
    category_id: 1,
    category_name: "Rent",
  }

  it("shows Edit trigger button in edit mode", () => {
    const onEdit = jest.fn()
    render(<AddTransactionDialog mode="edit" categories={mockCategories} transaction={mockTransaction} onEdit={onEdit} />)
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument()
  })

  it("pre-fills form with existing transaction data", async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    render(<AddTransactionDialog mode="edit" categories={mockCategories} transaction={mockTransaction} onEdit={onEdit} />)

    await user.click(screen.getByRole("button", { name: /^edit$/i }))
    const dialog = screen.getByRole("dialog")

    await waitFor(() => {
      expect(within(dialog).getByDisplayValue("Old name")).toBeInTheDocument()
      expect(within(dialog).getByDisplayValue("100")).toBeInTheDocument()
    })
  })

  it("does not show category hint in edit mode", async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    render(<AddTransactionDialog mode="edit" categories={mockCategories} transaction={mockTransaction} onEdit={onEdit} />)

    await user.click(screen.getByRole("button", { name: /^edit$/i }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).queryByText(/need a different category/i)).not.toBeInTheDocument()
  })
})