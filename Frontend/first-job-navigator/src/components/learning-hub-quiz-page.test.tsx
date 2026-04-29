import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubQuizPage } from "@/components/learning-hub-quiz-page"

jest.mock("@/lib/learning-hub/service", () => ({
  getQuizzesByDifficulty: jest.fn().mockResolvedValue([]),
  submitQuiz: jest.fn().mockResolvedValue({ score: 80, passed: true }),
}))

jest.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}))

describe("LearningHubQuizPage", () => {
  it("renders loading state initially", () => {
    render(<LearningHubQuizPage quizId={999} />)
    expect(screen.getByText(/loading quiz/i)).toBeInTheDocument()
  })

  it("renders quiz title from mock data", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getAllByText("Budgeting Basics").length).toBeGreaterThan(0)
    })
  })

  it("renders questions from mock data", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getByText(/what is a budget/i)).toBeInTheDocument()
    })
  })

  it("renders Quit Quiz button", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /quit quiz/i })).toBeInTheDocument()
    })
  })

  it("renders Next Page button on first page", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /next page/i })).toBeInTheDocument()
    })
  })

  it("renders Prev Page button disabled on first page", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /prev page/i })).toBeDisabled()
    })
  })

  it("submit button is disabled when not all questions are answered", async () => {
    const user = userEvent.setup()
    render(<LearningHubQuizPage quizId={2} />)
    await waitFor(() => {
      expect(screen.getAllByText("UK Tax Knowledge").length).toBeGreaterThan(0)
    })
    await user.click(screen.getByRole("button", { name: /next page/i }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled()
    })
  })

  it("renders the sidebar", async () => {
    render(<LearningHubQuizPage quizId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId("app-sidebar")).toBeInTheDocument()
    })
  })
})