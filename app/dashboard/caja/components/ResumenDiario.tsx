import { PieChart, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { CajaResumen } from "@/app/dashboard/caja/components/types"
import { GlassPanel } from "./SharedUI"

interface ResumenDiarioProps {
  resumen: CajaResumen | null
}

export function ResumenDiario({ resumen }: ResumenDiarioProps) {
  if (!resumen) return null

  return (
    <GlassPanel className="h-full">
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Resumen Financiero
        </h2>
      </div>
      <div className="p-5 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Wallet className="h-4 w-4" />
            Balance General
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">Total Ingresos</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-500 tabular-nums">
                S/ {resumen.totalIngresos.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/[0.03]">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-500" />
                </div>
                <span className="text-sm text-muted-foreground">Total Egresos</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-500 tabular-nums">
                S/ {resumen.totalEgresos.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
