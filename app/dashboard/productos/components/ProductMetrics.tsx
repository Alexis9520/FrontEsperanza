"use client"

import { Boxes, Activity, ShieldAlert, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Boxes}
        label="Productos"
        value={m.productos}
        loading={loading}
        accentBg="bg-primary/[0.03]"
        accentBorder="border-primary/20"
        iconColor="text-primary"
        valueColor="text-foreground"
      />
      <MetricCard
        icon={Activity}
        label="Unidades"
        value={m.unidades}
        loading={loading}
        accentBg="bg-blue-500/[0.03]"
        accentBorder="border-blue-500/20"
        iconColor="text-blue-500"
        valueColor="text-foreground"
      />
      <MetricCard
        icon={ShieldAlert}
        label="Stock crítico"
        value={m.criticos}
        loading={loading}
        accentBg="bg-amber-500/[0.03]"
        accentBorder="border-amber-500/20"
        iconColor="text-amber-500"
        valueColor={m.criticos > 0 ? "text-amber-600 dark:text-amber-500" : "text-foreground"}
      />
      <MetricCard
        icon={AlertTriangle}
        label="Lotes vencidos"
        value={m.vencidos}
        loading={loading}
        accentBg="bg-red-500/[0.03]"
        accentBorder="border-red-500/20"
        iconColor="text-red-500"
        valueColor={m.vencidos > 0 ? "text-red-600 dark:text-red-500" : "text-foreground"}
      />
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  accentBg,
  accentBorder,
  iconColor,
  valueColor,
  loading
}: {
  icon: React.ComponentType<any>
  label: string
  value: number | string
  accentBg: string
  accentBorder: string
  iconColor: string
  valueColor: string
  loading?: boolean
}) {
  return (
    <Card className={clsx("border", accentBorder, accentBg, "backdrop-blur-sm")}>
      <CardContent className="py-4 px-4 flex items-center gap-4">
        <div className={clsx(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
          accentBg.replace("[0.03]", "[0.1]"),
          "border",
          accentBorder
        )}>
          <Icon className={clsx("h-5 w-5", iconColor)} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">{label}</span>
          {loading ? (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Cargando...</span>
            </div>
          ) : (
            <span className={clsx("text-2xl font-bold tabular-nums", valueColor)}>
              {value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

