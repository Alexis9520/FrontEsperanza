"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AccentColor = "primary" | "amber" | "emerald" | "red" | "violet" | "blue"

const accentStyles: Record<AccentColor, { bg: string; iconBg: string; iconText: string; border: string }> = {
  primary: {
    bg: "bg-primary/[0.03]",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    border: "border-primary/20"
  },
  amber: {
    bg: "bg-amber-500/[0.03]",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-600 dark:text-amber-500",
    border: "border-amber-500/20"
  },
  emerald: {
    bg: "bg-emerald-500/[0.03]",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600 dark:text-emerald-500",
    border: "border-emerald-500/20"
  },
  red: {
    bg: "bg-red-500/[0.03]",
    iconBg: "bg-red-500/10",
    iconText: "text-red-600 dark:text-red-500",
    border: "border-red-500/20"
  },
  violet: {
    bg: "bg-violet-500/[0.03]",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-600 dark:text-violet-500",
    border: "border-violet-500/20"
  },
  blue: {
    bg: "bg-blue-500/[0.03]",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-600 dark:text-blue-500",
    border: "border-blue-500/20"
  }
}

export function StatCard({
  icon: Icon,
  title,
  value,
  hint,
  loading,
  accent = "primary",
}: {
  icon?: LucideIcon
  title: string
  value: string | number | null | undefined
  hint?: string
  loading?: boolean
  accent?: AccentColor
}) {
  const styles = accentStyles[accent]

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "hover:shadow-md hover:scale-[1.01]",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      styles.bg,
      styles.border
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </div>
            {loading ? (
              <div className="h-7 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold tracking-tight">{value ?? "—"}</div>
            )}
            {hint && (
              <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              styles.iconBg
            )}>
              <Icon className={cn("w-5 h-5", styles.iconText)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}