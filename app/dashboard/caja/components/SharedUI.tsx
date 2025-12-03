import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm", className)}>
      <div className="relative z-10">{children}</div>
    </Card>
  )
}

// BackgroundFX ya no se usa - el fondo está en page.tsx
export function BackgroundFX() {
  return null
}

interface MetricCardProps {
  title: string
  value: number | null
  icon: React.ReactNode
  suffix?: string
  accent?: "primary" | "emerald" | "red" | "blue" | "amber"
  footer?: string
  positive?: boolean
  negative?: boolean
}

const accentStyles = {
  primary: "border-primary/20 bg-primary/[0.03]",
  emerald: "border-emerald-500/20 bg-emerald-500/[0.03]",
  red: "border-red-500/20 bg-red-500/[0.03]",
  blue: "border-blue-500/20 bg-blue-500/[0.03]",
  amber: "border-amber-500/20 bg-amber-500/[0.03]",
}

const iconStyles = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
  red: "bg-red-500/10 text-red-600 dark:text-red-500",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-500",
}

export function MetricCard({
  title,
  value,
  icon,
  suffix = "",
  accent = "primary",
  footer,
  positive,
  negative
}: MetricCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={cn(
          "relative overflow-hidden border backdrop-blur-sm",
          "transition-all duration-200",
          "hover:shadow-lg hover:shadow-black/5",
          accentStyles[accent]
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-0.5">
            <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {title}
            </CardTitle>
            {footer && (
              <p className="text-[10px] text-muted-foreground/70 uppercase">
                {footer}
              </p>
            )}
          </div>
          <div
            className={cn(
              "p-2 rounded-lg",
              iconStyles[accent]
            )}
          >
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold tabular-nums",
              positive && "text-emerald-600 dark:text-emerald-500",
              negative && "text-red-600 dark:text-red-500",
              !positive && !negative && "text-foreground"
            )}
          >
            {value != null ? `${suffix} ${value.toFixed(2)}` : "--"}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function FancyTab({
  value,
  children,
  icon
}: {
  value: string
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "relative px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2",
        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-primary/10",
        "data-[state=active]:text-primary shadow-none",
        "transition-all hover:bg-muted/50"
      )}
    >
      {icon}
      {children}
    </TabsTrigger>
  )
}

export function MetricList({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background/50 backdrop-blur p-4 space-y-2 text-xs">
      {children}
    </div>
  )
}

export function MetricRow({
  label,
  value,
  positive,
  negative,
  accent,
  bold
}: {
  label: string
  value: number | undefined
  positive?: boolean
  negative?: boolean
  accent?: "cyan" | "blue" | "purple"
  bold?: boolean
}) {
  const color =
    positive
      ? "text-emerald-500"
      : negative
      ? "text-red-500"
      : accent === "cyan"
      ? "text-cyan-500"
      : accent === "blue"
      ? "text-blue-500"
      : accent === "purple"
      ? "text-purple-500"
      : "text-foreground"
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          color,
          bold && "font-semibold",
          !positive && !negative && !bold && "font-medium"
        )}
      >
        {value != null ? `S/ ${value.toFixed(2)}` : "--"}
      </span>
    </div>
  )
}

export function DiferenciaCierreCard({ diferencia }: { diferencia: number | undefined }) {
  if (diferencia === undefined || diferencia === 0) return null
  const esFaltante = diferencia < 0
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={cn(
        "rounded-md border px-3 py-2 text-xs font-medium flex items-center justify-between",
        esFaltante
          ? "border-red-500/30 bg-red-500/10 text-red-600"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
      )}
    >
      <span>{esFaltante ? "Faltante:" : "Sobrante:"}</span>
      <span className="tabular-nums font-bold">
        S/ {Math.abs(diferencia).toFixed(2)}
      </span>
    </motion.div>
  )
}
