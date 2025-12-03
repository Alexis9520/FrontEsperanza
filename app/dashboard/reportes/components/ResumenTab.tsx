import React from "react"
import {
  FileText,
  ShoppingBag,
  TrendingUp,
  FileBarChart2,
  WalletMinimal,
  PieChart,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "./StatCard"
import { PaymentDonut, Legend } from "./PaymentMixChart"
import { type SalesSummary, type PaymentMix } from "@/lib/api"
import { cn } from "@/lib/utils"

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }) : "—"

function KpiCompact({ title, value, accent = "primary" }: { title: string; value: number; accent?: "primary" | "emerald" | "red" }) {
  const accentColors = {
    primary: "border-primary/20 bg-primary/[0.03]",
    emerald: "border-emerald-500/20 bg-emerald-500/[0.03]",
    red: "border-red-500/20 bg-red-500/[0.03]"
  }
  return (
    <div className={cn(
      "flex-1 border rounded-lg p-3 transition-all duration-200 hover:shadow-sm",
      accentColors[accent]
    )}>
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="text-lg font-bold mt-1">{fmtMoney(value)}</div>
    </div>
  )
}

function Row({ label, value, danger, className = "" }: { label: string; value: string; danger?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", danger && "text-red-500 dark:text-red-400")}>{value}</span>
    </div>
  )
}

interface ResumenTabProps {
  summary: SalesSummary | null
  loading: boolean
  caja: {
    ingresosVentas: number
    ingresosManuales: number
    ventasEfectivo: number
    cajaEgresos: number
    cajaNetoRaw: number
    cajaIngresosTotal: number
    cajaIngresosPct: number
    cajaEgresosPct: number
    cajaMarginPct: number
  }
  payMix: PaymentMix[]
}

export function ResumenTab({ summary, loading, caja, payMix }: ResumenTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} title="Ventas" value={fmtMoney(summary?.ventas)} hint="Total período" loading={loading} accent="primary" />
        <StatCard icon={ShoppingBag} title="Tickets" value={summary?.tickets?.toLocaleString() ?? "—"} hint="Cantidad" loading={loading} accent="violet" />
        <StatCard icon={TrendingUp} title="Ticket prom." value={fmtMoney(summary?.ticket_promedio)} hint="Promedio por ticket" loading={loading} accent="emerald" />
        <StatCard icon={FileBarChart2} title="UPT" value={summary?.upt?.toFixed(2) ?? "—"} hint="Unidades por ticket" loading={loading} accent="amber" />
      </div>

      {/* Caja + Canales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cn(
          "h-full transition-all duration-300",
          "border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:shadow-md"
        )}>
          <CardHeader className="pb-2 flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <WalletMinimal className="w-4 h-4 text-emerald-500" />
                </div>
                Caja
              </CardTitle>
              <CardDescription className="mt-1">Desglose: ingresos manuales, ventas en efectivo y egresos</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* KPIs compactos */}
            <div className="flex gap-3">
              <KpiCompact title="Ingresos (total)" value={caja.cajaIngresosTotal} accent="emerald" />
              <KpiCompact title="Egresos" value={caja.cajaEgresos} accent="red" />
              <KpiCompact title="Neto" value={caja.cajaNetoRaw} accent="primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lista + distribución */}
              <div className="space-y-3">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Movimientos y efectivo</div>
                <div className="space-y-2 text-sm">
                  <Row label="Ingresos manuales" value={fmtMoney(caja.ingresosManuales)} />
                  <Row label="Ventas en efectivo" value={fmtMoney(caja.ventasEfectivo)} />
                  <Row label="Egresos" value={fmtMoney(caja.cajaEgresos)} danger />
                </div>

                <div className="pt-3">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Distribución</div>
                  <div className="space-y-2 text-sm">
                    <Row label="Ingresos" value={fmtMoney(caja.cajaIngresosTotal)} />
                    <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${caja.cajaIngresosPct}%` }} />
                    </div>
                    <Row className="mt-2" label="Egresos" value={fmtMoney(caja.cajaEgresos)} />
                    <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${caja.cajaEgresosPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Margen Neto compacto */}
              <div className={cn(
                "flex items-center justify-center border rounded-xl p-4",
                "border-primary/20 bg-primary/[0.03]"
              )}>
                <div className="text-center">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Margen Neto</div>
                  <div className="text-3xl font-bold mt-2 text-primary">{caja.cajaIngresosTotal > 0 ? `${caja.cajaMarginPct.toFixed(1)}%` : "—"}</div>
                  <div className="text-xs text-muted-foreground mt-1">Neto / Ingresos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "h-full transition-all duration-300",
          "border-border/50 bg-card/50 backdrop-blur-sm",
          "hover:shadow-md"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-violet-500" />
              </div>
              Canales de pago
            </CardTitle>
            <CardDescription className="mt-1">Distribución por método</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start gap-6">
              <div className="w-36 h-36 flex-shrink-0">
                <PaymentDonut mix={payMix} compact />
              </div>
              <div className="flex-1">
                <Legend mix={payMix} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
