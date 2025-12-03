"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Truck, Package, Calendar, ArrowRight } from "lucide-react"
import { type Pedidos } from "./types"

interface PedidosCardProps {
  pedidos: Pedidos
  loading?: boolean
}

export function PedidosCard({ pedidos, loading }: PedidosCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 hover:shadow-md"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Truck className="h-4 w-4 text-blue-500" />
          </div>
          Pedidos
        </CardTitle>
        <CardDescription>Resumen de pedidos a proveedores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-3 rounded-lg",
            "bg-blue-500/5 border border-blue-500/10"
          )}>
            <p className="text-xs text-muted-foreground">Hoy</p>
            <p className="text-xl font-bold text-blue-500">{pedidos.totalHoy}</p>
          </div>
          <div className={cn(
            "p-3 rounded-lg",
            "bg-emerald-500/5 border border-emerald-500/10"
          )}>
            <p className="text-xs text-muted-foreground">Este mes</p>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-emerald-500">{pedidos.totalMes}</p>
              {pedidos.variacionMes > 0 && (
                <span className="text-[10px] text-emerald-500">+{pedidos.variacionMes.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Mini chart - Serie últimos días */}
        {pedidos.serieUltimosDias.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Últimos días</p>
            <div className="flex items-end gap-1 h-12">
              {pedidos.serieUltimosDias.slice(-7).map((dia, i) => {
                const max = Math.max(...pedidos.serieUltimosDias.map(d => d.total), 1)
                const height = (dia.total / max) * 100
                return (
                  <div 
                    key={i} 
                    className="flex-1 group relative"
                  >
                    <div 
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-300",
                        "bg-gradient-to-t from-blue-500 to-blue-400",
                        "group-hover:from-blue-400 group-hover:to-blue-300"
                      )}
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                    <div className={cn(
                      "absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap",
                      "text-[9px] bg-popover px-1 py-0.5 rounded shadow-sm",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "pointer-events-none z-10"
                    )}>
                      {dia.total}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent orders */}
        {pedidos.pedidosRecientes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recientes</p>
            <div className="space-y-1.5">
              {pedidos.pedidosRecientes.slice(0, 3).map((pedido, i) => (
                <div 
                  key={i}
                  className={cn(
                    "group flex items-center gap-3 p-2 rounded-lg",
                    "bg-muted/20 border border-transparent",
                    "transition-all duration-200",
                    "hover:bg-muted/40 hover:border-border/50"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pedido.producto}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{pedido.proveedor}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <Badge variant="secondary" className="text-[10px]">
                      {pedido.unidades} u
                    </Badge>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(pedido.fechaPedido).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
