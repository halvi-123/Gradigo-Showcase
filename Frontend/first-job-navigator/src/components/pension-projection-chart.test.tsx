import { render, screen } from "@testing-library/react"
import { PensionProjectionChart } from "@/components/pension-projection-chart"
import type { PensionProjectionResult } from "@/lib/pension/types"

jest.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: ({ content }: { content?: () => React.ReactNode }) => <div data-testid="legend">{content?.()}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}))

function buildResult(overrides?: Partial<PensionProjectionResult>): PensionProjectionResult {
  const yearlyBreakdown = [
    { year: 2024, age: 22, pot_value: 0 },
    { year: 2025, age: 23, pot_value: 1800 },
    { year: 2069, age: 67, pot_value: 121000 },
  ]

  return {
    current_age: 22,
    retirement_age: 67,
    years_to_retirement: 45,
    annual_employee_contribution: 1500,
    annual_employer_contribution: 900,
    total_annual_contribution: 2400,
    inflation_rate: 2.5,
    projections: {
      low: {
        growth_rate_percent: 3,
        real_growth_rate_percent: 0.5,
        projected_pot: 121000,
        yearly_breakdown: yearlyBreakdown,
      },
      mid: {
        growth_rate_percent: 5,
        real_growth_rate_percent: 2.5,
        projected_pot: 197000,
        yearly_breakdown: yearlyBreakdown,
      },
      high: {
        growth_rate_percent: 7,
        real_growth_rate_percent: 4.5,
        projected_pot: 337000,
        yearly_breakdown: yearlyBreakdown,
      },
    },
    ...overrides,
  }
}

describe("PensionProjectionChart", () => {
  it("renders the chart title and subtitle", () => {
    render(<PensionProjectionChart result={buildResult()} />)

    expect(screen.getByText(/pension projection/i)).toBeInTheDocument()
    expect(screen.getByText(/projected pot value at retirement age 67/i)).toBeInTheDocument()
  })

  it("renders the three scenario summary cards", () => {
    render(<PensionProjectionChart result={buildResult()} />)

    expect(screen.getAllByText("Low (3%)").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Mid (5%)").length).toBeGreaterThan(0)
    expect(screen.getAllByText("High (7%)").length).toBeGreaterThan(0)
  })

  it("displays formatted projected pot values", () => {
    render(<PensionProjectionChart result={buildResult()} />)

    expect(screen.getByText("£121k")).toBeInTheDocument()
    expect(screen.getByText("£197k")).toBeInTheDocument()
    expect(screen.getByText("£337k")).toBeInTheDocument()
  })

  it("renders the legend with correct scenario labels", () => {
    render(<PensionProjectionChart result={buildResult()} />)

    expect(screen.getAllByText("High (7%)").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Mid (5%)").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Low (3%)").length).toBeGreaterThan(0)
  })

  it("renders the line chart", () => {
    render(<PensionProjectionChart result={buildResult()} />)

    expect(screen.getByTestId("line-chart")).toBeInTheDocument()
  })
})