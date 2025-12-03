"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Proveedor } from "../types"

interface ProveedoresDialogsProps {
  editandoProveedor: any
  setEditandoProveedor: (p: any) => void
  cerrarEdicion: () => void
  guardarEdicion: () => void
  proveedorAEliminar: Proveedor | null
  setProveedorAEliminar: (p: Proveedor | null) => void
  eliminando: boolean
  eliminarProveedorPorId: (id: number) => Promise<void>
}

export function ProveedoresDialogs({
  editandoProveedor,
  setEditandoProveedor,
  cerrarEdicion,
  guardarEdicion,
  proveedorAEliminar,
  setProveedorAEliminar,
  eliminando,
  eliminarProveedorPorId
}: ProveedoresDialogsProps) {
  return (
    <>
      {/* DIALOG CONFIRMAR ELIMINACIÓN */}
      <Dialog
        open={!!proveedorAEliminar}
        onOpenChange={() => setProveedorAEliminar(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar proveedor</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar el proveedor <strong>{proveedorAEliminar?.razonComercial}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProveedorAEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!proveedorAEliminar) return
                try {
                  await eliminarProveedorPorId(proveedorAEliminar.id)
                } finally {
                  setProveedorAEliminar(null)
                }
              }}
              disabled={eliminando}
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDITAR */}
      <Dialog open={!!editandoProveedor} onOpenChange={cerrarEdicion}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Proveedor</DialogTitle>
            <DialogDescription>
              Actualiza los datos del proveedor
            </DialogDescription>
          </DialogHeader>

          {editandoProveedor && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">RUC *</Label>
                  <Input
                    value={editandoProveedor.ruc}
                    onChange={e => setEditandoProveedor((p: any) => ({ ...p, ruc: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Razón Comercial *</Label>
                  <Input
                    value={editandoProveedor.razonComercial}
                    onChange={e => setEditandoProveedor((p: any) => ({ ...p, razonComercial: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Teléfono 1 *</Label>
                  <Input
                    value={editandoProveedor.numero1}
                    onChange={e => setEditandoProveedor((p: any) => ({ ...p, numero1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Teléfono 2</Label>
                  <Input
                    value={editandoProveedor.numero2}
                    onChange={e => setEditandoProveedor((p: any) => ({ ...p, numero2: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Correo *</Label>
                <Input
                  type="email"
                  value={editandoProveedor.correo}
                  onChange={e => setEditandoProveedor((p: any) => ({ ...p, correo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Dirección *</Label>
                <Input
                  value={editandoProveedor.direccion}
                  onChange={e => setEditandoProveedor((p: any) => ({ ...p, direccion: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cerrarEdicion}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
