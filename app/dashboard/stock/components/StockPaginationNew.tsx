import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Package } from "lucide-react"

interface StockPaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
  loading: boolean
}

export function StockPagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  loading
}: StockPaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
      {/* Total de elementos */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Package className="h-4 w-4" />
        <span>Total: <strong className="text-foreground tabular-nums">{totalElements.toLocaleString()}</strong> productos</span>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Selector de filas */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mostrar</span>
          <Select
            value={`${size}`}
            onValueChange={(value) => onSizeChange(Number(value))}
            disabled={loading}
          >
            <SelectTrigger className="h-8 w-[70px] bg-background/60 border-border/50">
              <SelectValue placeholder={size} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">filas</span>
        </div>
        
        {/* Indicador de página */}
        <div className="flex items-center justify-center px-3 py-1 bg-muted/30 rounded-md">
          <span className="text-sm">
            <strong className="tabular-nums">{page + 1}</strong>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-muted-foreground tabular-nums">{totalPages || 1}</span>
          </span>
        </div>
        
        {/* Controles de navegación */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex bg-background/60 border-border/50 hover:bg-background"
            onClick={() => onPageChange(0)}
            disabled={page === 0 || loading}
          >
            <span className="sr-only">Ir a primera página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-background/60 border-border/50 hover:bg-background"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0 || loading}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-background/60 border-border/50 hover:bg-background"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1 || loading}
          >
            <span className="sr-only">Página siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-8 w-8 lg:flex bg-background/60 border-border/50 hover:bg-background"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={page >= totalPages - 1 || loading}
          >
            <span className="sr-only">Ir a última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
