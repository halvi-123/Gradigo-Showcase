"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import { LearningHubQuizDashboard } from "@/components/learning-hub-quiz-dashboard"
import { LearningHubArticles } from "@/components/learning-hub-articles"
import { LearningHubVideos } from "@/components/learning-hub-videos"
import { LearningHubChatbot } from "@/components/learning-hub-chatbot"
import {
  getArticles,
  getVideos,
  getQuizzesByDifficulty,
  getDashboard,
} from "@/lib/learning-hub/service"
import { MOCK_ARTICLES, MOCK_VIDEOS, MOCK_QUIZZES } from "@/data/learning-hub.mock"
import { getStoredAccessToken } from "@/lib/auth/session"
import type { Article, Video, Quiz, LearningDashboard } from "@/lib/learning-hub/types"

export function LearningHubContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [dashboard, setDashboard] = useState<LearningDashboard>({
    completed_articles: 0,
    total_articles: 0,
    quizzes_taken: 0,
    average_score: 0,
  })
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [readArticleIds, setReadArticleIds] = useState<number[]>([])
  const [completedQuizIds] = useState<number[]>([])
  const [quizScores] = useState<Record<number, number>>({})
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [articlesData, videosData, dashboardData] = await Promise.all([
          getArticles(),
          getVideos(),
          getDashboard(),
        ])
        setArticles(articlesData.length > 0 ? articlesData : MOCK_ARTICLES)
        setVideos(videosData.length > 0 ? videosData : MOCK_VIDEOS)
        setDashboard(dashboardData)
      } catch {
        setArticles(MOCK_ARTICLES)
        setVideos(MOCK_VIDEOS)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const quizzesData = await getQuizzesByDifficulty(difficulty)
        setQuizzes(quizzesData.length > 0 ? quizzesData : MOCK_QUIZZES.filter(q => q.difficulty === difficulty))
      } catch {
        setQuizzes(MOCK_QUIZZES.filter(q => q.difficulty === difficulty))
      }
    }
    loadQuizzes()
  }, [difficulty])

  function handleArticleRead(articleId: number) {
    setReadArticleIds((prev) => [...prev, articleId])
  }

  function handleQuizStart(quiz: Quiz) {
    const token = getStoredAccessToken()
    if (!token) {
      setShowLoginDialog(true)
      return
    }
    window.location.href = `/learning-hub/quiz/${quiz.id}`
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">First Job Navigator</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Learning Hub</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <p className="text-sm text-[#f0ebd8]/70">
              Explore articles, videos and quizzes to build your financial knowledge.
            </p>

            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="min-w-0 flex-1">
                <LearningHubQuizDashboard
                  dashboard={dashboard}
                  quizzes={quizzes}
                  difficulty={difficulty}
                  onDifficultyChange={setDifficulty}
                  onQuizStart={handleQuizStart}
                  completedQuizIds={completedQuizIds}
                  quizScores={quizScores}
                />
              </div>
              <div className="min-w-0 flex-1">
                <LearningHubChatbot />
              </div>
            </div>

            <LearningHubArticles
              articles={articles}
              readArticleIds={readArticleIds}
              onArticleRead={handleArticleRead}
            />

            <LearningHubVideos videos={videos} />
          </div>

          <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
            <DialogContent className="bg-[#0d1321] border border-border/60 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Login Required</DialogTitle>
                <DialogDescription className="text-[#f0ebd8]/70">
                  You need to be logged in to take quizzes and track your progress.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button asChild className="bg-[#748cab] hover:bg-[#3e5c76] text-white">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="bg-[#1d2d44] border border-[#3e5c76] text-white hover:bg-[#3e5c76]">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}