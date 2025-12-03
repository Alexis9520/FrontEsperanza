"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"
import { type AccentColor } from "./types"

interface KpiCardProps {
  title: string
  value: string
  variation?: number
  hint?: string
  icon: LucideIcon
  accent?: AccentColor
  loading?: boolean
}

const accentStyles: Record<AccentColor, { bg: string; iconBg: string; iconText: string; border: string; glow: string }> = {
  primary: {
    bg: "bg-primary/[0.03]",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    border: "border-primary/20",
    glow: "group-hover:shadow-primary/20"
  },
  emerald: {
    bg: "bg-emerald-500/[0.03]",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-500",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/20"
  },
  amber: {
    bg: "bg-amber-500/[0.03]",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-500",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-amber-500/20"
  },
  red: {
    bg: "bg-red-500/[0.03]",
    iconBg: "bg-red-500/10",
    iconText: "text-red-500",
    border: "border-red-500/20",
    glow: "group-hover:shadow-red-500/20"
  },
  violet: {
    bg: "bg-violet-500/[0.03]",
    iconBg: "bg-violet-500/10",
    iconText: "text-violet-500",
    border: "border-violet-500/20",
    glow: "group-hover:shadow-violet-500/20"
  },
  blue: {
    bg: "bg-blue-500/[0.03]",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-500",
    border: "border-blue-500/20",
    glow: "group-hover:shadow-blue-500/20"
  },
  cyan: {
    bg: "bg-cyan-500/[0.03]",
    iconBg: "bg-cyan-500/10",
    iconText: "text-cyan-500",
    border: "border-cyan-500/20",
    glow: "group-hover:shadow-cyan-500/20"
  }
}

export function KpiCard({ title, value, variation, hint, icon: Icon, accent = "primary", loading }: KpiCardProps) {
  const styles = accentStyles[accent]
  const isPositive = (variation ?? 0) >= 0

  if (loading) {
    return (
      <Card className={cn(
        "relative overflow-hidden group",
        "border-border/50 bg-card/50 backdrop-blur-sm"
      )}>
        <CardContent className="p-4 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-8 w-28 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
            <div className="h-10 w-10 bg-muted rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden group cursor-default",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 ease-out",
      "hover:shadow-lg hover:scale-[1.02]",
      styles.bg,
      styles.border,
      styles.glow
    )}>
      {/* Animated gradient border on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-r from-transparent via-white/5 to-transparent",
        "-translate-x-full group-hover:translate-x-full transition-transform duration-1000"
      )} />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            
            {variation !== undefined && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md",
                  isPositive 
                    ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" 
                    : "text-red-600 bg-red-500/10 dark:text-red-400"
                )}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}{variation.toFixed(1)}%
                </span>
                {hint && (
                  <span className="text-xs text-muted-foreground">{hint}</span>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            "transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            styles.iconBg
          )}>
            <Icon className={cn("h-5 w-5", styles.iconText)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
