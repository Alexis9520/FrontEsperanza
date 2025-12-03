"use client"

import { Boxes, Activity, ShieldAlert, AlertTriangle } from "lucide-react"
import clsx from "clsx"

interface ProductMetricsProps {
  metricas: {
    productos: number
    unidades: number
    criticos: number
    vencidos: number
  } | null
  loading: boolean
}

export function ProductMetrics({ metricas, loading }: ProductMetricsProps) {
  const m = metricas || { productos: 0, unidades: 0, criticos: 0, vencidos: 0 }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Boxes}
        label="Productos"
        value={m.productos}
        loading={loading}
        accent="from-cyan-400/25 to-cyan-700/10"
      />
      <MetricCard
        icon={Activity}
        label="Unidades"
        value={m.unidades}
        loading={loading}
        accent="from-indigo-400/25 to-indigo-700/10"
      />
      <MetricCard
        icon={ShieldAlert}
        label="Stock crítico"
        value={m.criticos}
        loading={loading}
        accent="from-amber-400/30 to-amber-700/10"
        warn={m.criticos > 0}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Lotes vencidos"
        value={m.vencidos}
        loading={loading}
        accent="from-red-400/30 to-red-700/10"
        danger={m.vencidos > 0}
      />
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  warn,
  danger,
  loading
}: {
  icon: React.ComponentType<any>
  label: string
  value: number | string
  accent: string
  warn?: boolean
  danger?: boolean
  loading?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(17,25,38,0.85)_0%,rgba(14,20,30,0.75)_60%,rgba(10,15,24,0.85)_100%)] backdrop-blur-md p-4 flex flex-col gap-3">
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_35%_20%,rgba(56,189,248,0.18),transparent_60%)]" />
      <div
        className={clsx(
          "absolute inset-0 pointer-events-none",
          "bg-gradient-to-br",
          accent,
          "opacity-30"
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-900/50 ring-1 ring-white/10">
          <Icon
            className={clsx(
              "h-5 w-5",
              danger
                ? "text-red-400"
                : warn
                  ? "text-amber-400"
                  : "text-cyan-300"
            )}
          />
        </div>
      </div>
      <div
        className={clsx(
          "relative text-2xl font-semibold tabular-nums tracking-tight",
          danger
            ? "text-red-300"
            : warn
              ? "text-amber-300"
              : "text-slate-100"
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
          value
        )}
      </div>
    </div>
  )
}
