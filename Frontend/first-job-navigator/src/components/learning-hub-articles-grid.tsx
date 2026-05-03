"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { markArticleComplete } from "@/lib/learning-hub/service"
import type { Article } from "@/lib/learning-hub/types"

type Props = {
  articles: Article[]
  readArticleIds: number[]
  onArticleRead: (articleId: number) => void
}

export function LearningHubArticlesGrid({ articles, readArticleIds, onArticleRead }: Props) {
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
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none h-full">
      <CardHeader>
        <CardTitle>Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[600px] pr-1">
          {articles.map((article) => {
            const isRead = readArticleIds.includes(article.id)
            return (
              <button
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className={`rounded-lg border p-3 text-left transition-all hover:scale-[1.02] ${
                  isRead
                    ? "border-green-500/50 bg-green-900/20"
                    : "border-[#3e5c76]/50 bg-[#1d2d44] hover:border-[#748cab]/50"
                }`}
              >
                <p className="text-sm font-medium text-white line-clamp-3">{article.title}</p>
                {isRead && (
                  <span className="mt-2 block text-xs text-green-400 font-medium">✓ Completed</span>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}