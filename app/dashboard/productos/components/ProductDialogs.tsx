"use client"

import { Package, Edit, Trash2 } from "lucide-react"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useToast } from "@/lib/use-toast"
import { Producto } from "../types"
import { calcularDiasParaVencer, obtenerEstadoLote } from "../hooks/use-productos"
import ProductoForm from "./ProductoForm"
import EditStockDialog from "./EditStockDialog"
import CreateStockDialog from "./CreateStockDialog"
import { PriceComparisonDialog } from "./PriceComparisonDialog"

interface ProductDialogsProps {
  lotesModalProducto: Producto | null
  setLotesModalProducto: (p: Producto | null) => void
  editingStock: any
  setEditingStock: (s: any) => void
  creatingStockFor: { id: number; nombre?: string } | null
  setCreatingStockFor: (v: { id: number; nombre?: string } | null) => void
  productoAEliminar: Producto | null
  setProductoAEliminar: (p: Producto | null) => void
  eliminando: boolean
  onEliminarProducto: () => void
  stockToDelete: { id: number | string; codigo?: string | null; productoId?: number } | null
  setStockToDelete: (v: any) => void
  deletingStock: boolean
  onEliminarStock: (id: number) => void
  editandoProducto: any
  setEditandoProducto: (p: any) => void
  diccionarioProveedores: Record<number, string>
  onGuardarEdicion: () => void
  onRefresh: () => void
  // Comparación de precios
  priceCompareProduct: Producto | null
  setPriceCompareProduct: (p: Producto | null) => void
}

export function ProductDialogs({
  lotesModalProducto,
  setLotesModalProducto,
  editingStock,
  setEditingStock,
  creatingStockFor,
  setCreatingStockFor,
  productoAEliminar,
  setProductoAEliminar,
  eliminando,
  onEliminarProducto,
  stockToDelete,
  setStockToDelete,
  deletingStock,
  onEliminarStock,
  editandoProducto,
  setEditandoProducto,
  diccionarioProveedores,
  onGuardarEdicion,
  onRefresh,
  priceCompareProduct,
  setPriceCompareProduct
}: ProductDialogsProps) {
  const { toast } = useToast()

  return (
    <>
      {/* MODAL LOTES */}
      <Dialog
        open={!!lotesModalProducto}
        onOpenChange={() => setLotesModalProducto(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" /> Lotes de{" "}
              {lotesModalProducto?.nombre}
            </DialogTitle>
            <DialogDescription>
              Código: {lotesModalProducto?.codigoBarras} • Registro: {lotesModalProducto?.nroRegistroSanitario || "—"} • {lotesModalProducto?.stocks?.length || 0} lotes
            </DialogDescription>
          </DialogHeader>
          {lotesModalProducto && (
            <div className="space-y-5">
              <div className="rounded-xl border bg-muted/40 backdrop-blur-sm overflow-auto">
                <Table className="text-sm">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Unidades</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Compra (S/)</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotesModalProducto.stocks?.map(l => {
                      const dias = calcularDiasParaVencer(l.fechaVencimiento)
                      const est = obtenerEstadoLote(l.fechaVencimiento)
                      return (
                        <TableRow
                          key={
                            l.codigoStock ||
                            `${l.fechaVencimiento}-${l.cantidadUnidades}`
                          }
                        >
                          <TableCell>
                            <Badge variant="outline" className="rounded-full">
                              {l.codigoStock || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {l.cantidadUnidades}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              l.fechaVencimiento
                            ).toLocaleDateString("es-PE")}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            S/ {l.precioCompra.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={est.color as any} className="rounded-full">
                              {est.texto}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={clsx(
                                dias < 0
                                  ? "text-red-600"
                                  : dias <= 30
                                    ? "text-amber-500"
                                    : "text-emerald-600",
                                "tabular-nums text-xs font-medium"
                              )}
                            >
                              {dias < 0 ? `-${Math.abs(dias)} d` : `${dias} d`}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const stockId = (l as any).id ?? (l as any).lote_id ?? (l as any).stockId ?? null
                                  if (!stockId) {
                                    toast({ title: 'Error', description: 'Lote sin identificador (id)', variant: 'destructive' })
                                    return
                                  }
                                  setEditingStock({
                                    ...(l as any),
                                    idProducto: lotesModalProducto?.id,
                                    nombre: lotesModalProducto?.nombre,
                                    concentracion: lotesModalProducto?.concentracion,
                                    cantidadMinima: lotesModalProducto?.cantidadMinima,
                                    precioVenta: (lotesModalProducto as any)?.precioVentaUnd ?? (lotesModalProducto as any)?.precioVenta,
                                    laboratorio: lotesModalProducto?.laboratorio,
                                    categoria: lotesModalProducto?.categoria
                                  })
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const stockId = (l as any).id ?? (l as any).lote_id ?? (l as any).stockId ?? null
                                  if (!stockId) {
                                    toast({ title: 'Error', description: 'Lote sin identificador (id)', variant: 'destructive' })
                                    return
                                  }
                                  setStockToDelete({ id: stockId, codigo: l.codigoStock ?? null, productoId: lotesModalProducto?.id })
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {editingStock && (
        <EditStockDialog
          open={!!editingStock}
          onOpenChange={(v) => { if (!v) setEditingStock(null) }}
          stock={editingStock}
          onSaved={() => { setEditingStock(null); onRefresh() }}
        />
      )}

      {/* DIALOG CREAR LOTE */}
      {creatingStockFor && (
        <CreateStockDialog
          open={!!creatingStockFor}
          onOpenChange={(v) => { if (!v) setCreatingStockFor(null) }}
          productoId={creatingStockFor.id}
          productoNombre={creatingStockFor.nombre}
          onCreated={() => { setCreatingStockFor(null); onRefresh() }}
        />
      )}

      {/* DIALOG CONFIRMAR ELIMINACIÓN DE PRODUCTO */}
      <Dialog
        open={!!productoAEliminar}
        onOpenChange={() => {
          if (!productoAEliminar) return
          setProductoAEliminar(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el producto <strong>{productoAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductoAEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onEliminarProducto}
              disabled={eliminando}
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG CONFIRMAR ELIMINACIÓN DE LOTE (STOCK) */}
      <Dialog
        open={!!stockToDelete}
        onOpenChange={() => {
          if (!stockToDelete) return
          setStockToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar lote</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el lote <strong>{stockToDelete?.codigo ?? stockToDelete?.id}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStockToDelete(null)}
              disabled={deletingStock}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (stockToDelete) {
                  onEliminarStock(Number(stockToDelete.id))
                  setStockToDelete(null)
                }
              }}
              disabled={deletingStock}
            >
              {deletingStock ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDITAR */}
      <Dialog open={!!editandoProducto} onOpenChange={() => setEditandoProducto(null)}>
        <DialogContent className="max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Actualiza datos del producto y sus lotes
            </DialogDescription>
          </DialogHeader>

          {editandoProducto && (
            <ProductoForm
              datos={editandoProducto}
              setDatos={setEditandoProducto}
              diccionarioProveedores={diccionarioProveedores}
              modoEdicion={true}
            />
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEditandoProducto(null)}>
              Cancelar
            </Button>
            <Button onClick={onGuardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG COMPARACIÓN DE PRECIOS */}
      <PriceComparisonDialog
        open={!!priceCompareProduct}
        onOpenChange={(open) => {
          if (!open) setPriceCompareProduct(null)
        }}
        productoId={priceCompareProduct?.id ?? null}
        productoNombre={priceCompareProduct?.nombre}
      />
    </>
  )
}
