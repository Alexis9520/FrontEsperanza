import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductSummary } from "../types"

interface CriticosTabProps {
  loading: boolean
  criticosFull: ProductSummary[]
}

export function CriticosTab({ loading, criticosFull }: CriticosTabProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const total = criticosFull.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => { if (page > totalPages) setPage(1) }, [totalPages, page])

  const slice = criticosFull.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Crítico</CardTitle>
        <CardDescription>Productos con stock ≤ mínimo</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Cargando...</div>
        ) : total === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">No hay productos críticos</div>
        ) : (
          <>
            <div className="rounded-xl border overflow-x-auto bg-card/70 backdrop-blur-sm">
              <Table className="text-sm min-w-[650px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Faltante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slice.map((p: ProductSummary) => (
                    <TableRow key={p.codigoBarras}>
                      <TableCell>{p.codigoBarras}</TableCell>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="rounded-full">
                          {p.cantidadGeneral} u
                        </Badge>
                      </TableCell>
                      <TableCell>{p.cantidadMinima}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {p.cantidadMinima - p.cantidadGeneral} u
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación frontal para Críticos */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="text-xs text-muted-foreground">
                {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} de {total}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</Button>
                <div className="flex items-center gap-1">
                  <Input className="w-16 h-8" type="number" min={1} max={totalPages} value={page} onChange={e => { const v = Number(e.target.value); if (!Number.isNaN(v)) setPage(Math.min(Math.max(1, v), totalPages)) }} />
                  <span className="text-xs text-muted-foreground">/ {totalPages}</span>
                </div>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</Button>
                <select className="border rounded h-7 px-2 text-xs bg-background/70" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}>
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
