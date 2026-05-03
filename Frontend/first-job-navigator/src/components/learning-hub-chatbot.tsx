"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { buildBearerAuthHeaders, getStoredAccessToken } from "@/lib/auth/session"
import { getApiBaseUrl } from "@/lib/api/base-url"

function getAuthHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...buildBearerAuthHeaders(),
  }
}

type Message = {
  role: "user" | "assistant"
  content: string
}

export function LearningHubChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function getOrCreateSession(): Promise<number> {
    if (sessionId) return sessionId
    const response = await fetch(`${getApiBaseUrl()}/api/chatbot/sessions/`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to create session")
    const data = await response.json()
    const newSessionId = data.session_id
    setSessionId(newSessionId)
    return newSessionId
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const token = getStoredAccessToken()
    if (!token) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Please log in to use the chatbot."
      }])
      setInput("")
      return
    }

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const sid = await getOrCreateSession()
      const response = await fetch(`${getApiBaseUrl()}/api/chatbot/sessions/${sid}/send/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: userMessage }),
      })

      if (!response.ok) throw new Error("Failed to send message")
      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.assistant_message.content }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm unable to respond right now. Please try again later." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-border/60 bg-[#0d1321] text-white shadow-none h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Chatbot</CardTitle>
        <p className="text-xs text-[#f0ebd8]/70 break-words">
          For specific and intricate questions use the chat bot.{" "}
          <span className="text-red-400">The bot cannot give financial advice.</span>
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-48 overflow-y-auto rounded-lg bg-[#1d2d44] p-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-xs text-[#f0ebd8]/50 text-center mt-4">Ask a question to get started!</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[#3e5c76] text-white"
                  : "bg-[#0d1321] border border-[#3e5c76]/50 text-[#f0ebd8]"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#0d1321] border border-[#3e5c76]/50 rounded-lg px-3 py-2 text-sm text-[#f0ebd8]/50">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            className="bg-[#1d2d44] border-[#3e5c76]/50 text-white placeholder:text-[#f0ebd8]/30"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#748cab] hover:bg-[#3e5c76] text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}