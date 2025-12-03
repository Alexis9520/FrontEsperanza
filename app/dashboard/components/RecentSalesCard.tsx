"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Receipt, ArrowUpRight } from "lucide-react"
import { type VentaReciente } from "./types"

interface RecentSalesCardProps {
  ventas: VentaReciente[]
  loading?: boolean
}

export function RecentSalesCard({ ventas, loading }: RecentSalesCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded" />
            </div>
          ))}
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
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-primary" />
          </div>
          Ventas Recientes
        </CardTitle>
        <CardDescription>Últimas transacciones</CardDescription>
      </CardHeader>
      <CardContent>
        {ventas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No hay ventas recientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ventas.map((venta, i) => (
              <div 
                key={i}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg",
                  "bg-muted/20 border border-transparent",
                  "transition-all duration-200",
                  "hover:bg-muted/40 hover:border-border/50 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    "bg-primary/5 text-primary",
                    "transition-transform duration-200 group-hover:scale-105"
                  )}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{venta.boleta}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {venta.cliente?.replace("|", "") || "Cliente general"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant="secondary" 
                    className="font-mono text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                  >
                    S/ {venta.monto.toFixed(2)}
                  </Badge>
                  <ArrowUpRight className={cn(
                    "h-4 w-4 text-muted-foreground/50",
                    "opacity-0 group-hover:opacity-100 transition-opacity"
                  )} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
