import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PensionInputCard } from "@/components/pension-input-card"

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
}))

describe("PensionInputCard", () => {
  it("renders the card title", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)
    expect(screen.getByText(/pension inputs/i)).toBeInTheDocument()
  })

  it("renders all input labels", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)

    expect(screen.getByText(/current age/i)).toBeInTheDocument()
    expect(screen.getByText(/retirement age/i)).toBeInTheDocument()
    expect(screen.getByText(/current salary/i)).toBeInTheDocument()
    expect(screen.getByText(/your contribution/i)).toBeInTheDocument()
    expect(screen.getByText(/employer contribution/i)).toBeInTheDocument()
    expect(screen.getByText(/current pot/i)).toBeInTheDocument()
    expect(screen.getByText(/inflation rate/i)).toBeInTheDocument()
  })

  it("renders default values", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)

    expect(screen.getByText("22")).toBeInTheDocument()
    expect(screen.getByText("67")).toBeInTheDocument()
    expect(screen.getByText("£30,000")).toBeInTheDocument()
    expect(screen.getByText("5%")).toBeInTheDocument()
    expect(screen.getByText("3%")).toBeInTheDocument()
    expect(screen.getByText("£0")).toBeInTheDocument()
    expect(screen.getByText("2.5%")).toBeInTheDocument()
  })

  it("renders the calculate button", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)
    expect(screen.getByRole("button", { name: /project my pension/i })).toBeInTheDocument()
  })

  it("shows calculating state when isCalculating is true", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={true} />)
    expect(screen.getByRole("button", { name: /calculating/i })).toBeInTheDocument()
  })

  it("calls onCalculate when button is clicked", async () => {
    const user = userEvent.setup()
    const mockCalculate = jest.fn()
    render(<PensionInputCard onCalculate={mockCalculate} isCalculating={false} />)

    await user.click(screen.getByRole("button", { name: /project my pension/i }))
    expect(mockCalculate).toHaveBeenCalledTimes(1)
  })

  it("renders tooltip content for inflation rate", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)
    expect(screen.getByText(/the expected rate of inflation per year/i)).toBeInTheDocument()
  })

  it("renders tooltip content for employer contribution", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)
    expect(screen.getByText(/the percentage your employer adds/i)).toBeInTheDocument()
  })

  it("renders tooltip content for current pot", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={false} />)
    expect(screen.getByText(/the total amount already saved/i)).toBeInTheDocument()
  })

  it("disables the button when isCalculating is true", () => {
    render(<PensionInputCard onCalculate={jest.fn()} isCalculating={true} />)
    expect(screen.getByRole("button", { name: /calculating/i })).toBeDisabled()
  })
})