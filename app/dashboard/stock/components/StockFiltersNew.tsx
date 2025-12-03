import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Search, X, FlaskConical, Tag, Barcode } from "lucide-react"
import { StockFilters as FilterType } from "../stock-types"

interface StockFiltersProps {
  filters: FilterType
  onFilterChange: (key: keyof FilterType, value: string) => void
}

export function StockFilters({ filters, onFilterChange }: StockFiltersProps) {
  const hasActiveFilters = filters.q || filters.lab || filters.cat || filters.codigo

  return (
    <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end p-4 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl">
      {/* Buscar producto */}
      <div className="space-y-1.5">
        <Label htmlFor="search" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Search className="h-3 w-3" />
          Buscar Producto
        </Label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Nombre o código..."
            value={filters.q}
            onChange={(e) => onFilterChange("q", e.target.value)}
            className="bg-background/60 border-border/50 focus:bg-background transition-colors"
          />
          {filters.q && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={() => onFilterChange("q", "")}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>
      </div>

      {/* Laboratorio */}
      <div className="space-y-1.5">
        <Label htmlFor="lab" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <FlaskConical className="h-3 w-3" />
          Laboratorio
        </Label>
        <div className="relative">
          <Input
            id="lab"
            placeholder="Ej. Pfizer"
            value={filters.lab}
            onChange={(e) => onFilterChange("lab", e.target.value)}
            className="bg-background/60 border-border/50 focus:bg-background transition-colors"
          />
          {filters.lab && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={() => onFilterChange("lab", "")}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-1.5">
        <Label htmlFor="cat" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Tag className="h-3 w-3" />
          Categoría
        </Label>
        <div className="relative">
          <Input
            id="cat"
            placeholder="Ej. Analgesico"
            value={filters.cat}
            onChange={(e) => onFilterChange("cat", e.target.value)}
            className="bg-background/60 border-border/50 focus:bg-background transition-colors"
          />
          {filters.cat && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={() => onFilterChange("cat", "")}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>
      </div>

      {/* Código exacto / escáner */}
      <div className="space-y-1.5">
        <Label htmlFor="codigo" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Barcode className="h-3 w-3" />
          Código Escáner
        </Label>
        <div className="relative">
          <Input
            id="codigo"
            placeholder="Escanear código..."
            value={filters.codigo}
            onChange={(e) => onFilterChange("codigo", e.target.value)}
            className="bg-background/60 border-border/50 focus:bg-background transition-colors"
          />
           {filters.codigo && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
              onClick={() => onFilterChange("codigo", "")}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
