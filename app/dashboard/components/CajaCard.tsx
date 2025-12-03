"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Wallet, Banknote, Smartphone } from "lucide-react"
import { type SaldoCaja } from "./types"

interface CajaCardProps {
  saldo: SaldoCaja
  loading?: boolean
}

export function CajaCard({ saldo, loading }: CajaCardProps) {
  const total = saldo.total || 1
  const efectivoPct = Math.round((saldo.efectivo / total) * 100)
  const yapePct = Math.round((saldo.yape / total) * 100)

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 animate-pulse">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-8 w-28 bg-muted rounded" />
              </div>
              <div className="h-10 w-10 bg-muted rounded-xl" />
            </div>
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden group cursor-default",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "border-cyan-500/20 bg-cyan-500/[0.03]",
      "transition-all duration-300 ease-out",
      "hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02]"
    )}>
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Saldo en Caja
            </p>
            <p className="text-2xl font-bold tracking-tight">
              S/ {formatMoney(saldo.total)}
            </p>
          </div>
          
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center",
            "bg-cyan-500/10 transition-transform duration-300",
            "group-hover:scale-110 group-hover:rotate-3"
          )}>
            <Wallet className="h-5 w-5 text-cyan-500" />
          </div>
        </div>

        {/* Distribution bars */}
        <div className="space-y-3">
          {/* Efectivo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-muted-foreground">Efectivo</span>
              </div>
              <span className="font-medium tabular-nums">S/ {formatMoney(saldo.efectivo)}</span>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${efectivoPct}%` }}
              />
            </div>
          </div>

          {/* Yape/Plin */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-violet-500" />
                <span className="text-muted-foreground">Yape / Plin</span>
              </div>
              <span className="font-medium tabular-nums">S/ {formatMoney(saldo.yape)}</span>
            </div>
            <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${yapePct}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatMoney(v?: number) {
  if (typeof v !== "number" || isNaN(v)) return "0.00"
  return v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
