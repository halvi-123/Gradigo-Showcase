import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubArticlesGrid } from "@/components/learning-hub-articles-grid"
import type { Article } from "@/lib/learning-hub/types"

jest.mock("@/lib/learning-hub/service", () => ({
  markArticleComplete: jest.fn().mockResolvedValue(undefined),
}))

const mockArticles: Article[] = [
  { id: 1, title: "Understanding Your Payslip", slug: "payslip", content: "", external_url: "https://gov.uk/payslip" },
  { id: 2, title: "How Income Tax Works", slug: "tax", content: "", external_url: "https://gov.uk/tax" },
  { id: 3, title: "National Insurance Explained", slug: "ni", content: "", external_url: "https://gov.uk/ni" },
]

describe("LearningHubArticlesGrid", () => {
  it("renders all article titles", () => {
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("Understanding Your Payslip")).toBeInTheDocument()
    expect(screen.getByText("How Income Tax Works")).toBeInTheDocument()
    expect(screen.getByText("National Insurance Explained")).toBeInTheDocument()
  })

  it("shows completed indicator for read articles", () => {
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[1]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("✓ Completed")).toBeInTheDocument()
  })

  it("does not show completed indicator for unread articles", () => {
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.queryByText("✓ Completed")).not.toBeInTheDocument()
  })

  it("calls onArticleRead when an unread article is clicked", async () => {
    const user = userEvent.setup()
    const onArticleRead = jest.fn()
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[]} onArticleRead={onArticleRead} />)
    await user.click(screen.getByText("Understanding Your Payslip"))
    expect(onArticleRead).toHaveBeenCalledWith(1)
  })

  it("does not call onArticleRead when an already read article is clicked", async () => {
    const user = userEvent.setup()
    const onArticleRead = jest.fn()
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[1]} onArticleRead={onArticleRead} />)
    await user.click(screen.getByText("Understanding Your Payslip"))
    expect(onArticleRead).not.toHaveBeenCalled()
  })

  it("renders the Articles heading", () => {
    render(<LearningHubArticlesGrid articles={mockArticles} readArticleIds={[]} onArticleRead={jest.fn()} />)
    expect(screen.getByText("Articles")).toBeInTheDocument()
  })
})