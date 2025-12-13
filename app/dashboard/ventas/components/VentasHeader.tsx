import { Receipt, RefreshCcw, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VentasHeaderProps {
  autoRefrescar: boolean
  setAutoRefrescar: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function VentasHeader({ autoRefrescar, setAutoRefrescar }: VentasHeaderProps) {
  return (
    <header className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Receipt className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Historial de Ventas</h1>
            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
              <Activity className="h-3 w-3" />
              Boletas
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestión y exportación de comprobantes
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefrescar(a => !a)}
          className={cn(
            "gap-2",
            autoRefrescar && "border-primary/50 bg-primary/10 text-primary"
          )}
        >
          <RefreshCcw
            className={cn(
              "h-4 w-4",
              autoRefrescar && "animate-spin"
            )}
          />
          Auto {autoRefrescar ? "ON" : "OFF"}
        </Button>
      </div>
    </header>
  )
}

