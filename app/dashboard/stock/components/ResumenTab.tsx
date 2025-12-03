import React from "react"
import { clsx } from "clsx"
import {
  ChevronDown, ChevronRight, Package, Layers, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ProductSummary } from "../types"
import { diasHasta, formatMoney } from "../utils"
import { InfoBox, FragmentRows, estadoStock, BarraStock, BarraEstadosLotes } from "./StockTableHelpers"

interface ResumenTabProps {
  loading: boolean
  pageItems: ProductSummary[]
  expanded: Record<string, boolean>
  toggleExpand: (codigo: string) => void
  densityCompact: boolean
  page: number
  setPage: (p: number | ((prev: number) => number)) => void
  pageSize: number
  setPageSize: (s: number) => void
  total: number
}

export function ResumenTab({
  loading,
  pageItems,
  expanded,
  toggleExpand,
  densityCompact,
  page,
  setPage,
  pageSize,
  setPageSize,
  total
}: ResumenTabProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const shownCount = pageItems.length
  const fromIdx = total === 0 ? 0 : (page - 1) * pageSize + (shownCount > 0 ? 1 : 0)
  const toIdx = (page - 1) * pageSize + shownCount

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Inventario General</CardTitle>
        <CardDescription>
          Vista detallada de productos y lotes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2 py-6">
            <div className="h-8 w-40 bg-muted/50 rounded animate-pulse" />
            <div className="h-6 w-full bg-muted/30 rounded animate-pulse" />
            <div className="h-6 w-full bg-muted/30 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-muted/30 rounded animate-pulse" />
          </div>
        )}
        <div className="rounded-xl border bg-card/70 backdrop-blur-sm overflow-x-auto shadow-sm">
          <Table className={clsx("transition-all", densityCompact && "[&_td]:py-1 [&_th]:py-2 text-sm")}>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8" />
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estados</TableHead>
                <TableHead>Próx. Venc.</TableHead>
                <TableHead>Margen %</TableHead>
                <TableHead>Valor (C/V)</TableHead>
                <TableHead>Riesgo %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No hay resultados con los filtros actuales
                  </TableCell>
                </TableRow>
              )}
              {pageItems.map(p => {
                const exp = expanded[p.codigoBarras]
                const est = estadoStock(p)
                const marginColor =
                  p.margenPct < 0 ? "text-red-600" :
                    p.margenPct < 15 ? "text-amber-600" : "text-emerald-600"
                const riesgoColor =
                  p.porcentajeEnRiesgo > 50 ? "text-red-600" :
                    p.porcentajeEnRiesgo > 20 ? "text-amber-500" : "text-muted-foreground"

                return (
                  <FragmentRows key={p.codigoBarras}>
                    <TableRow
                      className={clsx(
                        "group cursor-pointer transition-colors",
                        exp && "bg-muted/40",
                        "hover:bg-muted/30"
                      )}
                      onClick={() => toggleExpand(p.codigoBarras)}
                    >
                      <TableCell className="p-0 pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); toggleExpand(p.codigoBarras) }}
                          aria-label={exp ? "Contraer" : "Expandir"}
                        >
                          {exp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">{p.codigoBarras}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">{p.nombre}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {p.concentracion || "—"}
                          </span>
                          <Badge
                            variant={est.variant}
                            className="w-fit mt-1 text-[10px] px-1.5 rounded-full"
                          >
                            {est.texto}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] space-y-0.5">
                          <span className="font-medium">{p.categoria || "—"}</span>
                          <div className="text-muted-foreground">
                            {p.laboratorio || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><BarraStock p={p} /></TableCell>
                      <TableCell><BarraEstadosLotes p={p} /></TableCell>
                      <TableCell>
                        {p.diasHastaPrimerVencimiento === null ? (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        ) : p.diasHastaPrimerVencimiento <= 0 ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 rounded-full">
                            Vencido
                          </Badge>
                        ) : (
                          <Badge
                            variant={p.diasHastaPrimerVencimiento <= 30 ? "secondary" : "outline"}
                            className="text-[10px] px-1.5 rounded-full"
                          >
                            {p.diasHastaPrimerVencimiento} d
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={clsx("text-xs font-semibold tabular-nums", marginColor)}>
                          {p.margenPct.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px] tabular-nums">
                          <div>{formatMoney(p.costoTotal)}</div>
                          <div className="text-muted-foreground">
                            {formatMoney(p.valorVentaTeorico)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={clsx("text-xs font-bold tabular-nums", riesgoColor)}>
                          {p.porcentajeEnRiesgo.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                    {exp && (
                      <TableRow className="bg-muted/20">
                        <TableCell />
                        <TableCell colSpan={9} className="py-5">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <h4 className="font-semibold flex items-center gap-1 text-sm">
                                <Package className="h-4 w-4" /> Lotes
                              </h4>
                              <div className="border rounded-lg max-h-56 overflow-auto bg-background/50 backdrop-blur-sm">
                                <Table className="text-xs">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="py-1">Lote</TableHead>
                                      <TableHead className="py-1">Unid</TableHead>
                                      <TableHead className="py-1">Venc</TableHead>
                                      <TableHead className="py-1">Compra</TableHead>
                                      <TableHead className="py-1">Estado</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {p.lotes.map(l => {
                                      const d = diasHasta(l.fechaVencimiento)
                                      let estado = "—"
                                      let variant: "outline" | "secondary" | "destructive" = "outline"
                                      if (d !== null) {
                                        if (d <= 0) { estado = "Vencido"; variant = "destructive" }
                                        else if (d <= 30) { estado = "Pronto"; variant = "secondary" }
                                        else { estado = "Vigente"; variant = "outline" }
                                      }
                                      return (
                                        <TableRow key={l.id} className="hover:bg-muted/40">
                                          <TableCell className="py-1">{l.codigoStock || l.id}</TableCell>
                                          <TableCell className="py-1 tabular-nums">{l.cantidadUnidades}</TableCell>
                                          <TableCell className="py-1">
                                            {l.fechaVencimiento ? new Date(l.fechaVencimiento).toLocaleDateString() : "—"}
                                          </TableCell>
                                          <TableCell className="py-1 tabular-nums">{formatMoney(l.precioCompra)}</TableCell>
                                          <TableCell className="py-1">
                                            <Badge variant={variant} className="text-[10px] px-1 h-4">{estado}</Badge>
                                          </TableCell>
                                        </TableRow>
                                      )
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold flex items-center gap-1 text-sm">
                                <Layers className="h-4 w-4" /> Resumen Inventario
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <InfoBox label="Total" value={`${p.cantidadGeneral} u`} />
                                <InfoBox label="Lotes" value={p.numeroLotes} />
                                <InfoBox label="Vencidas" value={p.unidadesVencidas} accent="text-red-600" />
                                <InfoBox label="≤30d" value={p.unidadesRiesgo30d} accent="text-amber-500" />
                                <InfoBox wide label="Costo Total" value={formatMoney(p.costoTotal)} />
                                <InfoBox wide label="Valor Venta" value={formatMoney(p.valorVentaTeorico)} />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold flex items-center gap-1 text-sm">
                                <TrendingUp className="h-4 w-4" /> Margen / Riesgo
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <InfoBox label="Costo Prom" value={p.costoPromedioUnit.toFixed(2)} />
                                <InfoBox label="Precio Venta" value={p.precioVentaUnd.toFixed(2)} />
                                <InfoBox label="Margen Unit" value={p.margenUnit.toFixed(2)} />
                                <InfoBox label="Margen %" value={`${p.margenPct.toFixed(1)}%`} />
                                <InfoBox wide label="% Riesgo" value={`${p.porcentajeEnRiesgo.toFixed(1)}%`} />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </FragmentRows>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">
              {fromIdx}-{toIdx}
            </span>
            <span className="opacity-60">de</span>
            <span>{total}</span>
            <select
              className="border rounded h-7 px-2 text-xs bg-background/70 backdrop-blur"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
            >
              {[5, 10, 25, 50, 100].map(s => <option key={s} value={s}>{s} / pág</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!Number.isNaN(val)) setPage(Math.min(Math.max(1, val), totalPages))
                }}
                className="w-14 h-8 text-center"
              />
              <span className="text-xs text-muted-foreground">
                / {totalPages}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
