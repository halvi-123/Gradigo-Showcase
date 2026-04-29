import { LearningHubContent } from "@/components/learning-hub-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Learning Hub",
}

export default function LearningHubPage() {
  return <LearningHubContent />
}