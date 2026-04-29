import { getApiBaseUrl } from "@/lib/api/base-url"
import { buildBearerAuthHeaders } from "@/lib/auth/session"
import type {
  Article,
  Video,
  Quiz,
  QuizResult,
  QuizSubmission,
  LearningDashboard,
} from "@/lib/learning-hub/types"

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...buildBearerAuthHeaders(),
  }
}

export async function getArticles(): Promise<Article[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/articles/`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error("Failed to fetch articles")
  return response.json()
}

export async function markArticleComplete(articleId: number): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/articles/${articleId}/complete/`, {
    method: "POST",
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error("Failed to mark article as complete")
}

export async function getVideos(): Promise<Video[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/videos/`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error("Failed to fetch videos")
  return response.json()
}

export async function getQuizzesByDifficulty(difficulty: "easy" | "medium" | "hard"): Promise<Quiz[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/questions?difficulty=${difficulty}`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error("Failed to fetch quizzes")
  return response.json()
}

export async function submitQuiz(quizId: number, submission: QuizSubmission): Promise<QuizResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/quizzes/${quizId}/submit/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(submission),
  })
  if (!response.ok) throw new Error("Failed to submit quiz")
  return response.json()
}

export async function getDashboard(): Promise<LearningDashboard> {
  const response = await fetch(`${getApiBaseUrl()}/api/learning/dashboard/`, {
    headers: getAuthHeaders(),
  })
  if (!response.ok) throw new Error("Failed to fetch dashboard")
  return response.json()
}