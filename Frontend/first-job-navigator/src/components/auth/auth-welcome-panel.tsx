import { CheckCircle2, Sparkles } from "lucide-react"

const highlightItems = [
  "See your real monthly take-home pay",
  "Build a budget you can actually stick to",
  "Estimate move-out readiness by area",
  "Track progress as you settle into work",
]

export function AuthWelcomePanel() {
  return (
    <div className="space-y-6 pr-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        Welcome to First Job Navigator
      </div>

      <div className="space-y-3">
        <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-foreground text-balance">
          Start your career journey with clarity.
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          From salary planning to move-out confidence, this is your all-in-one financial starter toolkit.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {highlightItems.map((item) => (
          <div key={item} className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm">
            <div className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>{item}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
