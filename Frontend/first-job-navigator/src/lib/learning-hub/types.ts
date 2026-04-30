export type Article = {
  id: number
  title: string
  slug: string
  content: string
  external_url: string
}

export type Video = {
  id: number
  title: string
  youtube_url: string
  description: string
}

export type Category = {
  id: number
  name: string
}

export type Answer = {
  id: number
  text: string
}

export type Question = {
  id: number
  text: string
  difficulty: "easy" | "medium" | "hard"
  category: Category
  answers: Answer[]
}

export type Quiz = {
  id: number
  title: string
  difficulty: "easy" | "medium" | "hard"
  questions: Question[]
}

export type QuizSubmission = {
  answers: Record<number, number>
}

export type QuizResult = {
  score: number
  passed: boolean
}

export type LearningDashboard = {
  completed_articles: number
  total_articles: number
  completed_quizzes: number
  total_quizzes: number
  progress_percentage: number
  quiz_scores: { quiz_id: number; score: number }[]
}