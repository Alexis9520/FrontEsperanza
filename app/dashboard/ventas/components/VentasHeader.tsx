import { Receipt, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VentasHeaderProps {
  autoRefrescar: boolean
  setAutoRefrescar: (value: boolean | ((prev: boolean) => boolean)) => void
}

export function VentasHeader({ autoRefrescar, setAutoRefrescar }: VentasHeaderProps) {
  return (
    <header className="relative z-10 flex flex-col lg:flex-row gap-5 justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          Boletas
          <Receipt className="h-6 w-6 text-primary/70" />
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestión avanzada y exportación de comprobantes
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoRefrescar(a => !a)}
          className={cn(
            autoRefrescar && "border-primary/50 bg-primary/10 text-primary"
          )}
        >
          <RefreshCcw
            className={cn(
              "mr-2 h-4 w-4",
              autoRefrescar && "animate-spin-slow"
            )}
          />
          Auto {autoRefrescar ? "ON" : "OFF"}
        </Button>
      </div>
    </header>
  )
}
