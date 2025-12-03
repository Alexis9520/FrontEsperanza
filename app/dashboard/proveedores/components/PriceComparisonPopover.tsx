"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Award,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
  History,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import clsx from "clsx"
import { apiUrl } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/lib/use-toast"

type ProveedorComparacion = {
  proveedorId: number
  proveedorNombre: string
  proveedorRuc: string
  ultimoPrecio: number
  fechaUltimoPedido: string
  precioPromedio: number
  totalPedidos: number
}

type ComparacionPreciosResponse = {
  productoId: number
  nombreProducto: string
  codigoBarras: string
  proveedores: ProveedorComparacion[]
}

interface PriceComparisonPopoverProps {
  productoId: number
  productoNombre: string
  proveedorActualId?: number
}

export function PriceComparisonPopover({
  productoId,
  productoNombre,
  proveedorActualId
}: PriceComparisonPopoverProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ComparacionPreciosResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortByPrice, setSortByPrice] = useState(true)

  useEffect(() => {
    if (open && !data && !loading) {
      fetchComparacion()
    }
  }, [open])

  async function fetchComparacion() {
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
        setError("Sin historial")
      } else {
        setError("Error al cargar")
      }
    } finally {
      setLoading(false)
    }
  }

  const sortedProveedores = useMemo(() => {
    if (!data?.proveedores) return []
    return [...data.proveedores].sort((a, b) => {
      if (sortByPrice) {
        return a.ultimoPrecio - b.ultimoPrecio
      }
      return new Date(b.fechaUltimoPedido).getTime() - new Date(a.fechaUltimoPedido).getTime()
    })
  }, [data?.proveedores, sortByPrice])

  const bestPrice = useMemo(() => {
    if (!data?.proveedores?.length) return null
    return Math.min(...data.proveedores.map(p => p.ultimoPrecio))
  }, [data?.proveedores])

  const currentProviderData = useMemo(() => {
    if (!data?.proveedores || !proveedorActualId) return null
    return data.proveedores.find(p => p.proveedorId === proveedorActualId)
  }, [data?.proveedores, proveedorActualId])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short"
    })
  }

  function getDaysAgo(dateStr: string) {
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = today.getTime() - date.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Scale className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Comparar precios de proveedores</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent 
        className="w-[380px] p-0" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Scale className="h-4 w-4 text-indigo-500" />
            Comparación de Precios
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            {productoNombre}
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[300px] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              <span className="text-xs text-muted-foreground">Cargando...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <History className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{error}</span>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {data.proveedores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <History className="h-6 w-6 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Sin historial de pedidos</span>
                </div>
              ) : (
                <>
                  {/* Sort Toggle */}
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {data.proveedores.length} proveedor{data.proveedores.length !== 1 ? "es" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 px-2"
                      onClick={() => setSortByPrice(!sortByPrice)}
                    >
                      {sortByPrice ? (
                        <>
                          <TrendingDown className="h-3 w-3" /> Por precio
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" /> Por fecha
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Providers List */}
                  <div className="divide-y">
                    {sortedProveedores.map((prov) => {
                      const isBest = prov.ultimoPrecio === bestPrice
                      const isCurrent = prov.proveedorId === proveedorActualId
                      const daysAgo = getDaysAgo(prov.fechaUltimoPedido)
                      const variation = prov.precioPromedio > 0 
                        ? ((prov.ultimoPrecio - prov.precioPromedio) / prov.precioPromedio) * 100 
                        : 0

                      return (
                        <div
                          key={prov.proveedorId}
                          className={clsx(
                            "p-3 transition-colors",
                            isCurrent && "bg-indigo-500/5 border-l-2 border-l-indigo-500",
                            isBest && !isCurrent && "bg-emerald-500/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {isBest && (
                                  <Award className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                )}
                                <span className={clsx(
                                  "text-sm font-medium truncate",
                                  isCurrent && "text-indigo-600"
                                )}>
                                  {prov.proveedorNombre}
                                </span>
                                {isCurrent && (
                                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                                    Actual
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                <span className="font-mono">{prov.proveedorRuc}</span>
                                <span>•</span>
                                <span>{prov.totalPedidos} pedido{prov.totalPedidos !== 1 ? "s" : ""}</span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className={clsx(
                                "text-sm font-bold tabular-nums",
                                isBest ? "text-emerald-600" : "text-foreground"
                              )}>
                                S/ {prov.ultimoPrecio.toFixed(2)}
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                {variation !== 0 && (
                                  <Badge
                                    variant="outline"
                                    className={clsx(
                                      "text-[9px] h-4 px-1 gap-0.5",
                                      variation > 0 ? "text-rose-500 border-rose-500/30" : "text-emerald-500 border-emerald-500/30"
                                    )}
                                  >
                                    {variation > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                    {Math.abs(variation).toFixed(0)}%
                                  </Badge>
                                )}
                                <span className={clsx(
                                  "text-[10px]",
                                  daysAgo <= 30 ? "text-emerald-600" : daysAgo > 90 ? "text-amber-600" : "text-muted-foreground"
                                )}>
                                  hace {daysAgo}d
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3 mt-2 text-[10px]">
                            <span className="text-muted-foreground">
                              Promedio: <span className="font-medium text-foreground">S/ {prov.precioPromedio.toFixed(2)}</span>
                            </span>
                            <span className="text-muted-foreground">
                              Último: <span className="font-medium text-foreground">{formatDate(prov.fechaUltimoPedido)}</span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Current Provider Recommendation */}
                  {currentProviderData && bestPrice && currentProviderData.ultimoPrecio > bestPrice && (
                    <div className="p-3 bg-amber-500/10 border-t border-amber-500/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-700 dark:text-amber-400">
                          <span className="font-medium">Hay un mejor precio disponible.</span>
                          <span className="block mt-0.5">
                            Podrías ahorrar S/ {(currentProviderData.ultimoPrecio - bestPrice).toFixed(2)} por unidad.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
