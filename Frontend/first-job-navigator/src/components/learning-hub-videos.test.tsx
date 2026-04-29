import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubVideos } from "@/components/learning-hub-videos"
import type { Video } from "@/lib/learning-hub/types"

const mockVideos: Video[] = [
  {
    id: 1,
    title: "How Pensions Work",
    youtube_url: "https://www.youtube.com/watch?v=1YkGQfkiJmo",
    description: "A beginner's guide to understanding pensions",
  },
  {
    id: 2,
    title: "UK Tax System Explained",
    youtube_url: "https://www.youtube.com/watch?v=AwSzAL4EyTs",
    description: "Everything you need to know about UK taxes",
  },
]

describe("LearningHubVideos", () => {
  it("renders the Recommended Videos heading", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    expect(screen.getByText("Recommended Videos")).toBeInTheDocument()
  })

  it("renders all video titles", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    expect(screen.getByText("How Pensions Work")).toBeInTheDocument()
    expect(screen.getByText("UK Tax System Explained")).toBeInTheDocument()
  })

  it("renders View All link", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    expect(screen.getByText("View All")).toBeInTheDocument()
  })

  it("does not show video player initially", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    expect(screen.queryByTitle("How Pensions Work")).not.toBeInTheDocument()
  })

  it("shows video player when a video is clicked", async () => {
    const user = userEvent.setup()
    render(<LearningHubVideos videos={mockVideos} />)
    await user.click(screen.getAllByText("How Pensions Work")[0])
    expect(screen.getByTitle("How Pensions Work")).toBeInTheDocument()
  })

  it("renders video thumbnails", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    const thumbnails = screen.getAllByRole("img")
    expect(thumbnails.length).toBeGreaterThan(0)
  })

  it("renders scroll buttons", () => {
    render(<LearningHubVideos videos={mockVideos} />)
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThan(0)
  })
})