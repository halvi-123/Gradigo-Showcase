import { LearningHubQuizPage } from "@/components/learning-hub-quiz-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quiz | Learning Hub",
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <LearningHubQuizPage quizId={Number(id)} />
}