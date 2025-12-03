import React from "react"
import { clsx } from "clsx"
import { ProductSummary } from "../types"
import { Badge } from "@/components/ui/badge"

export function InfoBox({ label, value, accent, wide }: { label: string, value: any, accent?: string, wide?: boolean }) {
  return (
    <div className={clsx("p-2 border rounded-lg bg-background/50 backdrop-blur-sm flex flex-col gap-0.5",
      "hover:shadow-sm transition-shadow",
      wide && "col-span-2"
    )}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={clsx("text-xs font-semibold tabular-nums", accent)}>{value}</div>
    </div>
  )
}

export function FragmentRows({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function estadoStock(p: ProductSummary): { variant: "default" | "destructive" | "outline" | "secondary", texto: string } {
  if (p.cantidadGeneral === 0) return { variant: "destructive", texto: "Agotado" }
  if (p.cantidadGeneral <= p.cantidadMinima) return { variant: "destructive", texto: "Crítico" }
  if (p.cantidadGeneral <= p.cantidadMinima * 2) return { variant: "secondary", texto: "Bajo" }
  return { variant: "outline", texto: "Normal" }
}

export function BarraStock({ p }: { p: ProductSummary }) {
  const min = p.cantidadMinima
  const current = p.cantidadGeneral
  const pct = min > 0 ? Math.min(100, Math.round((current / (min * 2)) * 100)) : 100
  const color =
    current === 0 ? "bg-red-600"
      : current <= min ? "bg-red-500"
        : current <= min * 2 ? "bg-amber-500"
          : "bg-emerald-500"
  return (
    <div className="space-y-1 w-32">
      <div className="h-1.5 w-full bg-gradient-to-r from-zinc-200/60 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 rounded overflow-hidden">
        <div className={clsx("h-full transition-all duration-500 ease-out", color)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{current} u</span>
        {min > 0 && <span>Min {min}</span>}
      </div>
    </div>
  )
}

export function BarraEstadosLotes({ p }: { p: ProductSummary }) {
  const totalU = p.cantidadGeneral || 1
  const venc = p.unidadesVencidas
  const riesgo30 = p.unidadesRiesgo30d
  const vig = Math.max(0, totalU - venc - riesgo30)
  return (
    <div className="w-40">
      <div className="h-2 flex rounded overflow-hidden ring-1 ring-border/50">
        <div className="bg-emerald-500/80 backdrop-blur-sm" style={{ width: `${(vig / totalU) * 100}%` }} />
        <div className="bg-amber-400/80 backdrop-blur-sm" style={{ width: `${(riesgo30 / totalU) * 100}%` }} />
        <div className="bg-red-500/80 backdrop-blur-sm" style={{ width: `${(venc / totalU) * 100}%` }} />
      </div>
      <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
        <span>Vig {vig}</span>
        <span>30d {riesgo30}</span>
        <span>Venc {venc}</span>
      </div>
    </div>
  )
}
