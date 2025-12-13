import { useEffect, useRef } from "react"
import {
  Search,
  X,
  Bot,
  ArrowUpAZ,
  ArrowDownAZ,
  ChevronsUpDown,
  ScanSearch,
  Plus,
  Minus,
  Layers,
  Pill,
  Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./SharedUI"
import { Producto, SortField } from "./types"

interface ProductSearchProps {
  busqueda: string
  onSearchChange: (val: string) => void
  mostrarResultados: boolean
  onToggleResultados: (val: boolean) => void
  resultados: Producto[]
  sortField: SortField
  sortDir: "asc" | "desc"
  onSort: (field: SortField) => void
  blisterUnidadSeleccion: Record<string, { blisters: number; unidades: number }>
  setBlisterUnidadSeleccion: React.Dispatch<
    React.SetStateAction<Record<string, { blisters: number; unidades: number }>>
  >
  onAddToCart: (prod: Producto, key: string) => void
}

export function ProductSearch({
  busqueda,
  onSearchChange,
  mostrarResultados,
  onToggleResultados,
  resultados,
  sortField,
  sortDir,
  onSort,
  blisterUnidadSeleccion,
  setBlisterUnidadSeleccion,
  onAddToCart
}: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on mount
    inputRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Helper for sort button
  function SortButton({ field, children }: { field: SortField; children: React.ReactNode }) {
    const active = sortField === field
    const dirIcon = active ? (
      sortDir === "asc" ? (
        <ArrowUpAZ className="h-3 w-3" />
      ) : (
        <ArrowDownAZ className="h-3 w-3" />
      )
    ) : (
      <ChevronsUpDown className="h-3 w-3 opacity-60" />
    )
    return (
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium transition",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
        {dirIcon}
      </button>
    )
  }

  return (
    <GlassPanel>
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ScanSearch className="h-5 w-5 text-primary" />
              Buscar Productos
            </CardTitle>
            <CardDescription>
              Nombre, código, laboratorio, concentración o tipo
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar (F2)..."
                className="pl-8 pr-8 w-60"
                value={busqueda}
                onChange={e => {
                  onSearchChange(e.target.value)
                  if (e.target.value.trim() !== "") onToggleResultados(true)
                  else onToggleResultados(false)
                }}
                onKeyDown={e => {
                  if (e.key === "Escape") {
                    onSearchChange("")
                    onToggleResultados(false)
                  }
                }}
              />
              {busqueda && (
                <button
                  onClick={() => {
                    onSearchChange("")
                    onToggleResultados(false)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant={mostrarResultados ? "secondary" : "default"}
              onClick={() => {
                if (busqueda.trim() === "") return
                onToggleResultados(true)
              }}
            >
              {mostrarResultados ? "Refrescar" : "Buscar"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!mostrarResultados && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 py-6">
            <Bot className="h-4 w-4" />
            Introduce un término de búsqueda para mostrar resultados.
          </div>
        )}
        {mostrarResultados && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">
                Resultados <span className="text-muted-foreground">({resultados.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 pr-2 border-r text-[10px]">
                  <SortButton field="nombre">Nombre</SortButton>
                  <SortButton field="precio">Precio</SortButton>
                  <SortButton field="stock">Stock</SortButton>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    onToggleResultados(false)
                    onSearchChange("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {resultados.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground border rounded-xl bg-background/60">
                Sin resultados
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[600px] overflow-auto p-1">
                {resultados.map((prod, idx) => {
                  const selectionKey =
                    prod.codigoBarras ??
                    `${(prod.nombre || "").trim()}|${(prod.laboratorio || "").trim()}|${idx}`
                  const cardKey = prod.codigoBarras ?? `result-${idx}`

                  const precioUnidadFinal =
                    prod.precioVentaUnd - (prod.descuento ?? 0)
                  const sel =
                    blisterUnidadSeleccion[selectionKey] || {
                      blisters: 0,
                      unidades: 0
                    }
                  const tipoBadgeVariant =
                    prod.tipoMedicamento === "MARCA" ? "destructive" : "outline"

                  const hasBlister = prod.cantidadUnidadesBlister && prod.cantidadUnidadesBlister > 0
                  const stockColor = prod.cantidadGeneral <= 5 ? "bg-red-500" : "bg-emerald-500"
                  const hasSelection = sel.blisters > 0 || sel.unidades > 0

                  return (
                    <div
                      key={cardKey}
                      className={cn(
                        "rounded-lg border bg-background/80 backdrop-blur-sm px-4 py-4 transition-all",
                        "flex flex-col md:flex-row md:items-center gap-4",
                        hasSelection && "ring-2 ring-primary/50 border-primary/30"
                      )}
                    >
                      {/* Product Info Section */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Stock Indicator */}
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                          <div className={cn("h-2.5 w-2.5 rounded-full", stockColor)} />
                          <span className={cn(
                            "text-lg font-bold tabular-nums",
                            prod.cantidadGeneral <= 5 ? "text-red-600" : "text-foreground"
                          )}>
                            {prod.cantidadGeneral}
                          </span>
                        </div>
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-tight line-clamp-1">
                            {prod.nombre}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <Badge variant={tipoBadgeVariant} className="text-[8px] px-1 h-4">
                              {prod.tipoMedicamento || "GEN"}
                            </Badge>
                            {prod.concentracion && (
                              <span className="text-[9px] text-muted-foreground">{prod.concentracion}</span>
                            )}
                            <span className="text-[9px] text-muted-foreground">• {prod.laboratorio}</span>
                          </div>
                          <div className="text-[8px] font-mono text-muted-foreground/50 mt-0.5">
                            {prod.codigoBarras || "SIN CÓDIGO"}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls - Horizontal */}
                      <div className="flex items-center gap-2 shrink-0">
                        {hasBlister && (
                          <div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-950/30 px-2 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50">
                            <div className="flex items-center gap-1.5">
                              <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              <div className="text-[10px]">
                                <div className="font-bold text-blue-700 dark:text-blue-300">x{prod.cantidadUnidadesBlister}</div>
                                {prod.precioVentaBlister && (
                                  <div className="text-muted-foreground tabular-nums">S/{prod.precioVentaBlister.toFixed(2)}</div>
                                )}
                              </div>
                            </div>
                            <MiniQtyAdjust
                              value={sel.blisters}
                              onDec={() =>
                                setBlisterUnidadSeleccion(prev => ({
                                  ...prev,
                                  [selectionKey]: { ...sel, blisters: Math.max(0, sel.blisters - 1) }
                                }))
                              }
                              onInc={() =>
                                setBlisterUnidadSeleccion(prev => ({
                                  ...prev,
                                  [selectionKey]: { ...sel, blisters: sel.blisters + 1 }
                                }))
                              }
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 px-2 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                          <div className="flex items-center gap-1.5">
                            <Pill className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-[10px]">
                              <div className="font-bold text-emerald-700 dark:text-emerald-300">Und</div>
                              <div className="text-muted-foreground tabular-nums">S/{precioUnidadFinal.toFixed(2)}</div>
                            </div>
                          </div>
                          <MiniQtyAdjust
                            value={sel.unidades}
                            onDec={() =>
                              setBlisterUnidadSeleccion(prev => ({
                                ...prev,
                                [selectionKey]: { ...sel, unidades: Math.max(0, sel.unidades - 1) }
                              }))
                            }
                            onInc={() =>
                              setBlisterUnidadSeleccion(prev => ({
                                ...prev,
                                [selectionKey]: { ...sel, unidades: sel.unidades + 1 }
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Add Button */}
                      <Button
                        size="icon"
                        className={cn(
                          "h-10 w-10 rounded-lg shrink-0 transition-all",
                          hasSelection
                            ? "bg-primary hover:bg-primary/90 shadow-md"
                            : "bg-muted text-muted-foreground"
                        )}
                        onClick={() => onAddToCart(prod, selectionKey)}
                        disabled={!hasSelection}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </GlassPanel>
  )
}
// Compact quantity adjust that takes full width
function CompactQtyAdjust({
  value,
  onDec,
  onInc,
  onChange
}: {
  value: number
  onDec: () => void
  onInc: () => void
  onChange: (val: number) => void
}) {
  return (
    <div className="flex items-center bg-background rounded-lg border shadow-sm h-9 w-full">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        className="h-full w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors rounded-l border-r"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center font-bold text-sm tabular-nums">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="h-full w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-r border-l"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// Mini quantity adjust for inline horizontal use
function MiniQtyAdjust({
  value,
  onDec,
  onInc
}: {
  value: number
  onDec: () => void
  onInc: () => void
}) {
  return (
    <div className="flex items-center bg-background rounded border shadow-sm h-7">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        className="h-full w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors rounded-l border-r"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center font-bold text-xs tabular-nums">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="h-full w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-r border-l"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
