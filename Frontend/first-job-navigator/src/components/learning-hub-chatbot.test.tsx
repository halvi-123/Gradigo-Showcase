import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubChatbot } from "@/components/learning-hub-chatbot"

jest.mock("@/lib/auth/session", () => ({
  buildBearerAuthHeaders: jest.fn().mockReturnValue({ Authorization: "Bearer mock-token" }),
  getStoredAccessToken: jest.fn().mockReturnValue("mock-token"),
}))

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

describe("LearningHubChatbot", () => {
  it("renders the Chatbot heading", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByText("Chatbot")).toBeInTheDocument()
  })

  it("renders the disclaimer", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByText(/the bot cannot give financial advice/i)).toBeInTheDocument()
  })

  it("renders the input field", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument()
  })

  it("renders the send button", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("shows empty state message initially", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByText(/ask a question to get started/i)).toBeInTheDocument()
  })

  it("disables send button when input is empty", () => {
    render(<LearningHubChatbot />)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("enables send button when input has text", async () => {
    const user = userEvent.setup()
    render(<LearningHubChatbot />)
    await user.type(screen.getByPlaceholderText(/ask a question/i), "Hello")
    expect(screen.getByRole("button")).not.toBeDisabled()
  })

  it("shows login message when user is not authenticated", async () => {
    const mockGetStoredAccessToken = jest.mocked(
      jest.requireMock("@/lib/auth/session").getStoredAccessToken
    )
    mockGetStoredAccessToken.mockReturnValueOnce(null)

    const user = userEvent.setup()
    render(<LearningHubChatbot />)
    await user.type(screen.getByPlaceholderText(/ask a question/i), "Hello")
    await user.click(screen.getByRole("button"))
    expect(screen.getByText(/please log in to use the chatbot/i)).toBeInTheDocument()
  })
})