import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubQuizDashboard } from "@/components/learning-hub-quiz-dashboard"
import type { Quiz, LearningDashboard } from "@/lib/learning-hub/types"

const mockDashboard: LearningDashboard = {
  completed_articles: 2,
  total_articles: 10,
  completed_quizzes: 1,
  total_quizzes: 4,
  progress_percentage: 75,
  quiz_scores: [],
}

const mockQuizzes: Quiz[] = [
  {
    id: 1,
    title: "Budgeting Basics",
    difficulty: "easy",
    questions: [],
  },
  {
    id: 2,
    title: "Tax Knowledge",
    difficulty: "easy",
    questions: [],
  },
]

describe("LearningHubQuizDashboard", () => {
  it("renders the Quiz Dashboard heading", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    expect(screen.getByText("Quiz Dashboard")).toBeInTheDocument()
  })

  it("renders quiz titles", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    expect(screen.getByText("Budgeting Basics")).toBeInTheDocument()
    expect(screen.getByText("Tax Knowledge")).toBeInTheDocument()
  })

  it("renders difficulty tabs", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    expect(screen.getByText("Easy")).toBeInTheDocument()
    expect(screen.getByText("Medium")).toBeInTheDocument()
    expect(screen.getByText("Hard")).toBeInTheDocument()
  })

  it("calls onDifficultyChange when a tab is clicked", async () => {
    const user = userEvent.setup()
    const onDifficultyChange = jest.fn()
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={onDifficultyChange}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    await user.click(screen.getByText("Medium"))
    expect(onDifficultyChange).toHaveBeenCalledWith("medium")
  })

  it("calls onQuizStart when a quiz is clicked", async () => {
    const user = userEvent.setup()
    const onQuizStart = jest.fn()
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={onQuizStart}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    await user.click(screen.getByText("Budgeting Basics"))
    expect(onQuizStart).toHaveBeenCalledWith(mockQuizzes[0])
  })

  it("shows Not started for incomplete quizzes", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    expect(screen.getAllByText(/not started/i).length).toBeGreaterThan(0)
  })

  it("shows pass score for completed quizzes", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={mockQuizzes}
        difficulty="easy"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[1]}
        quizScores={{ 1: 80 }}
      />
    )
    expect(screen.getByText(/score 80% passed/i)).toBeInTheDocument()
  })

  it("shows no quizzes message when list is empty", () => {
    render(
      <LearningHubQuizDashboard
        dashboard={mockDashboard}
        quizzes={[]}
        difficulty="hard"
        onDifficultyChange={jest.fn()}
        onQuizStart={jest.fn()}
        completedQuizIds={[]}
        quizScores={{}}
      />
    )
    expect(screen.getByText(/no quizzes available/i)).toBeInTheDocument()
  })
})