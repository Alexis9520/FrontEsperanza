import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, ArrowDown } from "lucide-react"
import clsx from "clsx"

/* -------------------- MetricCard Types -------------------- */
interface MetricCardProps {
  icon?: React.ComponentType<any> | React.ReactNode
  title?: string
  label?: string
  value: string | number
  valuePrev?: string
  variation?: number
  diff?: number
  subtitle?: string
  accent?: string
  warn?: boolean
  danger?: boolean
  loading?: boolean
}

/* -------------------- MetricCard Component -------------------- */
export function MetricCard({
  icon: Icon,
  title,
  label,
  value,
  valuePrev,
  variation,
  diff,
  subtitle,
  accent,
  warn,
  danger,
  loading
}: MetricCardProps) {
  const displayTitle = title || label
  const hasVariation = typeof variation === "number"
  const positive = variation ? variation >= 0 : false

  // Style for glass effect
  const glassClasses = accent
    ? [
        "relative overflow-hidden rounded-xl border border-border/60 bg-background/70 backdrop-blur-xl",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-90",
        `before:${accent}`,
        "hover:shadow-[0_0_0_2px_#f0abfc55,0_4px_30px_-5px_#f0abfc33] transition-shadow"
      ].join(" ")
    : "relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(17,25,38,0.85)_0%,rgba(14,20,30,0.75)_60%,rgba(10,15,24,0.85)_100%)] backdrop-blur-md"

  // Render icon
  const renderIcon = () => {
    if (!Icon) return null
    if (typeof Icon === "function") {
      const IconComponent = Icon as React.ComponentType<any>
      return (
        <IconComponent
          className={clsx(
            "h-5 w-5",
            danger ? "text-red-400" : warn ? "text-amber-400" : "text-cyan-300"
          )}
        />
      )
    }
    return Icon
  }

  return (
    <Card className={glassClasses}>
      {/* Decorative background gradient */}
      {accent && (
        <div
          className={clsx(
            "absolute inset-0 pointer-events-none bg-gradient-to-br opacity-30",
            accent
          )}
        />
      )}

      {/* Hover effect */}
      {accent && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_35%_20%,rgba(56,189,248,0.18),transparent_60%)]" />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 relative z-10">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {displayTitle}
        </CardTitle>
        {Icon && (
          <div
            className={clsx(
              accent
                ? "p-1.5 rounded-md bg-gradient-to-br from-primary/40 via-blue-500/20 to-fuchsia-500/10 text-primary shadow"
                : "h-9 w-9 rounded-lg flex items-center justify-center bg-slate-900/50 ring-1 ring-white/10"
            )}
          >
            {renderIcon()}
          </div>
        )}
      </CardHeader>

      <CardContent className="relative z-10 space-y-3">
        {/* Value display */}
        <div
          className={clsx(
            "text-2xl font-bold tracking-tight tabular-nums flex items-end gap-2",
            !accent &&
              (danger
                ? "text-red-300"
                : warn
                ? "text-amber-300"
                : "text-slate-100")
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-emerald-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm font-medium">Cargando...</span>
            </div>
          ) : (
            <>
              <span>{value}</span>
              {valuePrev && (
                <span className="text-xs text-muted-foreground/80 font-semibold">
                  <ArrowDown className="inline-block w-3 h-3 align-[-3px]" /> Prev:{" "}
                  {valuePrev}
                </span>
              )}
            </>
          )}
        </div>

        {/* Variation and diff display */}
        {hasVariation && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={
                positive
                  ? "text-emerald-500 flex items-center gap-1"
                  : "text-red-500 flex items-center gap-1"
              }
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {positive ? "+" : ""}
              {variation.toFixed(2)}%
            </span>
            {diff !== undefined && (
              <span
                className={
                  diff > 0
                    ? "text-emerald-500"
                    : diff < 0
                    ? "text-red-500"
                    : ""
                }
              >
                {diff === 0
                  ? "Igual"
                  : diff > 0
                  ? `Hoy +${diff.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`
                  : `Hoy -${Math.abs(diff).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`}
              </span>
            )}
            {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
          </div>
        )}

        {/* Progress bar for variation */}
        {hasVariation && (
          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div
              className={
                positive
                  ? "h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "h-full bg-gradient-to-r from-red-500 to-pink-500"
              }
              style={{ width: `${Math.min(100, Math.abs(variation))}%` }}
            />
          </div>
        )}
      </CardContent>

      {/* Card aura effect */}
      {accent && (
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.2),rgba(0,0,0,.8))]">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-white/5 via-white/0 to-fuchsia-500/10 opacity-70" />
        </div>
      )}
    </Card>
  )
}
