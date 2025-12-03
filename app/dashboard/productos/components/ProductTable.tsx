"use client"

import React from "react"
import {
  ChevronDown,
  ChevronRight,
  LayoutList,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Layers,
  AlertCircle,
  Scale
} from "lucide-react"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Producto } from "../types"
import { calcularDiasParaVencer, obtenerEstadoLote } from "../hooks/use-productos"

interface ProductTableProps {
  productos: Producto[]
  loading: boolean
  expandedRows: Record<number, boolean>
  toggleExpand: (id: number) => void
  densityCompact: boolean
  page: number
  totalPages: number
  setPage: (val: number | ((prev: number) => number)) => void
  onEdit: (p: Producto) => void
  onDelete: (p: Producto) => void
  onSetCreatingStockFor: (p: { id: number; nombre?: string }) => void
  onSetLotesModalProducto: (p: Producto) => void
  onComparePrice: (p: Producto) => void
}

export function ProductTable({
  productos,
  loading,
  expandedRows,
  toggleExpand,
  densityCompact,
  page,
  totalPages,
  setPage,
  onEdit,
  onDelete,
  onSetCreatingStockFor,
  onSetLotesModalProducto,
  onComparePrice
}: ProductTableProps) {

  function stockMinBadge(producto: Producto) {
    if (producto.cantidadMinima === undefined) return null
    const esCritico = producto.cantidadGeneral <= (producto.cantidadMinima ?? 0)
    return (
      <div className="flex items-center gap-1 flex-wrap text-[10px] mt-1">
        <span className="text-muted-foreground">Min:</span>
        <span className="font-medium">{producto.cantidadMinima}</span>
        {esCritico && (
          <Badge
            variant="destructive"
            className="h-4 px-1.5 text-[9px] rounded-full flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> Crítico
          </Badge>
        )}
      </div>
    )
  }

  function stockBar(p: Producto) {
    const min = p.cantidadMinima ?? 0
    const current = p.cantidadGeneral
    const pct =
      min === 0
        ? 100
        : Math.min(100, Math.round((current / (min * 2 || 1)) * 100))
    const color =
      current <= min
        ? "bg-red-500"
        : current <= min * 2
          ? "bg-amber-500"
          : "bg-emerald-500"

    return (
      <div className="space-y-1 w-32">
        <div className="h-1.5 rounded bg-gradient-to-r from-slate-300/40 to-slate-400/30 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
          <div
            className={clsx("h-full transition-all duration-500 ease-out", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] flex justify-between text-muted-foreground">
          <span>{current} u</span>
          {min > 0 && <span>Min {min}</span>}
        </div>
      </div>
    )
  }

  function resumenLotes(producto: Producto) {
    const lotes = producto.stocks || []
    if (!lotes.length)
      return <span className="text-[11px] text-muted-foreground">Sin lotes</span>
    const total = lotes.reduce((s, l) => s + l.cantidadUnidades, 0)
    const proximos = lotes
      .map(l => calcularDiasParaVencer(l.fechaVencimiento))
      .sort((a, b) => a - b)
    const d = proximos[0]
    const estado =
      d < 0
        ? { label: "Vencido", cls: "text-red-600" }
        : d <= 30
          ? { label: `${d} d`, cls: "text-amber-500" }
          : { label: `> ${d} d`, cls: "text-muted-foreground" }

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge
            variant="outline"
            className="px-1.5 h-5 text-[10px] rounded-full"
          >
            {lotes.length} lote{lotes.length !== 1 && "s"}
          </Badge>
          <Badge
            variant="secondary"
            className="px-1.5 h-5 text-[10px] rounded-full"
          >
            {total} u
          </Badge>
        </div>
        <span className={clsx("text-[10px] font-medium", estado.cls)}>
          {estado.label}
        </span>
      </div>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <LayoutList className="h-4 w-4 text-cyan-400" />
          Catálogo
        </CardTitle>
        <CardDescription className="text-xs">
          Expande para ver detalles y lotes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border bg-background/70 backdrop-blur-md overflow-x-auto">
          <Table
            className={clsx(
              "transition-all",
              densityCompact && "[&_td]:py-1 [&_th]:py-2 text-sm"
            )}
          >
            <TableHeader className="bg-muted/40 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Clasificación</TableHead>
                <TableHead>Proveedores</TableHead>
                <TableHead>Presentación</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Blister</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Lotes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map(p => {
                const expanded = !!expandedRows[p.id]
                return (
                  <React.Fragment key={p.id}>
                    <TableRow
                      className={clsx(
                        "group cursor-pointer transition-colors",
                        expanded && "bg-muted/30",
                        "hover:bg-muted/25"
                      )}
                      onDoubleClick={() => toggleExpand(p.id)}
                    >
                      <TableCell className="p-0 pl-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleExpand(p.id)}
                          aria-label={expanded ? "Contraer" : "Expandir"}
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">
                        {p.codigoBarras}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {p.nombre}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{p.concentracion || "—"}</span>
                            <Badge
                              variant={
                                p.tipoMedicamento === "GENÉRICO"
                                  ? "outline"
                                  : "secondary"
                              }
                              className="px-1.5 h-4 text-[10px] rounded-full"
                            >
                              {p.tipoMedicamento === "GENÉRICO"
                                ? "Genérico"
                                : "Marca"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[11px]">
                          <span className="font-medium">
                            {p.categoria || "—"}
                          </span>
                          <div className="text-muted-foreground">
                            {p.laboratorio || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {p.proveedores && p.proveedores.length > 0 ? (
                            p.proveedores.map((prov) => (
                              <Badge
                                key={prov.id}
                                variant="secondary"
                                className="px-1.5 h-5 text-[9px] rounded-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                              >
                                {prov.razonComercial}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Sin proveedor</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-[11px] max-w-[160px] truncate">
                                {p.presentacion || "—"}
                                {p.principioActivo && (
                                  <span className="text-muted-foreground ml-1">
                                    · {p.principioActivo}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            {p.principioActivo && (
                              <TooltipContent>
                                <p className="text-xs">
                                  Principio activo:{" "}
                                  <strong>{p.principioActivo}</strong>
                                </p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="align-top">
                        {stockBar(p)}
                        {stockMinBadge(p)}
                      </TableCell>
                      <TableCell>
                        {p.cantidadUnidadesBlister ? (
                          <div className="flex flex-col gap-0.5 text-[11px]">
                            <Badge
                              variant="outline"
                              className="px-1.5 h-5 rounded-full"
                            >
                              {p.cantidadUnidadesBlister} u
                            </Badge>
                            {p.precioVentaBlister && (
                              <span className="text-muted-foreground tabular-nums">
                                S/{" "}
                                {Number(p.precioVentaBlister).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold tabular-nums">
                          S/ {Number(p.precioVentaUnd).toFixed(2)}
                        </div>
                        {p.descuento > 0 && (
                          <div className="text-[11px] text-emerald-600 font-medium">
                            Desc: S/ {p.descuento.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{resumenLotes(p)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10"
                                  onClick={() => onComparePrice(p)}
                                >
                                  <Scale className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Comparar precios de proveedores</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onEdit(p)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onDelete(p)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expanded && (
                      <TableRow className="bg-muted/20">
                        <TableCell />
                        <TableCell colSpan={9} className="py-5">
                          <div className="grid lg:grid-cols-5 gap-6 text-sm">
                            {/* Detalles */}
                            <div className="space-y-3 lg:col-span-1">
                              <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                <LayoutList className="h-4 w-4" /> Detalles
                              </h4>
                              <Detail
                                label="Principio activo"
                                value={p.principioActivo || "—"}
                              />
                              <Detail
                                label="Presentación"
                                value={p.presentacion || "—"}
                              />
                              <Detail
                                label="Tipo"
                                value={p.tipoMedicamento || "—"}
                              />
                              <Detail
                                label="Laboratorio"
                                value={p.laboratorio || "—"}
                              />
                            </div>

                            {/* Lotes */}
                            <div className="space-y-3 lg:col-span-2">
                              <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                <Package className="h-4 w-4" /> Lotes
                              </h4>
                              {(p.stocks?.length ?? 0) === 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Sin lotes
                                </div>
                              )}
                              {(p.stocks?.length ?? 0) > 0 && (
                                <div className="max-h-48 overflow-auto rounded-lg border bg-background/60 backdrop-blur-sm">
                                  <Table className="text-[11px]">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="py-1">
                                          Lote
                                        </TableHead>
                                        <TableHead className="py-1">
                                          Unid
                                        </TableHead>
                                        <TableHead className="py-1">
                                          Venc
                                        </TableHead>
                                        <TableHead className="py-1">
                                          Compra
                                        </TableHead>
                                        <TableHead className="py-1">
                                          Estado
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {p.stocks?.map((l, li) => {
                                        const est = obtenerEstadoLote(
                                          l.fechaVencimiento
                                        )
                                        return (
                                          <TableRow
                                            key={
                                              // Use a stable composite key: product id + stock identifier + index
                                              `${p.id}-${l.codigoStock ?? `${l.fechaVencimiento}-${l.cantidadUnidades}`}-${li}`
                                            }
                                          >
                                            <TableCell className="py-1">
                                              {l.codigoStock}
                                            </TableCell>
                                            <TableCell className="py-1 tabular-nums">
                                              {l.cantidadUnidades}
                                            </TableCell>
                                            <TableCell className="py-1">
                                              {new Date(
                                                l.fechaVencimiento
                                              ).toLocaleDateString("es-PE")}
                                            </TableCell>
                                            <TableCell className="py-1 tabular-nums">
                                              S/{" "}
                                              {Number(
                                                l.precioCompra
                                              ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="py-1">
                                              <Badge
                                                variant={est.color as any}
                                                className="h-5 px-1.5 text-[10px] rounded-full"
                                              >
                                                {est.texto}{" "}
                                                {est.dias >= 0 &&
                                                  `(${est.dias}d)`}
                                              </Badge>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                              <div className="pt-3">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-[11px] flex items-center gap-2 text-red-600"
                                  onClick={() => onSetCreatingStockFor({ id: p.id, nombre: p.nombre })}
                                >
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  Crear lote sin pedido
                                </Button>
                              </div>
                            </div>

                            {/* Resumen */}
                            <div className="space-y-3 lg:col-span-2">
                              <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                <Layers className="h-4 w-4" /> Resumen
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <InfoBox
                                  label="Unidades totales"
                                  value={p.cantidadGeneral}
                                />
                                <InfoBox
                                  label="Stock mínimo"
                                  value={p.cantidadMinima ?? 0}
                                />
                                <InfoBox
                                  label="Valor compra"
                                  value={`S/ ${(p.stocks || [])
                                    .reduce(
                                      (s, l) =>
                                        s +
                                        l.cantidadUnidades * l.precioCompra,
                                      0
                                    )
                                    .toFixed(2)}`}
                                  wide
                                />
                                <InfoBox
                                  label="Lotes"
                                  value={p.stocks?.length || 0}
                                />
                                <InfoBox
                                  label="Próx. Venc."
                                  value={
                                    p.stocks?.length
                                      ? Math.min(
                                        ...p.stocks.map(l =>
                                          calcularDiasParaVencer(
                                            l.fechaVencimiento
                                          )
                                        )
                                      ) + " d"
                                      : "—"
                                  }
                                />
                                <div className="col-span-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[11px]"
                                    onClick={() => onSetLotesModalProducto(p)}
                                  >
                                    Más acciones de lotes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })}
              {productos.length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={11} className="py-10">
                    <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                      <div className="h-8 w-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                      Cargando...
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-xs text-muted-foreground space-x-3">
            <span>
              Página {page} de {totalPages}
            </span>

          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              <Input
                className="w-16 h-8"
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!Number.isNaN(val))
                    setPage(Math.min(Math.max(1, val), totalPages))
                }}
              />
              <span className="text-xs text-muted-foreground">
                / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
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

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <p className="text-[12px] leading-snug">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </p>
  )
}

function InfoBox({
  label,
  value,
  wide,
  accent
}: {
  label: string
  value: any
  wide?: boolean
  accent?: string
}) {
  return (
    <div
      className={clsx(
        "p-2 rounded-lg border bg-background/50 backdrop-blur-sm flex flex-col gap-0.5",
        wide && "col-span-2"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={clsx("text-xs font-semibold tabular-nums", accent)}>
        {value}
      </span>
    </div>
  )
}
