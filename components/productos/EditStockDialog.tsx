"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/use-toast"
import { editStock } from "@/lib/api"

type StockLike = {
  // puede contener distintos nombres según endpoint
  lote_id?: number
  id?: number
  stockId?: number
  codigoStock?: string | null
  cantidadUnidades?: number
  fechaVencimiento?: string | null
  precioCompra?: number | null
  codigoBarras?: string | null
  // campos adicionales del producto para enviar en el body
  idProducto?: number
  nombre?: string
  concentracion?: string | null
  cantidadMinima?: number | null
  precioVenta?: number | null
  laboratorio?: string | null
  categoria?: string | null
}

export default function EditStockDialog({
  open,
  onOpenChange,
  stock,
  onSaved
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: StockLike | null
  onSaved?: () => void
}) {
  const { toast } = useToast()
  const [codigoStock, setCodigoStock] = useState("")
  const [cantidad, setCantidad] = useState<number | "">("")
  const [precio, setPrecio] = useState<number | "">("")
  const [fechaV, setFechaV] = useState<string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!stock) return
    setCodigoStock(stock.codigoStock ?? "")
    setCantidad(stock.cantidadUnidades ?? "")
    setPrecio(stock.precioCompra ?? "")
    setFechaV(stock.fechaVencimiento ?? "")
  }, [stock])

  const resolveStockId = (s: StockLike | null) => {
    if (!s) return null
    // Prioriza el campo `id` que el backend devuelve para cada stock
    return (s as any).id ?? (s as any).lote_id ?? (s as any).stockId ?? null
  }

  const handleSave = async () => {
    const id = resolveStockId(stock)
    if (!id) {
      toast({ title: "Error", description: "Stock sin identificador (id)", variant: "destructive" })
      return
    }
    if (!codigoStock || codigoStock.trim() === "") {
      toast({ title: "Validación", description: "Código de lote es obligatorio", variant: "destructive" })
      return
    }
    if (!fechaV || fechaV.trim() === "") {
      toast({ title: "Validación", description: "Fecha de vencimiento es obligatoria", variant: "destructive" })
      return
    }
    // Construir body con los campos que el backend espera, incluyendo ids
    const body = {
      id: id,
      codigoStock: codigoStock.trim(),
      idProducto: (stock && ((stock as any).idProducto ?? (stock as any).productoId)) ?? undefined,
      nombre: stock?.nombre ?? undefined,
      concentracion: stock?.concentracion ?? undefined,
      cantidadUnidades: Number(cantidad) || 0,
      cantidadMinima: stock?.cantidadMinima ?? undefined,
      precioCompra: Number(precio) || 0,
      precioVenta: stock?.precioVenta ?? undefined,
      fechaVencimiento: fechaV || null,
      laboratorio: stock?.laboratorio ?? undefined,
      categoria: stock?.categoria ?? undefined
    }
    try {
      setSaving(true)
      await editStock(id, body)
      toast({ title: "Guardado", description: "Lote actualizado" })
      onOpenChange(false)
      onSaved && onSaved()
    } catch (err: any) {
      console.error("Error editStock", err)
      // Interpret HTTP status for user-friendly messages
      let friendlyMsg = err?.message || "No se pudo actualizar lote"
      if (err?.status === 403 || friendlyMsg.toLowerCase().includes('forbidden')) {
        friendlyMsg = 'No se puede editar este lote porque tiene un pedido vinculado. Los cambios podrían afectar registros de compra.'
      } else if (err?.status === 409 || friendlyMsg.toLowerCase().includes('conflict')) {
        friendlyMsg = 'Conflicto: el lote tiene ventas registradas. Algunos campos no se pueden modificar.'
      } else if (err?.status === 400) {
        friendlyMsg = 'Datos inválidos. Verifica que todos los campos obligatorios estén completos y sean correctos.'
      }
      toast({ title: "Error al guardar", description: friendlyMsg, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Lote</DialogTitle>
          <DialogDescription>Actualiza los datos del lote / stock</DialogDescription>
        </DialogHeader>
        {/* Validación: todos los campos menos Precio son obligatorios */}
        {(() => {
          const errs: string[] = []
          if (!codigoStock || codigoStock.trim() === "") errs.push('Código de lote es obligatorio')
          const cantidadNum = Math.max(0, Math.floor(Number(cantidad) || 0))
          if (cantidadNum <= 0) errs.push('Cantidad debe ser mayor a 0')
          if (!fechaV || fechaV.trim() === "") errs.push('Fecha de vencimiento es obligatoria')
          if (errs.length > 0) {
            return (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-100 text-rose-700 text-sm mb-2">
                <strong className="block mb-1">Faltan datos obligatorios:</strong>
                <ul className="list-disc ml-5 space-y-0.5">
                  {errs.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )
          }
          return null
        })()}

        <div className="grid gap-3 mt-4">
          <div>
            <Label>Código de Lote</Label>
            <Input value={codigoStock} onChange={e => setCodigoStock(e.target.value)} />
            {(!codigoStock || codigoStock.trim() === "") && <p className="text-xs text-rose-600 mt-1">Código de lote es obligatorio.</p>}
          </div>
          <div>
            <Label>Cantidad Unidades</Label>
            <Input
              type="number"
              step={1}
              min={1}
              value={String(cantidad)}
              onChange={e => setCantidad(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            />
            {!(Math.max(0, Math.floor(Number(cantidad) || 0)) > 0) && <p className="text-xs text-rose-600 mt-1">Cantidad debe ser mayor a 0.</p>}
          </div>
          <div>
            <Label>Precio Compra</Label>
            <Input type="number" step="0.01" min={0} value={String(precio)} onChange={e => setPrecio(Number(e.target.value) || "")} />
          </div>
          <div>
            <Label>Fecha Vencimiento</Label>
            <Input type="date" value={fechaV || ""} onChange={e => setFechaV(e.target.value)} />
            {(!fechaV || fechaV.trim() === "") && <p className="text-xs text-rose-600 mt-1">Fecha de vencimiento es obligatoria.</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !codigoStock || Math.max(0, Math.floor(Number(cantidad) || 0)) <= 0 || !fechaV}>{saving ? "Guardando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
