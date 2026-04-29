import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubArticles } from "@/components/learning-hub-articles"
import type { Article } from "@/lib/learning-hub/types"

jest.mock("@/lib/learning-hub/service", () => ({
  markArticleComplete: jest.fn().mockResolvedValue(undefined),
}))

const mockArticles: Article[] = [
  { id: 1, title: "Understanding Your Payslip", slug: "payslip", content: "", external_url: "https://gov.uk/payslip" },
  { id: 2, title: "How Income Tax Works", slug: "tax", content: "", external_url: "https://gov.uk/tax" },
]

describe("LearningHubArticles", () => {
  it("renders the Recommended Articles heading", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("Recommended Articles")).toBeInTheDocument()
  })

  it("renders all article titles", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("Understanding Your Payslip")).toBeInTheDocument()
    expect(screen.getByText("How Income Tax Works")).toBeInTheDocument()
  })

  it("shows completed indicator for read articles", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[1]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("✓ Completed")).toBeInTheDocument()
  })

  it("does not show completed indicator when no articles are read", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.queryByText("✓ Completed")).not.toBeInTheDocument()
  })

  it("calls onArticleRead when an unread article is clicked", async () => {
    const user = userEvent.setup()
    const onArticleRead = jest.fn()
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={onArticleRead} />)
    await user.click(screen.getByText("Understanding Your Payslip"))
    expect(onArticleRead).toHaveBeenCalledWith(1)
  })

  it("renders View All link", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("View All")).toBeInTheDocument()
  })

  it("renders scroll buttons", () => {
    render(<LearningHubArticles articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })
})