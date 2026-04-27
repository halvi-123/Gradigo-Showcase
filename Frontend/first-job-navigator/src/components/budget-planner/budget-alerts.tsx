"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

function classifyAlert(alert: string): "critical" | "warning" | "info" {
  const lower = alert.toLowerCase()
  if (lower.includes("exceeded") || lower.includes("over budget") || lower.includes("more than your monthly")) return "critical"
  if (lower.includes("50%") || lower.includes("quite high") || lower.includes("looks quite")) return "warning"
  return "info"
}

const severityStyles = {
  critical: {
    bg: "bg-red-500/15",
    border: "border-red-400/40",
    text: "text-red-300",
    icon: "text-red-400",
  },
  warning: {
    bg: "bg-yellow-500/15",
    border: "border-yellow-400/40",
    text: "text-yellow-200",
    icon: "text-yellow-400",
  },
  info: {
    bg: "bg-blue-500/15",
    border: "border-blue-400/40",
    text: "text-blue-200",
    icon: "text-blue-400",
  },
}

export function BudgetAlerts({ alerts }: { alerts: string[] }) {
  const critical = alerts.filter(a => classifyAlert(a) === "critical").length
  const warnings = alerts.filter(a => classifyAlert(a) === "warning").length

  return (
    <Card className="bg-[#0d1321] border-border/60 text-white shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
            <p className="text-sm text-white/60">Important warnings about your spending behaviour.</p>
          </div>
          {alerts.length > 0 && (
            <div className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${critical > 0 ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}`}>
              {alerts.length} {alerts.length === 1 ? "alert" : "alerts"}
            </div>
          )}
        </div>
      </CardHeader>
      <Separator className="bg-white/20 mb-4 mx-6" />
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg bg-white/10 border border-white/20 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">All clear!</p>
              <p className="text-xs text-white/60 mt-0.5">No spending issues detected. Your budget is on track this month.</p>
            </div>
          </div>
        ) : (
          <>
            {alerts.map((a, i) => {
              const severity = classifyAlert(a)
              const styles = severityStyles[severity]
              return (
                <div key={i} className={`flex items-start gap-3 rounded-lg ${styles.bg} border ${styles.border} px-4 py-3`}>
                  <AlertTriangle className={`h-4 w-4 ${styles.icon} shrink-0 mt-0.5`} />
                  <p className={`text-sm ${styles.text} leading-relaxed`}>{a}</p>
                </div>
              )
            })}
            <p className="text-xs text-white/40 pt-1">
              {critical > 0 && `${critical} critical${warnings > 0 ? ` · ${warnings} warning${warnings > 1 ? "s" : ""}` : ""}`}
              {critical === 0 && warnings > 0 && `${warnings} warning${warnings > 1 ? "s" : ""}`}
              {" — "}Visit the Spending tab to review your categories.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}