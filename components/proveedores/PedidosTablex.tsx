"use client"

import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2 } from "lucide-react"
import { getPedidoReport, type PedidoReportDTO, fetchWithAuth, deletePedido, editPedido } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { useToast } from "@/lib/use-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import Spinner from "@/components/ui/Spinner"

export default function PedidosTablex({ initialProviderId, initialFecha }: { initialProviderId?: string; initialFecha?: string }) {
  const { toast } = useToast()
  const [pedidos, setPedidos] = useState<PedidoReportDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ row: PedidoReportDTO; rowKey: string } | null>(null)
  // Edit modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PedidoReportDTO | null>(null)
  const [editingSaving, setEditingSaving] = useState(false)
  

  const [proveedores, setProveedores] = useState<{ id: number; razonComercial: string }[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>(initialProviderId ?? "")
  const [fechaPedido, setFechaPedido] = useState<string>(initialFecha ?? new Date().toISOString().split("T")[0])

  // Edit form fields (defined after selectedProvider/fechaPedido)
  const [editProveedorId, setEditProveedorId] = useState<string>(selectedProvider ?? "")
  const [editFecha, setEditFecha] = useState<string>(fechaPedido)
  const [editStockCodigo, setEditStockCodigo] = useState<string>("")
  const [editStockCantidadInicial, setEditStockCantidadInicial] = useState<number | "">("")
  const [editStockFechaVenc, setEditStockFechaVenc] = useState<string | null>(null)
  const [editStockPrecioCompra, setEditStockPrecioCompra] = useState<number | "">("")

  // Reflect incoming initial props if they change
  useEffect(() => {
    if (initialProviderId !== undefined) setSelectedProvider(initialProviderId)
    if (initialFecha !== undefined) setFechaPedido(initialFecha)
  }, [initialProviderId, initialFecha])

  // Cargar proveedores para el select
  useEffect(() => {
    let mounted = true
    const loadProvs = async () => {
      try {
        const data = await fetchWithAuth(apiUrl("/proveedores"))
        if (!mounted) return
        setProveedores(Array.isArray(data) ? data.map((d: any) => ({ id: d.id, razonComercial: d.razonComercial })) : [])
      } catch (e) {
        console.error("Error cargando proveedores en PedidosTablex:", e)
        setProveedores([])
      }
    }
    loadProvs()
    return () => { mounted = false }
  }, [])

  // Cargar pedidos según filtros (provider + fecha)
  const loadPedidos = async () => {
    setLoading(true)
    try {
      const pId = selectedProvider ? parseInt(selectedProvider) : 0
      const res = await getPedidoReport({ proveedorId: pId, fechaPedido })
      setPedidos(Array.isArray(res) ? res : [])
    } catch (e) {
      console.error("Error cargando pedidos:", e)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    // wrap load to avoid state update after unmount
    const wrapped = async () => {
      if (!mounted) return
      await loadPedidos()
    }
    wrapped()
    return () => { mounted = false }
  }, [selectedProvider, fechaPedido])

  const handleDelete = async (row: PedidoReportDTO, rowKey: string) => {
    // Require pedidoId to proceed. If missing, show error immediately.
    const pid = (row as any).pedidoId
    if (!pid) {
      toast({ title: "No se puede eliminar", description: "Identificador (pedidoId) no encontrado para este registro.", variant: "destructive" })
      return
    }
    setDeleteTarget({ row, rowKey })
    setDeleteDialogOpen(true)
  }

  // Open edit modal: extract row data into form
  const openEditModal = (row: PedidoReportDTO) => {
    if (!((row as any).pedidoId)) {
      toast({ title: "No editable", description: "Este registro no tiene pedidoId. No puede editarse.", variant: "destructive" })
      return
    }
    setEditTarget(row)
    setEditProveedorId(selectedProvider ?? "")
    // fecha default to current filtro de pedidos
    setEditFecha(fechaPedido)
    setEditStockCodigo(row.codigoStock ?? "")
    setEditStockCantidadInicial(typeof row.cantInicial === 'number' ? row.cantInicial : (row.cantInicial ? Number(row.cantInicial) : ""))
    setEditStockFechaVenc(row.fvencimiento ?? null)
    setEditStockPrecioCompra(typeof row.precioCompra === 'number' ? row.precioCompra : (row.precioCompra ? Number(row.precioCompra) : ""))
    setEditDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const { row, rowKey } = deleteTarget

    const raw = (row as any).pedidoId
    if (raw == null) {
      toast({ title: "No se puede eliminar", description: "Identificador (pedidoId) no encontrado para este registro.", variant: "destructive" })
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      return
    }

    setDeletingKey(rowKey)
    try {
      await deletePedido(raw, toast)
      toast({ title: 'Eliminado', description: `Pedido eliminado: ${row.producto}`, variant: 'default' })
      await loadPedidos()
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    } catch (e: any) {
      console.error("Error eliminando pedido:", e)
      toast({ title: 'Error', description: e?.message || 'No se pudo eliminar el pedido', variant: 'destructive' })
    } finally {
      setDeletingKey(null)
    }
  }

  // Confirm edit (PUT /api/pedidos/{id})
  const confirmEdit = async () => {
    if (!editTarget) return
    const rawId = (editTarget as any).pedidoId
    if (rawId == null) {
      toast({ title: "No se puede editar", description: "Identificador (pedidoId) no encontrado para este registro.", variant: "destructive" })
      setEditDialogOpen(false)
      setEditTarget(null)
      return
    }

    // Basic validations
    const proveedorIdNum = editProveedorId ? parseInt(editProveedorId) : (selectedProvider ? parseInt(selectedProvider) : NaN)
    if (isNaN(proveedorIdNum) || proveedorIdNum <= 0) {
      toast({ title: "Proveedor inválido", description: "Selecciona un proveedor válido.", variant: "destructive" })
      return
    }
    if (!editStockCodigo || String(editStockCodigo).trim() === "") {
      toast({ title: "Código vacío", description: "Ingresa el código de stock.", variant: "destructive" })
      return
    }
    const cantidad = typeof editStockCantidadInicial === 'number' ? editStockCantidadInicial : (editStockCantidadInicial ? Number(editStockCantidadInicial) : NaN)
    if (isNaN(cantidad) || cantidad <= 0) {
      toast({ title: "Cantidad inválida", description: "Ingresa una cantidad inicial mayor que 0.", variant: "destructive" })
      return
    }

    const payload = {
      proveedorId: proveedorIdNum,
      fechaDePedido: editFecha,
      stock: {
        codigoStock: editStockCodigo,
        cantidadInicial: cantidad,
        fechaVencimiento: editStockFechaVenc ?? null,
        precioCompra: typeof editStockPrecioCompra === 'number' ? editStockPrecioCompra : (editStockPrecioCompra ? Number(editStockPrecioCompra) : 0)
      }
    }

    setEditingSaving(true)
    try {
      await editPedido(rawId, payload, toast)
      toast({ title: 'Pedido actualizado', description: `Pedido modificado: ${editTarget.producto}` })
      setEditDialogOpen(false)
      setEditTarget(null)
      await loadPedidos()
    } catch (e: any) {
      console.error('Error editando pedido:', e)
      toast({ title: 'Error', description: e?.message || 'No se pudo editar el pedido', variant: 'destructive' })
    } finally {
      setEditingSaving(false)
    }
  }

  // Provider name for the edit modal (read-only display)
  const editProveedorName = (() => {
    const idToUse = editProveedorId || selectedProvider || ""
    const found = proveedores.find(p => String(p.id) === String(idToUse))
    return found ? found.razonComercial : ""
  })()

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription className="text-sm">Listado de pedidos</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              onChange={(e) => setSelectedProvider(e.target.value)}
              value={selectedProvider}
              className="bg-background/50 border px-3 py-1 rounded text-sm"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map(p => (
                <option key={p.id} value={String(p.id)}>{p.razonComercial}</option>
              ))}
            </select>
            <input type="date" value={fechaPedido} onChange={(e) => setFechaPedido(e.target.value)} className="bg-background/50 border px-3 py-1 rounded text-sm" />
            <Button size="sm" variant="outline" onClick={() => { /* manual refresh: trigger effect by resetting state */ setFechaPedido(f => f) }}>
              Refrescar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No hay pedidos para la fecha seleccionada.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cód. Barras</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead className="text-right">Cant. Actual</TableHead>
                  <TableHead className="text-right">Cant. Inicial</TableHead>
                  <TableHead className="text-right">P. Compra</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((p, i) => {
                  const rowKey = p.pedidoId ? `pedido-${p.pedidoId}` : `pedido-noid-${i}`
                  return (
                  <TableRow key={rowKey}>
                    <TableCell className="font-mono text-sm">{p.codigoBarras || "—"}</TableCell>
                    <TableCell className="font-medium">{p.producto}</TableCell>
                    <TableCell className="font-mono text-sm">{p.codigoStock || "—"}</TableCell>
                    <TableCell className="text-right">{p.cantUnidades}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.cantInicial}</TableCell>
                    <TableCell className="text-right">{typeof p.precioCompra === 'number' ? p.precioCompra.toFixed(2) : '—'}</TableCell>
                    <TableCell>{p.fvencimiento || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.fcreacion ? new Date(p.fcreacion).toLocaleString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openEditModal(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(p, rowKey)}
                          disabled={deletingKey === rowKey || !p.pedidoId}
                        >
                          <Trash2 className={`w-4 h-4 text-rose-500 ${deletingKey === rowKey ? 'opacity-40' : ''} ${!p.pedidoId ? 'opacity-30 cursor-not-allowed' : ''}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) { setDeleteDialogOpen(false); setDeleteTarget(null) } else setDeleteDialogOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {deleteTarget ? `¿Eliminar pedido: ${deleteTarget.row.producto}? Esta acción no se puede deshacer.` : "¿Eliminar este pedido?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null) }} disabled={!!deletingKey}>Cancelar</Button>
            <Button onClick={confirmDelete} disabled={!!deletingKey}>
              {deletingKey ? <span className="flex items-center gap-2"><Spinner /> Eliminando...</span> : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setEditDialogOpen(false); setEditTarget(null) } else setEditDialogOpen(open) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar pedido</DialogTitle>
            <DialogDescription>
              Modifica los datos del pedido y confirma para guardar los cambios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div>
              <Label>Proveedor</Label>
              <Input value={editProveedorName} disabled />
            </div>

            <div>
              <Label>Fecha de pedido</Label>
              <input type="date" value={editFecha} onChange={(e) => setEditFecha(e.target.value)} className="w-full bg-background/50 border rounded px-2 py-1 text-sm" />
            </div>

            <div>
              <Label>Código de Lote</Label>
              <Input value={editStockCodigo} onChange={(e) => setEditStockCodigo(e.target.value)} />
            </div>

            <div>
              <Label>Cantidad inicial</Label>
              <Input type="number" value={String(editStockCantidadInicial ?? "")} onChange={(e) => setEditStockCantidadInicial(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>

            <div>
              <Label>Fecha de vencimiento</Label>
              <input type="date" value={editStockFechaVenc ?? ""} onChange={(e) => setEditStockFechaVenc(e.target.value || null)} className="w-full bg-background/50 border rounded px-2 py-1 text-sm" />
            </div>

            <div>
              <Label>Precio de compra</Label>
              <Input type="number" step="0.01" value={String(editStockPrecioCompra ?? "")} onChange={(e) => setEditStockPrecioCompra(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditDialogOpen(false); setEditTarget(null) }} disabled={editingSaving}>Cancelar</Button>
            <Button onClick={confirmEdit} disabled={editingSaving}>
              {editingSaving ? <span className="flex items-center gap-2"><Spinner /> Guardando...</span> : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
