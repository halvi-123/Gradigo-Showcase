"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Video } from "@/lib/learning-hub/types"

type Props = {
  videos: Video[]
}

function getYouTubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match?.[1] ?? ""
}

function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url)
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

export function LearningHubVideosGrid({ videos }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
      <CardHeader>
        <CardTitle>Videos</CardTitle>
      </CardHeader>
      <CardContent>
        {activeVideo && (
          <div className="mb-4 relative rounded-lg overflow-hidden bg-black">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1 hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtube_url)}?autoplay=1`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="p-3 text-sm font-medium text-white">{activeVideo.title}</p>
            <p className="px-3 pb-3 text-xs text-[#f0ebd8]/70">{activeVideo.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[600px] pr-1">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="relative rounded-lg border border-[#3e5c76]/50 overflow-hidden hover:scale-[1.02] transition-all aspect-video"
            >
              <img
                src={getYouTubeThumbnail(video.youtube_url)}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                <p className="text-xs font-medium text-white line-clamp-2">{video.title}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/60 p-2">
                  <svg className="h-5 w-5 text-white fill-white" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}