import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, Calendar, TrendingUp } from "lucide-react"
import { formatMoney } from "../utils"

interface StockKpiCardsProps {
  kpis: {
    totalProductos: number
    productosCriticos: number
    productosConVencimiento30d: number
    productosVencidos: number
    valorInventarioCosto: number
    valorInventarioVenta: number
    margenPotencialTotal: number
    porcentajeStockEnRiesgo: number
  }
}

export function StockKpiCards({ kpis }: StockKpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Productos</CardTitle>
          <Package className="h-4 w-4 text-primary/70" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tabular-nums">{kpis.totalProductos}</div>
          <p className="text-xs text-muted-foreground mt-1">Total en esta página</p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Críticos</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-red-600 tabular-nums">{kpis.productosCriticos}</div>
          <p className="text-xs text-muted-foreground mt-1">Stock ≤ mínimo (página)</p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próx. Venc.</CardTitle>
          <Calendar className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold text-orange-600 tabular-nums">{kpis.productosConVencimiento30d}</div>
          <p className="text-xs text-muted-foreground mt-1">≤ 30 días (página)</p>
        </CardContent>
      </Card>
      <Card className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor (Costo)</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold text-emerald-600">{formatMoney(kpis.valorInventarioCosto)}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Venta: {formatMoney(kpis.valorInventarioVenta)} — Margen: {formatMoney(kpis.margenPotencialTotal)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
