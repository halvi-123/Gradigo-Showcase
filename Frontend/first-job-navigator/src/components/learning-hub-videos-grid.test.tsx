import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LearningHubVideosGrid } from "@/components/learning-hub-videos-grid"
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

describe("LearningHubVideosGrid", () => {
  it("renders all video titles", () => {
    render(<LearningHubVideosGrid videos={mockVideos} />)
    expect(screen.getByText("How Pensions Work")).toBeInTheDocument()
    expect(screen.getByText("UK Tax System Explained")).toBeInTheDocument()
  })

  it("renders the Videos heading", () => {
    render(<LearningHubVideosGrid videos={mockVideos} />)
    expect(screen.getByText("Videos")).toBeInTheDocument()
  })

  it("does not show video player initially", () => {
    render(<LearningHubVideosGrid videos={mockVideos} />)
    expect(screen.queryByTitle("How Pensions Work")).not.toBeInTheDocument()
  })

  it("shows video player when a video is clicked", async () => {
    const user = userEvent.setup()
    render(<LearningHubVideosGrid videos={mockVideos} />)
    await user.click(screen.getAllByText("How Pensions Work")[0])
    expect(screen.getByTitle("How Pensions Work")).toBeInTheDocument()
  })

  it("closes video player when X is clicked", async () => {
    const user = userEvent.setup()
    render(<LearningHubVideosGrid videos={mockVideos} />)
    await user.click(screen.getAllByText("How Pensions Work")[0])
    expect(screen.getByTitle("How Pensions Work")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "" }))
    expect(screen.queryByTitle("How Pensions Work")).not.toBeInTheDocument()
  })

  it("renders video thumbnails", () => {
    render(<LearningHubVideosGrid videos={mockVideos} />)
    const thumbnails = screen.getAllByRole("img")
    expect(thumbnails.length).toBeGreaterThan(0)
  })
})