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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getQuizzesByDifficulty, submitQuiz } from "@/lib/learning-hub/service"
import { MOCK_QUIZZES } from "@/data/learning-hub.mock"
import type { Quiz, QuizResult } from "@/lib/learning-hub/types"
type Props = {
  quizId: number
}

const QUESTIONS_PER_PAGE = 6

export function LearningHubQuizPage({ quizId }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuiz() {
      try {
        const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"]
        for (const difficulty of difficulties) {
          const quizzes = await getQuizzesByDifficulty(difficulty)
          const found = quizzes.find(q => q.id === quizId)
          if (found) { setQuiz(found); setIsMock(false); return }
        }
        const mockFound = MOCK_QUIZZES.find(q => q.id === quizId)
        if (mockFound) { setQuiz(mockFound); setIsMock(true) }
      } catch {
        const mockFound = MOCK_QUIZZES.find(q => q.id === quizId)
        if (mockFound) { setQuiz(mockFound); setIsMock(true) }
      }
    }
    loadQuiz()
  }, [quizId])

  if (!quiz) {
    return (
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="overflow-hidden">
            <div className="flex flex-1 items-center justify-center">
              <p className="text-white">Loading quiz...</p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    )
  }

  const totalPages = Math.ceil(quiz.questions.length / QUESTIONS_PER_PAGE)
  const pageQuestions = quiz.questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
  const allAnswered = quiz.questions.every(q => answers[q.id] !== undefined)

  async function handleSubmit() {
    if (!allAnswered) { setError("Please answer all questions before submitting."); return }
    setIsSubmitting(true)
    setError(null)
    try {
      if (isMock) {
        const score = Math.round((Object.keys(answers).length / (quiz?.questions.length ?? 1)) * 100)
        setResult({ score, passed: score >= 70 })
      } else {
        console.log("Submitting to quiz ID:", quizId, "with answers:", answers)
        const result = await submitQuiz(quizId, { answers })
        console.log("Submitting to quiz ID:", quizId, "with answers:", answers)
        setResult(result)
      }
    } catch {
      setError("Failed to submit quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
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
                    <BreadcrumbPage className="text-primary text-lg font-semibold">{quiz.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {result ? (
              <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`rounded-lg p-6 text-center ${result.passed ? "bg-green-900/30 border border-green-500/50" : "bg-red-900/30 border border-red-500/50"}`}>
                    <p className="text-5xl font-bold mb-2">{result.score}%</p>
                    <p className={`text-lg font-semibold ${result.passed ? "text-green-400" : "text-red-400"}`}>
                      {result.passed ? "✓ Passed!" : "✗ Failed"}
                    </p>
                    <p className="text-sm text-[#f0ebd8]/70 mt-2">
                      {result.passed ? "Well done! You passed the quiz." : "You need 70% to pass. Keep studying and try again!"}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.location.href = "/learning-hub"}
                    className="w-full bg-[#748cab] hover:bg-[#3e5c76] text-white"
                  >
                    Back to Learning Hub
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{quiz.title}</CardTitle>
                    <span className="text-sm text-[#f0ebd8]/50">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                  </div>
                  <p className="text-xs text-[#f0ebd8]/50">
                    {Object.keys(answers).length} of {quiz.questions.length} questions answered
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {pageQuestions.map((question) => (
                      <div key={question.id} className="space-y-3">
                        <p className="text-sm font-medium text-white">{question.text}</p>
                        <div className="space-y-2">
                          {question.answers.map((answer) => {
                            const isSelected = answers[question.id] === answer.id
                            return (
                              <button
                                key={answer.id}
                                onClick={() => setAnswers(prev => ({ ...prev, [question.id]: answer.id }))}
                                className={`w-full text-left rounded-lg px-4 py-2 text-sm transition-all border ${
                                  isSelected
                                    ? "bg-[#748cab] border-[#748cab] text-white font-semibold shadow-[0_0_0_2px_#748cab]"
                                    : "bg-[#1d2d44] border-[#3e5c76]/30 text-[#f0ebd8]/70 hover:border-[#748cab]/50 hover:bg-[#1d2d44]/80"
                                }`}
                              >
                                {isSelected && <span className="mr-2">✓</span>}
                                {answer.text}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex justify-between gap-4">
                    <Button
                        onClick={() => window.location.href = "/learning-hub"}
                        className="bg-[#1d2d44] border border-[#3e5c76] text-white hover:bg-[#3e5c76]"
                        >
                        Quit Quiz
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 0}
                        className="bg-[#1d2d44] border border-[#3e5c76] text-white hover:bg-[#3e5c76] disabled:opacity-50"
                        >
                        Prev Page
                        </Button>
                      {currentPage < totalPages - 1 ? (
                        <Button
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="bg-[#748cab] hover:bg-[#3e5c76] text-white"
                        >
                          Next Page
                        </Button>
                      ) : (
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting || !allAnswered}
                          className="bg-[#748cab] hover:bg-[#3e5c76] text-white"
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}