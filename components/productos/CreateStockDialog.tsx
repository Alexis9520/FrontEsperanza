"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/lib/use-toast"
import { createStock } from "@/lib/api"

export default function CreateStockDialog({
  open,
  onOpenChange,
  productoId,
  productoNombre,
  onCreated
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productoId: number | null
  productoNombre?: string | null
  onCreated?: () => void
}) {
  const { toast } = useToast()
  const [codigoStock, setCodigoStock] = useState("")
  const [cantidad, setCantidad] = useState<number | "">("")
  const [precio, setPrecio] = useState<number | "">("")
  const [fechaV, setFechaV] = useState<string>("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) {
      // reset fields when dialog closes
      setCodigoStock("")
      setCantidad("")
      setPrecio("")
      setFechaV("")
      setSaving(false)
    }
  }, [open])

  const handleCreate = async () => {
    if (!productoId) {
      toast({ title: "Error", description: "Producto inválido", variant: "destructive" })
      return
    }
    if (!codigoStock || codigoStock.trim() === "") {
      toast({ title: "Validación", description: "Código de lote es obligatorio", variant: "destructive" })
      return
    }
    const cantidadNum = Math.max(0, Math.floor(Number(cantidad) || 0))
    if (cantidadNum <= 0) {
      toast({ title: "Validación", description: "Cantidad debe ser mayor a 0", variant: "destructive" })
      return
    }

    const payload = {
      codigoStock: codigoStock.trim(),
      cantidadUnidades: cantidadNum,
      precioCompra: Number(precio) || 0,
      idProducto: productoId,
      fechaVencimiento: fechaV || null
    }

    try {
      setSaving(true)
      await createStock(payload)
      toast({ title: "Lote creado", description: "Se agregó el lote correctamente" })
      onOpenChange(false)
      onCreated && onCreated()
    } catch (err: any) {
      console.error("Error createStock", err)
      toast({ title: "Error", description: err?.message || "No se pudo crear lote", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Lote</DialogTitle>
          <DialogDescription>
            Añadir lote para <strong>{productoNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-4">
          <div>
            <Label>Código de Lote</Label>
            <Input value={codigoStock} onChange={e => setCodigoStock(e.target.value)} />
          </div>
          <div>
            <Label>Cantidad Unidades</Label>
            <Input type="number" min={0} value={String(cantidad)} onChange={e => setCantidad(Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
          </div>
          <div>
            <Label>Precio Compra</Label>
            <Input type="number" step="0.01" min={0} value={String(precio)} onChange={e => setPrecio(Number(e.target.value) || "")} />
          </div>
          <div>
            <Label>Fecha Vencimiento</Label>
            <Input type="date" value={fechaV || ""} onChange={e => setFechaV(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Guardando..." : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
