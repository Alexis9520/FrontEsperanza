import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, AlertTriangle } from "lucide-react"
import { ProductSummary } from "../types"

interface VencimientosTabProps {
  loading: boolean
  proximosFull: ProductSummary[]
  vencidosFull: ProductSummary[]
}

export function VencimientosTab({ loading, proximosFull, vencidosFull }: VencimientosTabProps) {
  // Pagination for Proximos
  const [proxPage, setProxPage] = useState(1)
  const [proxPageSize, setProxPageSize] = useState(10)
  const proxTotal = proximosFull.length
  const proxTotalPages = Math.max(1, Math.ceil(proxTotal / proxPageSize))
  useEffect(() => { if (proxPage > proxTotalPages) setProxPage(1) }, [proxTotalPages, proxPage])
  const proxSlice = proximosFull.slice((proxPage - 1) * proxPageSize, (proxPage - 1) * proxPageSize + proxPageSize)

  // Pagination for Vencidos
  const [vencPage, setVencPage] = useState(1)
  const [vencPageSize, setVencPageSize] = useState(10)
  const vencTotal = vencidosFull.length
  const vencTotalPages = Math.max(1, Math.ceil(vencTotal / vencPageSize))
  useEffect(() => { if (vencPage > vencTotalPages) setVencPage(1) }, [vencTotalPages, vencPage])
  const vencSlice = vencidosFull.slice((vencPage - 1) * vencPageSize, (vencPage - 1) * vencPageSize + vencPageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vencimientos</CardTitle>
        <CardDescription>Próximos (≤30d) y Vencidos</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          <Calendar className="h-4 w-4 text-orange-500" /> Próximos (≤30 días)
        </h4>
        {loading ? (
          <div className="text-xs text-muted-foreground mb-6">Cargando...</div>
        ) : proxTotal === 0 ? (
          <div className="text-xs text-muted-foreground mb-6">Sin productos próximos a vencer</div>
        ) : (
          <>
            <div className="rounded-xl border overflow-x-auto bg-card/70 backdrop-blur-sm mb-8">
              <Table className="text-sm min-w-[600px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Próx. Venc (d)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Riesgo %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proxSlice.map((p: ProductSummary) => (
                    <TableRow key={p.codigoBarras}>
                      <TableCell>{p.codigoBarras}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">
                          {p.diasHastaPrimerVencimiento} d
                        </Badge>
                      </TableCell>
                      <TableCell>{p.cantidadGeneral} u</TableCell>
                      <TableCell>{p.porcentajeEnRiesgo.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación frontal para Próximos */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="text-xs text-muted-foreground">{((proxPage - 1) * proxPageSize) + 1}-{Math.min(proxPage * proxPageSize, proxTotal)} de {proxTotal}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={proxPage === 1} onClick={() => setProxPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <div className="flex items-center gap-1">
                  <Input className="w-16 h-8" type="number" min={1} max={proxTotalPages} value={proxPage} onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setProxPage(Math.min(Math.max(1, v), proxTotalPages)) }} />
                  <span className="text-xs text-muted-foreground">/ {proxTotalPages}</span>
                </div>
                <Button size="sm" variant="outline" disabled={proxPage === proxTotalPages} onClick={() => setProxPage(p => Math.min(proxTotalPages, p + 1))}>Siguiente</Button>
                <select className="border rounded h-7 px-2 text-xs bg-background/70" value={proxPageSize} onChange={e => { setProxPageSize(Number(e.target.value)); setProxPage(1) }}>
                  {[5, 10, 25, 50].map(s => <option key={s} value={s}>{s} / pág</option>)}
                </select>
              </div>
            </div>
          </>
        )}

        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 text-red-600" /> Vencidos
        </h4>
        {loading ? (
          <div className="text-xs text-muted-foreground">Cargando...</div>
        ) : vencTotal === 0 ? (
          <div className="text-xs text-muted-foreground">No hay productos vencidos</div>
        ) : (
          <>
            <div className="rounded-xl border overflow-x-auto bg-card/70 backdrop-blur-sm">
              <Table className="text-sm min-w-[600px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Unid Vencidas</TableHead>
                    <TableHead>Stock Total</TableHead>
                    <TableHead>Riesgo %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vencSlice.map((p: ProductSummary) => (
                    <TableRow key={p.codigoBarras}>
                      <TableCell>{p.codigoBarras}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell className="text-red-600 font-semibold">{p.unidadesVencidas}</TableCell>
                      <TableCell>{p.cantidadGeneral}</TableCell>
                      <TableCell>{p.porcentajeEnRiesgo.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación frontal para Vencidos */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="text-xs text-muted-foreground">{((vencPage - 1) * vencPageSize) + 1}-{Math.min(vencPage * vencPageSize, vencTotal)} de {vencTotal}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={vencPage === 1} onClick={() => setVencPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <div className="flex items-center gap-1">
                  <Input className="w-16 h-8" type="number" min={1} max={vencTotalPages} value={vencPage} onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setVencPage(Math.min(Math.max(1, v), vencTotalPages)) }} />
                  <span className="text-xs text-muted-foreground">/ {vencTotalPages}</span>
                </div>
                <Button size="sm" variant="outline" disabled={vencPage === vencTotalPages} onClick={() => setVencPage(p => Math.min(vencTotalPages, p + 1))}>Siguiente</Button>
                <select className="border rounded h-7 px-2 text-xs bg-background/70" value={vencPageSize} onChange={e => { setVencPageSize(Number(e.target.value)); setVencPage(1) }}>
                  {[5, 10, 25, 50].map(s => <option key={s} value={s}>{s} / pág</option>)}
                </select>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
