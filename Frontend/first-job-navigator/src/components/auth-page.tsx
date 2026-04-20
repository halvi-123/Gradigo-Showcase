"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Mail, ShieldCheck, UserRound } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { login, register, requestPasswordReset, submitPasswordReset } from "@/lib/auth/service"
import {
  getPasswordRuleStates,
  getPasswordStrengthLabel,
  getPasswordStrengthTone,
  passwordBackendNote,
} from "../lib/auth/password-rules"
import { useAuthForm, type AuthMode } from "../hooks/use-auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type AuthPageProps = {
  mode: AuthMode
  resetTokens?: {
    uidb64: string
    token: string
  }
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  showPassword,
  onToggleVisibility,
  helper,
  minLength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  placeholder: string
  showPassword: boolean
  onToggleVisibility: () => void
  helper?: string
  minLength?: number
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-900">
        {label}
      </Label>
      <div className="relative">
        <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          minLength={minLength}
          className="h-11 rounded-xl border-[#c9d4e0] bg-white pl-10 pr-11 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-[#748cab] focus-visible:ring-[#748cab]/30"
          required
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <span className="text-xs font-medium">Hide</span> : <span className="text-xs font-medium">Show</span>}
        </button>
      </div>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

export function AuthPage({ mode, resetTokens }: AuthPageProps) {
  const router = useRouter()
  const form = useAuthForm({ mode })

  const passwordRuleStates = React.useMemo(() => getPasswordRuleStates(form.password), [form.password])
  const passwordStrengthLabel = getPasswordStrengthLabel(form.password)
  const passwordStrengthTone = getPasswordStrengthTone(form.password)
  const hasTypedPassword = form.password.trim().length > 0
  const submitLabel = form.isSubmitting
    ? "Working..."
    : mode === "login"
      ? "Sign in"
      : mode === "register"
        ? "Create account"
        : mode === "forgot-password"
          ? "Send reset link"
          : "Update password"

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    form.resetMessages()

    if ((mode === "register" || mode === "reset-password") && form.password !== form.confirmPassword) {
      form.setErrorMessage("The passwords you entered do not match.")
      return
    }

    if (mode === "register" || mode === "reset-password") {
      const unfinishedRule = passwordRuleStates.find((rule) => !rule.passed)
      if (unfinishedRule) {
        form.setErrorMessage("Your password needs a little more variety before you can continue.")
        return
      }
    }

    form.setIsSubmitting(true)

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password })
        router.push("/move-out-readiness")
        router.refresh()
        return
      }

      if (mode === "register") {
        await register({
          email: form.email,
          fullName: form.fullName,
          password: form.password,
        })
        form.setSuccessMessage("Your account is ready. You can sign in now.")
        form.setPassword("")
        form.setConfirmPassword("")
        return
      }

      if (mode === "forgot-password") {
        const result = await requestPasswordReset({ email: form.email })
        form.setSuccessMessage(result.message)
        return
      }

      if (!resetTokens) {
        form.setErrorMessage("This reset link is missing a little bit of information.")
        return
      }

      const result = await submitPasswordReset({
        uidb64: resetTokens.uidb64,
        token: resetTokens.token,
        password: form.password,
      })

      form.setSuccessMessage(result.message)
      form.setPassword("")
      form.setConfirmPassword("")
    } catch (error) {
      form.setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      form.setIsSubmitting(false)
    }
  }

  const showPassword = mode !== "forgot-password"
  const showConfirmPassword = mode === "register" || mode === "reset-password"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/60 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">First Job Navigator</BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg font-semibold text-foreground">
                    {mode === "login"
                      ? "Sign In"
                      : mode === "register"
                        ? "Sign Up"
                        : mode === "forgot-password"
                          ? "Reset Password"
                          : "Choose New Password"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          <div className="w-full lg:mx-auto lg:max-w-3xl">
            <Card className="overflow-hidden border-[#b8c8db] bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f9_100%)] p-0 shadow-[0_20px_52px_rgba(13,19,33,0.14)] backdrop-blur-sm">
              <CardHeader className="px-6 pt-6 pb-0 sm:px-8">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                    First Job Navigator
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 text-balance">
                    {mode === "login"
                      ? "Sign in to your account"
                      : mode === "register"
                        ? "Start using First Job Navigator"
                        : mode === "forgot-password"
                          ? "Send a password reset link"
                          : "Choose a new password"}
                  </h1>
                  <p className="max-w-md text-sm leading-6 text-slate-600">
                    {mode === "login"
                      ? "Enter your email and password to continue."
                      : mode === "register"
                        ? "Create your account in a minute and keep everything in one place."
                        : mode === "forgot-password"
                          ? "We’ll send you a friendly email with a reset link."
                          : "Pick a password that feels easy for you and safe enough for your account."}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="px-6 py-6 sm:px-8">
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {mode === "register" ? (
                    <Field>
                      <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="fullName"
                          autoComplete="name"
                          value={form.fullName}
                          onChange={(event) => form.setFullName(event.target.value)}
                          placeholder="Alex Taylor"
                          className="h-11 rounded-xl border-[#c9d4e0] bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-[#748cab] focus-visible:ring-[#748cab]/30"
                          required
                        />
                      </div>
                      <FieldDescription className="text-slate-500">
                        This is the name we’ll use to personalise your account.
                      </FieldDescription>
                    </Field>
                  ) : null}

                  {mode !== "reset-password" ? (
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(event) => form.setEmail(event.target.value)}
                          placeholder="alex@example.com"
                          className="h-11 rounded-xl border-[#c9d4e0] bg-white pl-10 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-[#748cab] focus-visible:ring-[#748cab]/30"
                          required
                        />
                      </div>
                      <FieldDescription className="text-slate-500">
                        We’ll only use this for your account and password emails.
                      </FieldDescription>
                    </Field>
                  ) : null}

                  {showPassword ? (
                    <PasswordField
                      id="password"
                      label={mode === "reset-password" ? "New password" : "Password"}
                      value={form.password}
                      onChange={form.setPassword}
                      autoComplete={mode === "register" || mode === "reset-password" ? "new-password" : "current-password"}
                      placeholder={mode === "reset-password" ? "Enter your new password" : "Enter your password"}
                      showPassword={form.showPassword}
                      onToggleVisibility={form.togglePasswordVisibility}
                      helper={mode === "login" ? "Use the password you already created." : "Choose something secure and easy to remember."}
                      minLength={mode === "register" || mode === "reset-password" ? 8 : undefined}
                    />
                  ) : null}

                  {showConfirmPassword ? (
                    <PasswordField
                      id="confirmPassword"
                      label="Confirm password"
                      value={form.confirmPassword}
                      onChange={form.setConfirmPassword}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      showPassword={form.showConfirmPassword}
                      onToggleVisibility={form.toggleConfirmPasswordVisibility}
                      helper="Just to make sure we got it right."
                      minLength={8}
                    />
                  ) : null}

                  {showPassword && hasTypedPassword && (mode === "register" || mode === "reset-password") ? (
                    <div className="space-y-2 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Password guide
                        </span>
                        <span className={[
                          "text-xs font-medium",
                          passwordStrengthTone === "success" ? "text-emerald-700" : "",
                          passwordStrengthTone === "warning" ? "text-amber-700" : "",
                          passwordStrengthTone === "danger" ? "text-rose-700" : "",
                          passwordStrengthTone === "muted" ? "text-slate-500" : "",
                        ].join(" ")}>
                          {passwordStrengthLabel}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {passwordRuleStates.map((rule) => (
                          <div key={rule.label} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className={[
                              "mt-0.5 inline-flex h-4 w-4 items-center justify-center",
                              rule.passed ? "text-emerald-600" : "text-slate-400",
                            ].join(" ")}>
                              {rule.passed ? "✓" : "•"}
                            </span>
                            <div>
                              <p className="font-medium text-slate-800">{rule.label}</p>
                              <p className="text-[11px] leading-5 text-slate-500">{rule.description}</p>
                            </div>
                          </div>
                        ))}
                        <p className="pt-1 text-[11px] text-slate-500">{passwordBackendNote}</p>
                      </div>
                    </div>
                  ) : null}

                  {form.errorMessage ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {form.errorMessage}
                    </p>
                  ) : null}

                  {form.successMessage ? (
                    <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {form.successMessage}
                    </p>
                  ) : null}

                  <Button type="submit" disabled={form.isSubmitting} className="h-11 w-full rounded-xl bg-[#1d2d44] text-white hover:bg-[#243959]">
                    {submitLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                    {mode === "login" ? (
                      <>
                        <Link href="/register" className="font-medium text-[#3e5c76] underline-offset-4 hover:underline">
                          Create an account
                        </Link>
                        <Link href="/forgot-password" className="font-medium text-[#3e5c76] underline-offset-4 hover:underline">
                          Forgot password?
                        </Link>
                      </>
                    ) : null}

                    {mode === "register" ? (
                      <Link href="/login" className="font-medium text-[#3e5c76] underline-offset-4 hover:underline">
                        Sign in instead
                      </Link>
                    ) : null}

                    {mode === "forgot-password" ? (
                      <Link href="/login" className="font-medium text-[#3e5c76] underline-offset-4 hover:underline">
                        Back to sign in
                      </Link>
                    ) : null}

                    {mode === "reset-password" ? (
                      <Link href="/login" className="font-medium text-[#3e5c76] underline-offset-4 hover:underline">
                        Return to sign in
                      </Link>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
