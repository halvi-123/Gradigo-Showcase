"use client"

import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { markArticleComplete } from "@/lib/learning-hub/service"
import type { Article } from "@/lib/learning-hub/types"

type Props = {
  articles: Article[]
  readArticleIds: number[]
  onArticleRead: (articleId: number) => void
}

export function LearningHubArticles({ articles, readArticleIds, onArticleRead }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: "left" | "right") {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" })
    }
  }

  async function handleArticleClick(article: Article) {
    window.open(article.external_url, "_blank")
    if (!readArticleIds.includes(article.id)) {
      try {
        await markArticleComplete(article.id)
        onArticleRead(article.id)
      } catch {
        // silently fail
      }
    }
  }

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommended Articles</CardTitle>
        <a href="/learning-hub/content" className="text-xs text-[#748cab] hover:text-[#f0ebd8] transition-colors">
          View All
        </a>
      </CardHeader>
      <CardContent className="w-full overflow-hidden">
        <div className="relative w-full">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[#1d2d44] p-1 hover:bg-[#3e5c76] transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-8 py-2"
            style={{ scrollbarWidth: "none" }}
          >
            {articles.map((article) => {
              const isRead = readArticleIds.includes(article.id)
              return (
                <button
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className={`relative shrink-0 w-64 h-40 rounded-lg border overflow-hidden transition-all hover:scale-105 ${
                    isRead
                      ? "border-green-500/50 bg-green-900/20"
                      : "border-[#3e5c76]/50 bg-[#1d2d44]"
                  }`}
                >
                  <div className="p-3 text-left h-full flex flex-col justify-between">
                    <p className="text-sm font-medium text-white line-clamp-3">{article.title}</p>
                    {isRead && (
                      <span className="text-xs text-green-400 font-medium">✓ Completed</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-[#1d2d44] p-1 hover:bg-[#3e5c76] transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}