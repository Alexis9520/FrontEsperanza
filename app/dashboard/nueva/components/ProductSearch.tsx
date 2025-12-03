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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
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
              <div className="flex items-center gap-3">
                <div className="hidden xl:flex items-center gap-3 pr-3 border-r">
                  <SortButton field="nombre">Nombre</SortButton>
                  <SortButton field="precio">Precio</SortButton>
                  <SortButton field="stock">Stock</SortButton>
                  <SortButton field="laboratorio">Lab</SortButton>
                  <SortButton field="tipo">Tipo</SortButton>
                  <SortButton field="concentracion">Concent.</SortButton>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onToggleResultados(false)
                    onSearchChange("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-background/60 backdrop-blur max-h-[600px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10 shadow-sm">
                  <TableRow className="text-[11px]">
                    <TableHead className="w-[35%] min-w-[200px]">
                      <SortButton field="nombre">Producto</SortButton>
                    </TableHead>
                    <TableHead className="w-[15%]">
                      <SortButton field="laboratorio">Detalles</SortButton>
                    </TableHead>
                    <TableHead className="w-[10%]">
                      <SortButton field="stock">Stock</SortButton>
                    </TableHead>
                    <TableHead className="w-[30%] min-w-[200px]">Cantidad</TableHead>
                    <TableHead className="w-[10%] text-right">Agregar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                        Sin resultados
                      </TableCell>
                    </TableRow>
                  )}
                  {resultados.map((prod, idx) => {
                    const selectionKey =
                      prod.codigoBarras ??
                      `${(prod.nombre || "").trim()}|${(prod.laboratorio || "").trim()}|${idx}`
                    const rowKey = prod.codigoBarras ?? `result-${idx}`

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

                    return (
                      <TableRow key={rowKey} className="hover:bg-muted/30 transition-colors">
                        {/* Producto */}
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-base leading-tight text-foreground">
                              {prod.nombre}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {prod.concentracion && (
                                <span className="bg-muted px-1.5 py-0.5 rounded">{prod.concentracion}</span>
                              )}
                              {prod.presentacion && (
                                <span>• {prod.presentacion}</span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
                              {prod.codigoBarras || "SIN CÓDIGO"}
                            </div>
                          </div>
                        </TableCell>

                        {/* Detalles */}
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="text-sm font-medium">{prod.laboratorio || "—"}</span>
                            <Badge variant={tipoBadgeVariant} className="text-[10px] px-1.5 h-5">
                              {prod.tipoMedicamento || "GENÉRICO"}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Stock (Rediseñado) */}
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2.5 w-2.5 rounded-full", stockColor)} />
                              <span className={cn("text-lg font-bold tabular-nums", prod.cantidadGeneral <= 5 ? "text-red-600" : "text-foreground")}>
                                {prod.cantidadGeneral}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              Unidades
                            </span>
                          </div>
                        </TableCell>

                        {/* Cantidad Controls */}
                        <TableCell className="align-top py-3">
                          <div className="flex flex-col gap-2">
                            {hasBlister && (
                              <div className="flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 p-1.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
                                <div className="flex items-center gap-2 mr-2">
                                  <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-600 dark:text-blue-400">
                                    <Layers className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Blister</span>
                                      <span className="text-[9px] font-medium text-blue-600/80 dark:text-blue-400/80 bg-blue-100/50 dark:bg-blue-900/30 px-1 rounded-[3px]">
                                        x{prod.cantidadUnidadesBlister}
                                      </span>
                                    </div>
                                    {prod.precioVentaBlister && (
                                      <span className="text-[10px] text-muted-foreground tabular-nums">S/ {prod.precioVentaBlister.toFixed(2)}</span>
                                    )}
                                  </div>
                                </div>
                                <BigQtyAdjust
                                  value={sel.blisters}
                                  onChange={(val) =>
                                    setBlisterUnidadSeleccion(prev => ({
                                      ...prev,
                                      [selectionKey]: { ...sel, blisters: val }
                                    }))
                                  }
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
                            
                            <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                              <div className="flex items-center gap-2 mr-2">
                                <div className="p-1 bg-emerald-100 dark:bg-emerald-900 rounded text-emerald-600 dark:text-emerald-400">
                                  <Pill className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Unidad</span>
                                  <span className="text-[10px] text-muted-foreground tabular-nums">S/ {precioUnidadFinal.toFixed(2)}</span>
                                </div>
                              </div>
                              <BigQtyAdjust
                                value={sel.unidades}
                                onChange={(val) =>
                                  setBlisterUnidadSeleccion(prev => ({
                                    ...prev,
                                    [selectionKey]: { ...sel, unidades: val }
                                  }))
                                }
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
                        </TableCell>

                        {/* Agregar Button */}
                        <TableCell className="align-middle text-right py-3">
                          <Button
                            size="icon"
                            className={cn(
                              "h-12 w-12 rounded-xl shadow-sm transition-all duration-200",
                              (sel.blisters > 0 || sel.unidades > 0) 
                                ? "bg-primary hover:bg-primary/90 scale-100 shadow-md" 
                                : "bg-muted text-muted-foreground hover:bg-muted/80 scale-95 opacity-70"
                            )}
                            onClick={() => onAddToCart(prod, selectionKey)}
                            disabled={sel.blisters === 0 && sel.unidades === 0}
                          >
                            <Plus className={cn("h-6 w-6", (sel.blisters > 0 || sel.unidades > 0) && "animate-in zoom-in duration-300")} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </GlassPanel>
  )
}

function BigQtyAdjust({
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
    <div className="flex items-center bg-background rounded-md border shadow-sm h-8">
      <button
        type="button"
        onClick={onDec}
        disabled={value <= 0}
        className="h-full w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors rounded-l-md border-r"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min="0"
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const val = e.target.value === "" ? 0 : parseInt(e.target.value)
          if (!isNaN(val)) onChange(val)
        }}
        placeholder="0"
        className="w-12 text-center font-semibold text-sm tabular-nums h-full bg-transparent border-none focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-muted-foreground/30"
      />
      <button
        type="button"
        onClick={onInc}
        className="h-full w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-r-md border-l"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
