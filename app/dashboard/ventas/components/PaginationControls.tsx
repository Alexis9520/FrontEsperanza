import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  paginaActual: number
  totalPaginas: number
  tamanoPagina: number
  setPaginaActual: (n: number) => void
  setTamanoPagina: (n: number) => void
  variant?: "outline" | "secondary"
  showSizeSelector?: boolean
}

export function PaginationControls({
  paginaActual,
  totalPaginas,
  tamanoPagina,
  setPaginaActual,
  setTamanoPagina,
  variant = "outline",
  showSizeSelector = false
}: PaginationControlsProps) {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      {showSizeSelector && (
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Por página</span>
          <select
            value={tamanoPagina}
            onChange={e => setTamanoPagina(Number(e.target.value))}
            className="h-8 rounded-md bg-background/70 border border-border/60 text-xs px-2"
          >
            {[5, 10, 20, 50, 100].map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={variant}
          onClick={() => setPaginaActual(1)}
          disabled={paginaActual === 1}
          className="h-8 px-3"
        >
          «
        </Button>
        <Button
          size="sm"
          variant={variant}
          onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          className="h-8 px-3"
        >
          Prev
        </Button>
        <span className="text-xs text-muted-foreground px-1 tabular-nums">
          {paginaActual} / {totalPaginas}
        </span>
        <Button
          size="sm"
          variant={variant}
          onClick={() =>
            setPaginaActual(Math.min(totalPaginas, paginaActual + 1))
          }
          disabled={paginaActual === totalPaginas}
          className="h-8 px-3"
        >
          Next
        </Button>
        <Button
          size="sm"
          variant={variant}
          onClick={() => setPaginaActual(totalPaginas)}
          disabled={paginaActual === totalPaginas}
          className="h-8 px-3"
        >
          »
        </Button>
      </div>
    </div>
  )
}
