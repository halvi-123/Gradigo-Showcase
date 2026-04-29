import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubContent } from "@/components/learning-hub-content"

jest.mock("@/lib/auth/session", () => ({
  buildBearerAuthHeaders: jest.fn().mockReturnValue({}),
  getStoredAccessToken: jest.fn().mockReturnValue(null),
}))

jest.mock("@/lib/learning-hub/service", () => ({
  getArticles: jest.fn().mockResolvedValue([]),
  getVideos: jest.fn().mockResolvedValue([]),
  getQuizzesByDifficulty: jest.fn().mockResolvedValue([]),
  getDashboard: jest.fn().mockResolvedValue({
    completed_articles: 0,
    total_articles: 0,
    quizzes_taken: 0,
    average_score: 0,
  }),
  markArticleComplete: jest.fn().mockResolvedValue(undefined),
}))

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe("LearningHubContent", () => {
  it("renders the Learning Hub heading", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText("Learning Hub")).toBeInTheDocument()
    })
  })

  it("renders the intro paragraph", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText(/explore articles, videos and quizzes/i)).toBeInTheDocument()
    })
  })

  it("renders the quiz dashboard", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText("Quiz Dashboard")).toBeInTheDocument()
    })
  })

  it("renders the chatbot", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText("Chatbot")).toBeInTheDocument()
    })
  })

  it("renders the articles section", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText("Recommended Articles")).toBeInTheDocument()
    })
  })

  it("renders the videos section", async () => {
    render(<LearningHubContent />)
    await waitFor(() => {
      expect(screen.getByText("Recommended Videos")).toBeInTheDocument()
    })
  })

  it("shows login dialog when unauthenticated user clicks a quiz", async () => {
    const user = userEvent.setup()
    render(<LearningHubContent />)

    await waitFor(() => {
      expect(screen.getByText("Budgeting Basics")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Budgeting Basics"))

    await waitFor(() => {
      expect(screen.getByText("Login Required")).toBeInTheDocument()
    })
  })

  it("renders the sidebar", () => {
    render(<LearningHubContent />)
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
  })
})