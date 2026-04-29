import { render, screen, waitFor } from "@testing-library/react"
import { LearningHubContentPage } from "@/components/learning-hub-content-page"

jest.mock("@/lib/learning-hub/service", () => ({
  getArticles: jest.fn().mockResolvedValue([]),
  getVideos: jest.fn().mockResolvedValue([]),
  markArticleComplete: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

describe("LearningHubContentPage", () => {
  it("renders the Articles & Videos heading", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getByText("Articles & Videos")).toBeInTheDocument()
    })
  })

  it("renders the intro paragraph", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getByText(/browse all recommended articles and videos/i)).toBeInTheDocument()
    })
  })

  it("renders the articles section", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getByText("Articles")).toBeInTheDocument()
    })
  })

  it("renders the videos section", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getByText("Videos")).toBeInTheDocument()
    })
  })

  it("renders the sidebar", () => {
    render(<LearningHubContentPage />)
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
  })

  it("renders mock articles when API returns empty", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getAllByText("Understanding Your Payslip").length).toBeGreaterThan(0)
    })
  })

  it("renders mock videos when API returns empty", async () => {
    render(<LearningHubContentPage />)
    await waitFor(() => {
      expect(screen.getByText("How Pensions Work")).toBeInTheDocument()
    })
  })
})