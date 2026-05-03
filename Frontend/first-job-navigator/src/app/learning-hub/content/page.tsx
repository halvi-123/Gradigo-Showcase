import { LearningHubContentPage } from "@/components/learning-hub-content-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Articles & Videos | Learning Hub",
}

export default function ContentPage() {
  return <LearningHubContentPage />
}