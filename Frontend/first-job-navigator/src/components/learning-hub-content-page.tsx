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
import { LearningHubArticlesGrid } from "@/components/learning-hub-articles-grid"
import { LearningHubVideosGrid } from "@/components/learning-hub-videos-grid"
import { getArticles, getVideos, getDashboard, markArticleComplete } from "@/lib/learning-hub/service"
import { MOCK_ARTICLES, MOCK_VIDEOS } from "@/data/learning-hub.mock"
import type { Article, Video } from "@/lib/learning-hub/types"

export function LearningHubContentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [readArticleIds, setReadArticleIds] = useState<number[]>([])

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
        setReadArticleIds(dashboardData.completed_article_ids)
      } catch {
        setArticles(MOCK_ARTICLES)
        setVideos(MOCK_VIDEOS)
      }
    }
    loadData()
  }, [])

  async function handleArticleRead(articleId: number) {
    if (readArticleIds.includes(articleId)) return
    try {
      await markArticleComplete(articleId)
      setReadArticleIds((prev) => [...prev, articleId])
    } catch {
      // silently fail
    }
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
                  <BreadcrumbItem className="hidden md:block">
                    <a href="/learning-hub" className="hover:text-white transition-colors">Learning Hub</a>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Articles & Videos</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <p className="text-sm text-[#f0ebd8]/70">
              Browse all recommended articles and videos to build your financial knowledge.
            </p>

            <div className="flex flex-col gap-4 xl:flex-row">
              <div className="min-w-0 flex-1">
                <LearningHubArticlesGrid
                  articles={articles}
                  readArticleIds={readArticleIds}
                  onArticleRead={handleArticleRead}
                />
              </div>
              <div className="min-w-0 flex-1">
                <LearningHubVideosGrid videos={videos} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}