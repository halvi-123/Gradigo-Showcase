"use client"

import * as React from "react"

import { passwordRules } from "@/lib/auth/password-rules"

export type AuthMode = "login" | "register" | "forgot-password" | "reset-password"

export type AuthFormConfig = {
  mode: AuthMode
  initialEmail?: string
  initialFullName?: string
  initialPassword?: string
  initialConfirmPassword?: string
}

export function useAuthForm(config: AuthFormConfig) {
  const [email, setEmail] = React.useState(config.initialEmail ?? "")
  const [fullName, setFullName] = React.useState(config.initialFullName ?? "")
  const [password, setPassword] = React.useState(config.initialPassword ?? "")
  const [confirmPassword, setConfirmPassword] = React.useState(config.initialConfirmPassword ?? "")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const isRegisterMode = config.mode === "register"
  const isResetMode = config.mode === "reset-password"
  const needsFullName = isRegisterMode
  const needsConfirmPassword = isRegisterMode || isResetMode
  const passwordRuleCount = passwordRules.length

  function resetMessages() {
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  function togglePasswordVisibility() {
    setShowPassword((current) => !current)
  }

  function toggleConfirmPasswordVisibility() {
    setShowConfirmPassword((current) => !current)
  }

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    showConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    isSubmitting,
    setIsSubmitting,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    resetMessages,
    isRegisterMode,
    isResetMode,
    needsFullName,
    needsConfirmPassword,
    passwordRuleCount,
  }
}
