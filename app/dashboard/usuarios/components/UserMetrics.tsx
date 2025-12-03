import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AccentColor = "primary" | "amber" | "emerald" | "blue" | "red"

const accentStyles: Record<AccentColor, { icon: string; value: string; border: string }> = {
  primary: {
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
    border: "border-primary/20 hover:border-primary/40"
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-500",
    value: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20 hover:border-amber-500/40"
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-500",
    value: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20 hover:border-emerald-500/40"
  },
  blue: {
    icon: "bg-blue-500/10 text-blue-500",
    value: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20 hover:border-blue-500/40"
  },
  red: {
    icon: "bg-red-500/10 text-red-500",
    value: "text-red-600 dark:text-red-400",
    border: "border-red-500/20 hover:border-red-500/40"
  }
}

export function MetricCard({
  title,
  subtitle,
  value,
  icon,
  accent = "primary"
}: {
  title: string
  subtitle: string
  value: number | string
  icon: React.ReactNode
  accent?: AccentColor
}) {
  const styles = accentStyles[accent]

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "bg-card/50 backdrop-blur-sm border",
      "hover:shadow-md",
      styles.border
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <div className={cn("text-3xl font-bold tabular-nums", styles.value)}>
              {value}
            </div>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            styles.icon
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
