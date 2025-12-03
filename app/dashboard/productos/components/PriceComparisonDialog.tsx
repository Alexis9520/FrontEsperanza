"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  Package,
  AlertCircle,
  ArrowUpDown,
  Barcode,
  Building2,
  History,
  DollarSign,
  Loader2
} from "lucide-react"
import clsx from "clsx"
import { apiUrl } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/lib/use-toast"
import { ComparacionPreciosResponse, ProveedorComparacion } from "../types"

interface PriceComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId: number | null
  productoNombre?: string
}

type SortKey = "ultimoPrecio" | "precioPromedio" | "totalPedidos" | "fechaUltimoPedido"
type SortOrder = "asc" | "desc"

export function PriceComparisonDialog({
  open,
  onOpenChange,
  productoId,
  productoNombre
}: PriceComparisonDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ComparacionPreciosResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("ultimoPrecio")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  useEffect(() => {
    if (open && productoId) {
      fetchComparacion()
    } else {
      setData(null)
      setError(null)
    }
  }, [open, productoId])

  async function fetchComparacion() {
    if (!productoId) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetchWithAuth(
        apiUrl(`/productos/${productoId}/comparacion-precios`),
        { method: "GET" },
        toast
      )
      if (response) {
        setData(response as ComparacionPreciosResponse)
      }
    } catch (err: any) {
      if (err?.status === 404) {
        setError("Producto no encontrado o inactivo")
      } else {
        setError(err?.message || "Error al cargar la comparación de precios")
      }
    } finally {
      setLoading(false)
    }
  }

  const sortedProveedores = useMemo(() => {
    if (!data?.proveedores) return []
    return [...data.proveedores].sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case "ultimoPrecio":
          comparison = a.ultimoPrecio - b.ultimoPrecio
          break
        case "precioPromedio":
          comparison = a.precioPromedio - b.precioPromedio
          break
        case "totalPedidos":
          comparison = a.totalPedidos - b.totalPedidos
          break
        case "fechaUltimoPedido":
          comparison = new Date(a.fechaUltimoPedido).getTime() - new Date(b.fechaUltimoPedido).getTime()
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [data?.proveedores, sortKey, sortOrder])

  const bestPrice = useMemo(() => {
    if (!data?.proveedores?.length) return null
    return Math.min(...data.proveedores.map(p => p.ultimoPrecio))
  }, [data?.proveedores])

  const worstPrice = useMemo(() => {
    if (!data?.proveedores?.length) return null
    return Math.max(...data.proveedores.map(p => p.ultimoPrecio))
  }, [data?.proveedores])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  function getDaysAgo(dateStr: string) {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function getPriceVariation(ultimo: number, promedio: number) {
    if (promedio === 0) return 0
    return ((ultimo - promedio) / promedio) * 100
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">
              <DollarSign className="h-5 w-5 text-indigo-400" />
            </div>
            Comparación de Precios
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>Historial de precios por proveedor para este producto</span>
              {(data || productoNombre) && (
                <div className="flex items-center gap-2 mt-2 text-foreground">
                  <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                    <Package className="h-3.5 w-3.5" />
                    {data?.nombreProducto || productoNombre}
                  </Badge>
                  {data?.codigoBarras && (
                    <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                      <Barcode className="h-3.5 w-3.5" />
                      {data.codigoBarras}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <span className="text-sm text-muted-foreground">Cargando comparación...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <span className="text-sm text-destructive font-medium">{error}</span>
              <Button variant="outline" size="sm" onClick={fetchComparacion}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {data.proveedores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="p-3 rounded-full bg-amber-500/10">
                    <History className="h-8 w-8 text-amber-500" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    Sin historial de pedidos
                  </span>
                  <span className="text-xs text-muted-foreground">
                    No se han registrado pedidos de este producto con ningún proveedor
                  </span>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-emerald-500" />
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Mejor Precio
                        </span>
                      </div>
                      <span className="text-xl font-bold text-emerald-500 tabular-nums">
                        S/ {bestPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-rose-500" />
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Precio Mayor
                        </span>
                      </div>
                      <span className="text-xl font-bold text-rose-500 tabular-nums">
                        S/ {worstPrice?.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4 text-indigo-400" />
                        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Proveedores
                        </span>
                      </div>
                      <span className="text-xl font-bold text-indigo-400 tabular-nums">
                        {data.proveedores.length}
                      </span>
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-muted-foreground">Ordenar por:</span>
                    <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultimoPrecio">Último Precio</SelectItem>
                        <SelectItem value="precioPromedio">Precio Promedio</SelectItem>
                        <SelectItem value="totalPedidos">Total Pedidos</SelectItem>
                        <SelectItem value="fechaUltimoPedido">Fecha Último Pedido</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      {sortOrder === "asc" ? "Ascendente" : "Descendente"}
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="rounded-xl border bg-background/60 backdrop-blur-sm overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Proveedor</TableHead>
                          <TableHead>RUC</TableHead>
                          <TableHead className="text-right">Último Precio</TableHead>
                          <TableHead className="text-right">Promedio</TableHead>
                          <TableHead className="text-center">Variación</TableHead>
                          <TableHead className="text-center">Pedidos</TableHead>
                          <TableHead>Último Pedido</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedProveedores.map((prov, idx) => {
                          const isBest = prov.ultimoPrecio === bestPrice
                          const isWorst = prov.ultimoPrecio === worstPrice && data.proveedores.length > 1
                          const variation = getPriceVariation(prov.ultimoPrecio, prov.precioPromedio)
                          const daysAgo = getDaysAgo(prov.fechaUltimoPedido)
                          const isRecent = daysAgo <= 30
                          const isOld = daysAgo > 90

                          return (
                            <TableRow
                              key={prov.proveedorId}
                              className={clsx(
                                "transition-colors",
                                isBest && "bg-emerald-500/5 hover:bg-emerald-500/10",
                                isWorst && "bg-rose-500/5 hover:bg-rose-500/10"
                              )}
                            >
                              <TableCell className="text-center">
                                {isBest && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Award className="h-5 w-5 text-amber-500" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Mejor precio actual</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">
                                    {prov.proveedorNombre}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {prov.proveedorRuc}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={clsx(
                                    "font-semibold tabular-nums",
                                    isBest && "text-emerald-500",
                                    isWorst && "text-rose-500"
                                  )}
                                >
                                  S/ {prov.ultimoPrecio.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="text-sm tabular-nums text-muted-foreground">
                                  S/ {prov.precioPromedio.toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={clsx(
                                    "text-[10px] tabular-nums gap-1",
                                    variation > 0 && "text-rose-500 border-rose-500/30",
                                    variation < 0 && "text-emerald-500 border-emerald-500/30",
                                    variation === 0 && "text-muted-foreground"
                                  )}
                                >
                                  {variation > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : variation < 0 ? (
                                    <TrendingDown className="h-3 w-3" />
                                  ) : null}
                                  {variation > 0 ? "+" : ""}
                                  {variation.toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="tabular-nums">
                                  {prov.totalPedidos}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs">
                                    {formatDate(prov.fechaUltimoPedido)}
                                  </span>
                                  <span
                                    className={clsx(
                                      "text-[10px] flex items-center gap-1",
                                      isRecent && "text-emerald-500",
                                      isOld && "text-amber-500",
                                      !isRecent && !isOld && "text-muted-foreground"
                                    )}
                                  >
                                    <Calendar className="h-3 w-3" />
                                    hace {daysAgo} días
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                      <span>Mejor precio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/40" />
                      <span>Precio mayor</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3 w-3 text-emerald-500" />
                      <span>Precio bajó vs promedio</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-rose-500" />
                      <span>Precio subió vs promedio</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
