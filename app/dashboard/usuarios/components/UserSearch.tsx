import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function UserSearch({
  busqueda,
  setBusqueda,
  count
}: {
  busqueda: string
  setBusqueda: (v: string) => void
  count: number
}) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-xl",
      "bg-card/50 backdrop-blur-sm border border-border/50",
      "transition-all duration-300",
      busqueda && "border-primary/30"
    )}>
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, DNI, rol o turno..."
          className={cn(
            "pl-10 pr-10 h-10 rounded-lg",
            "bg-background/80 border-border/60",
            "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50"
          )}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        {busqueda && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            onClick={() => setBusqueda("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <Badge 
        variant="secondary" 
        className={cn(
          "h-9 px-4 flex items-center justify-center gap-2 rounded-lg",
          "bg-muted/50 border border-border/50 font-medium"
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {count} {count === 1 ? "usuario" : "usuarios"}
      </Badge>
    </div>
  )
}
