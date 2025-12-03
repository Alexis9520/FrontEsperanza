"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, Medal } from "lucide-react"
import { type ProductoMasVendido } from "./types"

interface TopProductsCardProps {
  productos: ProductoMasVendido[]
  loading?: boolean
}

const medalColors = [
  "from-amber-400 to-amber-600", // Gold
  "from-slate-300 to-slate-500", // Silver
  "from-amber-600 to-amber-800", // Bronze
]

export function TopProductsCard({ productos, loading }: TopProductsCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-3 w-28 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-12 bg-muted rounded" />
              </div>
              <div className="h-2 bg-muted rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const maxUnidades = Math.max(...productos.map(p => p.unidades), 1)

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 hover:shadow-md"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </div>
          Productos Más Vendidos
        </CardTitle>
        <CardDescription>Top por unidades vendidas</CardDescription>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Sin productos vendidos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {productos.map((producto, i) => {
              const barWidth = (producto.unidades / maxUnidades) * 100
              const isTop3 = i < 3
              
              return (
                <div 
                  key={i} 
                  className="group space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isTop3 ? (
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center",
                          "bg-gradient-to-br text-white shadow-sm",
                          medalColors[i]
                        )}>
                          <Medal className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
                        </div>
                      )}
                      <span className={cn(
                        "text-sm font-medium truncate max-w-[180px]",
                        isTop3 && "font-semibold"
                      )}>
                        {producto.nombre}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-semibold tabular-nums">
                      {producto.unidades} u
                    </span>
                  </div>
                  
                  <div className="relative">
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-700 ease-out",
                          isTop3 
                            ? "bg-gradient-to-r from-violet-500 via-primary to-emerald-500" 
                            : "bg-gradient-to-r from-muted-foreground/40 to-muted-foreground/20"
                        )}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className={cn(
                      "absolute right-0 -top-0.5 text-[10px] font-medium tabular-nums",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      "text-muted-foreground"
                    )}>
                      {producto.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
