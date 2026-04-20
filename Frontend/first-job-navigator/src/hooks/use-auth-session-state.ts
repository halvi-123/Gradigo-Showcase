"use client"

import { useEffect, useMemo, useState } from "react"

import { fetchCurrentUser, logout, type AuthUser } from "@/lib/auth/service"
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  getStoredAuthSession,
  setAuthSession,
} from "@/lib/auth/session"

type AuthSessionState = {
  isAuthenticated: boolean
  isLoading: boolean
  user: {
    name: string
    email: string
  } | null
  logoutUser: () => Promise<void>
}

let pendingValidation: Promise<AuthUser | null> | null = null

function getStoredUser() {
  const session = getStoredAuthSession()

  if (!session) {
    return null
  }

  return {
    name: session.fullName || "User",
    email: session.email || "",
  }
}

async function validateAuthSession(): Promise<AuthUser | null> {
  if (!getStoredAuthSession()) {
    return null
  }

  if (!pendingValidation) {
    pendingValidation = fetchCurrentUser()
      .then((user) => {
        const currentSession = getStoredAuthSession()

        if (currentSession) {
          setAuthSession({
            ...currentSession,
            email: user.email,
            fullName: user.fullName,
          })
        }

        return user
      })
      .catch(() => {
        clearAuthSession()
        return null
      })
      .finally(() => {
        pendingValidation = null
      })
  }

  return pendingValidation
}

export function useAuthSessionState(): AuthSessionState {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => getStoredUser())

  useEffect(() => {
    let isMounted = true

    async function runValidation() {
      const validatedUser = await validateAuthSession()

      if (!isMounted) {
        return
      }

      if (validatedUser) {
        setUser({
          name: validatedUser.fullName || "User",
          email: validatedUser.email,
        })
      } else {
        setUser(null)
      }

      setIsLoading(false)
    }

    void runValidation()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function syncFromStorage() {
      const storedUser = getStoredUser()
      setUser(storedUser)
      setIsLoading(false)

      if (storedUser) {
        void validateAuthSession().then((validatedUser) => {
          if (!validatedUser) {
            setUser(null)
            return
          }

          setUser({
            name: validatedUser.fullName || "User",
            email: validatedUser.email,
          })
        })
      }
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, syncFromStorage)
    window.addEventListener("storage", syncFromStorage)

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, syncFromStorage)
      window.removeEventListener("storage", syncFromStorage)
    }
  }, [])

  async function logoutUser() {
    try {
      await logout()
    } catch {
      clearAuthSession()
    }

    setUser(null)
  }

  return useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      logoutUser,
    }),
    [isLoading, user],
  )
}
