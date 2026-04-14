import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TakeHomePayCard } from "@/components/take-home-pay-card"

describe("TakeHomePayCard", () => {
  it("renders yearly value by default", () => {
    render(<TakeHomePayCard annualTakeHomePay={36000} />)

    expect(screen.getByText(/take home pay/i)).toBeInTheDocument()
    expect(screen.getByText(/display preference only/i)).toBeInTheDocument()
    expect(screen.getByText(/estimated take-home \(yearly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£36,000")).toBeInTheDocument()
  })

  it("switches to monthly, weekly and hourly values", async () => {
    const user = userEvent.setup()
    render(<TakeHomePayCard annualTakeHomePay={36000} />)

    await user.click(screen.getByRole("tab", { name: /monthly/i }))
    expect(screen.getByText(/estimated take-home \(monthly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£3,000")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /weekly/i }))
    expect(screen.getByText(/estimated take-home \(weekly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£692")).toBeInTheDocument()

    await user.click(screen.getByRole("tab", { name: /hourly/i }))
    expect(screen.getByText(/estimated take-home \(hourly\)/i)).toBeInTheDocument()
    expect(screen.getByText("£17")).toBeInTheDocument()
  })

  it("uses a minimum divisor of 1 when hoursPerWeek is zero", async () => {
    const user = userEvent.setup()
    render(<TakeHomePayCard annualTakeHomePay={36000} hoursPerWeek={0} />)

    await user.click(screen.getByRole("tab", { name: /hourly/i }))
    expect(screen.getByText("£692")).toBeInTheDocument()
  })
})
