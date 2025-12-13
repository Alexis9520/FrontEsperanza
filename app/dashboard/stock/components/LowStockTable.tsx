import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LowStockProduct } from "../stock-types"
import { AlertCircle, RefreshCcw, TrendingDown, Package, ChevronDown, ChevronRight, Boxes, ShoppingCart, CheckCircle2, Loader2, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react"
import { clsx } from "clsx"
import { useState, Fragment } from "react"

interface LowStockTableProps {
  data: LowStockProduct[]
  loading: boolean
  threshold: number
  setThreshold: (val: number) => void
  refresh: () => void
  // Pagination props
  page: number
  setPage: (val: number) => void
  size: number
  setSize: (val: number) => void
  totalElements: number
  totalPages: number
}

export function LowStockTable({
  data,
  loading,
  threshold,
  setThreshold,
  refresh,
  page,
  setPage,
  size,
  setSize,
  totalElements,
  totalPages
}: LowStockTableProps) {
  const [localThreshold, setLocalThreshold] = useState(threshold.toString())
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const handleThresholdBlur = () => {
    const val = parseInt(localThreshold)
    if (!isNaN(val) && val > 0) {
      setThreshold(val)
    } else {
      setLocalThreshold(threshold.toString())
    }
  }

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Stats
  const criticalCount = data.filter(d => d.cantidadGeneral <= 3).length
  const lowCount = data.filter(d => d.cantidadGeneral > 3 && d.cantidadGeneral <= d.cantidadMinima).length
  const totalUnitsNeeded = data.reduce((sum, d) => sum + Math.max(0, d.cantidadMinima - d.cantidadGeneral), 0)

  return (
    <div className="space-y-5">
      {/* Header con controles - diseño glass */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Productos con Bajo Stock</h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} productos con menos de {threshold} unidades
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm rounded-md px-3 py-1.5 border border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Umbral:</span>
                <Input
                  type="number"
                  className="w-16 h-8 text-center bg-transparent border-border/50"
                  value={localThreshold}
                  onChange={(e) => setLocalThreshold(e.target.value)}
                  onBlur={handleThresholdBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleThresholdBlur()}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={refresh}
                disabled={loading}
                className="bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background"
              >
                <RefreshCcw className={clsx("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Stats - diseño sutil con bordes */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border border-red-500/20 bg-red-500/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500 tabular-nums">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Críticos (≤3 und)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 tabular-nums">{lowCount}</p>
                <p className="text-xs text-muted-foreground">Bajo mínimo</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-primary/20 bg-primary/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary tabular-nums">{totalUnitsNeeded}</p>
                <p className="text-xs text-muted-foreground">Unidades a reponer</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla - diseño glass */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Productos por reponer</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Proveedor</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Categoría</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Stock</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Mínimo</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Precio</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                          <Loader2 className="h-7 w-7 text-red-600 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Buscando productos con bajo stock</p>
                        <p className="text-sm text-muted-foreground">Por favor espere...</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium text-primary">¡Excelente!</p>
                      <p className="text-sm text-muted-foreground">No hay productos por debajo del umbral de {threshold} unidades</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const isCritical = item.cantidadGeneral <= 3
                  const stockPercentage = Math.min((item.cantidadGeneral / Math.max(item.cantidadMinima, 1)) * 100, 100)
                  const isExpanded = expandedRows.has(item.id)
                  const hasLotes = item.stocks && item.stocks.length > 0

                  return (
                    <Fragment key={item.id}>
                      <TableRow
                        className={clsx(
                          "transition-all duration-200 cursor-pointer border-b border-border/30",
                          isCritical
                            ? "bg-red-500/[0.04] hover:bg-red-500/[0.08]"
                            : index % 2 === 0
                              ? "bg-transparent hover:bg-muted/30"
                              : "bg-muted/10 hover:bg-muted/30"
                        )}
                        onClick={() => hasLotes && toggleRow(item.id)}
                      >
                        <TableCell>
                          {hasLotes && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.nombre}</span>
                            {item.concentracion && (
                              <span className="text-xs text-muted-foreground">{item.concentracion}</span>
                            )}
                            {item.codigoBarras && (
                              <code className="text-xs text-muted-foreground mt-0.5">{item.codigoBarras}</code>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{item.proveedorNombre || "—"}</span>
                        </TableCell>
                        <TableCell>
                          {item.categoria ? (
                            <Badge variant="secondary" className="font-normal bg-secondary/50 border border-border/50">
                              {item.categoria}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={clsx(
                              "font-bold tabular-nums text-lg",
                              isCritical ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"
                            )}>
                              {item.cantidadGeneral}
                            </span>
                            <Progress
                              value={stockPercentage}
                              className={clsx(
                                "h-1 w-16",
                                isCritical ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-500"
                              )}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-muted-foreground tabular-nums">{item.cantidadMinima}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-primary tabular-nums">
                            {typeof item.precioVentaUnd === "number" && Number.isFinite(item.precioVentaUnd)
                              ? `S/ ${Number(item.precioVentaUnd).toFixed(2)}`
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={clsx(
                              "gap-1",
                              isCritical
                                ? "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 dark:text-red-500"
                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-500"
                            )}
                          >
                            <AlertCircle className="h-3 w-3" />
                            {isCritical ? "Crítico" : "Reponer"}
                          </Badge>
                        </TableCell>
                      </TableRow>

                      {/* Fila expandible con detalle de lotes */}
                      {isExpanded && hasLotes && (
                        <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/30">
                          <TableCell colSpan={8} className="p-0">
                            <div className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Boxes className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Detalle de Lotes ({item.stocks.length})</span>
                              </div>
                              <div className="grid gap-2">
                                {item.stocks.map((lote) => (
                                  <div
                                    key={lote.id}
                                    className="flex items-center justify-between bg-background/60 backdrop-blur-sm rounded-lg p-3 border border-border/50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <code className="px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs font-mono">
                                        {lote.codigoStock}
                                      </code>
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Vence:</span>{" "}
                                        <span className="font-medium">{lote.fechaVencimiento}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-sm">
                                        <span className="text-muted-foreground">Costo:</span>{" "}
                                        <span className="font-medium">
                                          {typeof lote.precioCompra === "number" && Number.isFinite(lote.precioCompra)
                                            ? `S/ ${Number(lote.precioCompra).toFixed(2)}`
                                            : "—"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Stock:</span>
                                        <Badge
                                          className={clsx(
                                            "tabular-nums",
                                            lote.cantidadUnidades <= 3
                                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                          )}
                                        >
                                          {lote.cantidadUnidades} und
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/50 bg-muted/10">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{page * size + 1}</span> -{" "}
              <span className="font-medium text-foreground">{Math.min((page + 1) * size, totalElements)}</span> de{" "}
              <span className="font-medium text-foreground">{totalElements}</span> productos
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Filas:</span>
                <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                  <SelectTrigger className="h-8 w-[70px] bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map(s => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-background/60"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-background/60"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">
                  Pág. <span className="font-medium">{page + 1}</span> de{" "}
                  <span className="font-medium">{totalPages || 1}</span>
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-background/60"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-background/60"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
