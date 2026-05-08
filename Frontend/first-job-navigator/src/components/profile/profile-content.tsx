"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuthSessionState } from "@/hooks/use-auth-session-state"
import { getStoredAuthSession, buildBearerAuthHeaders } from "@/lib/auth/session"
import { getApiBaseUrl } from "@/lib/api/base-url"
import { getDashboard } from "@/lib/learning-hub/service"
import type { LearningDashboard } from "@/lib/learning-hub/types"

function getBase() { return `${getApiBaseUrl()}/api/accounts` }

async function patchName(fullName: string): Promise<void> {
  const res = await fetch(`${getBase()}/me/`, {
    method: "PATCH",
    headers: { ...buildBearerAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
}

async function deleteAccount(): Promise<void> {
  const res = await fetch(`${getBase()}/me/`, {
    method: "DELETE",
    headers: { ...buildBearerAuthHeaders(), "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function ProfileContent() {
  const { isAuthenticated, logoutUser } = useAuthSessionState()
  const session = getStoredAuthSession()
  const email = session?.email ?? ""

  const [displayName, setDisplayName] = useState(session?.fullName ?? "")
  const [name, setName] = useState(session?.fullName ?? "")
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState<string | null>(null)

  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    const load = async () => {
      setLoadingDashboard(true)
      try {
        const [dashData, meRes] = await Promise.all([
          getDashboard(),
          fetch(`${getBase()}/me/`, { headers: { ...buildBearerAuthHeaders() } }),
        ])
        setDashboard(dashData)
        if (meRes.ok) {
          const me = await meRes.json()
          if (me.created_at) setMemberSince(formatMemberSince(me.created_at))
        }
      } catch {
        setDashboard(null)
      } finally {
        setLoadingDashboard(false)
      }
    }
    load().catch(console.error)
  }, [isAuthenticated])

  async function handleSaveName() {
    if (!name.trim()) { setSaveError("Name cannot be empty."); return }
    setSaving(true); setSaveSuccess(false); setSaveError(null)
    try {
      await patchName(name.trim())
      setDisplayName(name.trim())
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      setSaveError("Failed to update name. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true); setDeleteError(null)
    try {
      await deleteAccount()
      setDisplayName("")
      setName("")
      setMemberSince(null)
      setDashboard(null)
      logoutUser()
    } catch {
      setDeleteError("Failed to delete account. Please try again.")
      setDeleting(false)
    }
  }

  const hasQuizData = dashboard && dashboard.total_quizzes > 0
  const progressPercent = hasQuizData
    ? Math.round((dashboard.completed_quizzes / dashboard.total_quizzes) * 100)
    : 0

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">First Job Navigator</BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-primary text-lg font-semibold">Profile & Progress</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {!isAuthenticated && (
              <Button asChild variant="outline" className="h-10 rounded-md px-5 text-sm font-semibold text-primary">
                <Link href="/login">Login / Signup</Link>
              </Button>
            )}
          </header>

          <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 pt-0 max-w-4xl mx-auto w-full">

            {/* Profile card */}
            <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Profile</CardTitle>
                <p className="text-sm text-muted-foreground">Manage your account details.</p>
              </CardHeader>
              <Separator className="bg-border/40 mb-4 mx-6" />
              <CardContent className="space-y-6">

                {/* Avatar + fields */}
                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Avatar column */}
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-3 sm:w-48 shrink-0">
                    <div className="w-20 h-20 rounded-full bg-[#1d2d44] flex items-center justify-center text-white font-bold text-2xl border border-white/10 shrink-0">
                      {getInitials(displayName) || "?"}
                    </div>
                    <div className="sm:text-center min-w-0">
                      <p className="text-sm font-medium text-white truncate">{displayName || "No name set"}</p>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{email}</p>
                      {memberSince && (
                        <p className="text-xs text-white/30 mt-1">Member since {memberSince}</p>
                      )}
                    </div>
                  </div>

                  {/* Fields column */}
                  <div className="flex-1 space-y-4 min-w-0">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-white/70">Full name</Label>
                      <div className="flex gap-2">
                        <Input
                          value={name}
                          onChange={e => { setName(e.target.value); setSaveError(null) }}
                          placeholder="Enter your full name"
                          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                          maxLength={100}
                          disabled={!isAuthenticated}
                        />
                        <Button
                          onClick={handleSaveName}
                          disabled={saving || name === displayName || !name.trim() || !isAuthenticated}
                          className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none shrink-0"
                        >
                          {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
                        </Button>
                      </div>
                      {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-white/70">Email</Label>
                      <Input value={email} readOnly className="bg-white/10 border-white/10 text-white cursor-not-allowed opacity-80" />
                      <p className="text-xs text-white/30">Email cannot be changed.</p>
                    </div>

                    {isAuthenticated ? (
                      <Button asChild size="sm" className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none">
                        <Link href="/forgot-password">Change password</Link>
                      </Button>
                    ) : (
                      <p className="text-xs text-white/40">Log in to make changes to your account.</p>
                    )}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-red-400">Delete account</p>
                      <p className="text-xs text-white/40 mt-0.5">Permanently delete your account and all associated data. This cannot be undone.</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm text-red-400 border-red-500/40 bg-transparent hover:bg-red-500/10 hover:text-red-400 shrink-0"
                          disabled={!isAuthenticated}
                        >
                          Delete account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0d1321] border border-border/60 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete account</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            Are you sure? This will permanently remove all your data including your budget, transactions, savings goals and quiz progress. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        {deleteError && <p className="text-xs text-red-400 px-1">{deleteError}</p>}
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deleting ? "Deleting…" : "Delete account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Quiz Progress card */}
            <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Learning Hub Progress</CardTitle>
                <p className="text-sm text-muted-foreground">Your quiz completion progress from the Learning Hub.</p>
              </CardHeader>
              <Separator className="bg-border/40 mb-4 mx-6" />
              <CardContent className="space-y-4">

                {!isAuthenticated ? (
                  <div className="py-4 space-y-2">
                    <p className="text-sm text-white/50">Log in to see your quiz progress.</p>
                    <Button asChild variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                      <Link href="/login">Log in</Link>
                    </Button>
                  </div>
                ) : loadingDashboard ? (
                  <p className="text-sm text-white/50 animate-pulse">Loading progress...</p>
                ) : !hasQuizData ? (
                  <div className="py-4 space-y-2">
                    <p className="text-sm text-white/50">No quiz progress yet.</p>
                    <p className="text-xs text-white/30">Complete quizzes in the Learning Hub to track your progress here.</p>
                    <Button asChild size="sm" className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none mt-1">
                      <Link href="/learning-hub">Go to Learning Hub</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Quizzes completed</span>
                        <span className="font-medium text-white">{dashboard.completed_quizzes} / {dashboard.total_quizzes}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#748cab] transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/40">{progressPercent}% complete</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-lg bg-[#0d1b2a] px-4 py-3 text-center border border-white/5">
                        <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Quizzes done</p>
                        <p className="text-2xl font-bold text-white">{dashboard.completed_quizzes}</p>
                      </div>
                      <div className="rounded-lg bg-[#1b263b] px-4 py-3 text-center border border-white/5">
                        <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Average score</p>
                        <p className="text-2xl font-bold text-white">{(dashboard.average_score ?? 0).toFixed(1)}%</p>
                      </div>
                      <div className="rounded-lg bg-[#415a77] px-4 py-3 text-center border border-white/5 col-span-2 sm:col-span-1">
                        <p className="text-xs text-white/50 mb-1 uppercase tracking-wide">Overall progress</p>
                        <p className="text-2xl font-bold text-white">{progressPercent}%</p>
                      </div>
                    </div>

                    {dashboard.quiz_scores && dashboard.quiz_scores.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Quiz scores</p>
                        {dashboard.quiz_scores.map((qs: { quiz_id: number; score: number }) => {
                          const passed = qs.score >= 70
                          return (
                            <div key={qs.quiz_id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5">
                              <span className="text-sm text-white/60">Quiz {qs.quiz_id}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white">{qs.score}%</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                  {passed ? "Passed" : "Failed"}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex justify-start pt-1">
                      <Button asChild size="sm" className="bg-[#3e5c76] hover:bg-[#1d2d44] text-white border-none">
                        <Link href="/learning-hub">Go to Learning Hub</Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}