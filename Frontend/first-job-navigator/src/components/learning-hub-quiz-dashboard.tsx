"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Quiz, LearningDashboard } from "@/lib/learning-hub/types"

type Props = {
  dashboard: LearningDashboard
  quizzes: Quiz[]
  difficulty: "easy" | "medium" | "hard"
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void
  onQuizStart: (quiz: Quiz) => void
  completedQuizIds: number[]
  quizScores: Record<number, number>
}

export function LearningHubQuizDashboard({
  dashboard,
  quizzes,
  difficulty,
  onDifficultyChange,
  onQuizStart,
  completedQuizIds,
  quizScores,
}: Props) {
  const completedInDifficulty = quizzes.filter(q => completedQuizIds.includes(q.id)).length
  const progressPercent = quizzes.length > 0
    ? Math.round((completedInDifficulty / quizzes.length) * 100)
    : 0

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Quiz Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-[#f0ebd8]/70">{progressPercent}% of quizzes complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-[#748cab] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-[#f0ebd8]/50">
          {dashboard.completed_quizzes} quizzes completed · Average score: {(dashboard.average_score ?? 0).toFixed(1)}%
        </p>

        <Tabs value={difficulty} onValueChange={(v) => onDifficultyChange(v as "easy" | "medium" | "hard")}>
          <TabsList className="h-9 bg-[#1d2d44] p-1">
            <TabsTrigger value="easy" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Easy</TabsTrigger>
            <TabsTrigger value="medium" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Medium</TabsTrigger>
            <TabsTrigger value="hard" className="text-white data-active:bg-[#f0ebd8] data-active:text-[#0d1321]">Hard</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          {quizzes.length === 0 && (
            <p className="text-sm text-[#f0ebd8]/50">No quizzes available for this difficulty.</p>
          )}
          {quizzes.map((quiz) => {
            const completed = completedQuizIds.includes(quiz.id)
            const score = quizScores[quiz.id]
            const passed = score >= 70

            return (
              <button
                key={quiz.id}
                onClick={() => onQuizStart(quiz)}
                className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-all border ${
                  completed
                    ? passed
                      ? "bg-green-900/40 border-green-500/50 text-green-300"
                      : "bg-red-900/40 border-red-500/50 text-red-300"
                    : "bg-[#1d2d44] border-[#3e5c76]/50 text-white hover:bg-[#3e5c76]/30"
                }`}
              >
                {quiz.title}
                {completed && (
                  <span className="ml-2 text-xs">
                    {passed ? `Score ${score}% Passed` : `Score ${score}% Failed`}
                  </span>
                )}
                {!completed && <span className="ml-2 text-xs text-[#f0ebd8]/50">Not started</span>}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}