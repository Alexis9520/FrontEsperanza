"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  RefreshCw,
  Building2
} from "lucide-react"
import clsx from "clsx"

interface ProveedoresHeaderProps {
  activeView: 'proveedores' | 'pedidos'
  setActiveView: (view: 'proveedores' | 'pedidos') => void
  loading: boolean
  onRefresh: () => void
  showNuevoDialog: boolean
  setShowNuevoDialog: (show: boolean) => void
  nuevoProveedor: any
  setNuevoProveedor: (p: any) => void
  onAgregar: () => void
}

export function ProveedoresHeader({
  activeView,
  setActiveView,
  loading,
  onRefresh,
  showNuevoDialog,
  setShowNuevoDialog,
  nuevoProveedor,
  setNuevoProveedor,
  onAgregar
}: ProveedoresHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-100">
          Gestión de Proveedores
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra los proveedores de la farmacia
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="hidden sm:flex items-center gap-2">
          <Button
            size="sm"
            variant={activeView === 'proveedores' ? 'default' : 'outline'}
            onClick={() => { setActiveView('proveedores'); onRefresh() }}
          >
            Proveedores
          </Button>
          <Button
            size="sm"
            variant={activeView === 'pedidos' ? 'default' : 'outline'}
            onClick={() => setActiveView('pedidos')}
          >
            Pedidos
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onRefresh}
        >
          <RefreshCw
            className={clsx(
              "h-4 w-4",
              loading && "animate-spin"
            )}
          />
          Refrescar
        </Button>
        <Dialog open={showNuevoDialog} onOpenChange={setShowNuevoDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                Nuevo Proveedor
              </DialogTitle>
              <DialogDescription>
                Registra un nuevo proveedor
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">RUC *</Label>
                  <Input
                    value={nuevoProveedor.ruc}
                    onChange={e => setNuevoProveedor((p: any) => ({ ...p, ruc: e.target.value }))}
                    placeholder="RUC"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Razón Comercial *</Label>
                  <Input
                    value={nuevoProveedor.razonComercial}
                    onChange={e => setNuevoProveedor((p: any) => ({ ...p, razonComercial: e.target.value }))}
                    placeholder="Razón Comercial"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Teléfono 1 *</Label>
                  <Input
                    value={nuevoProveedor.numero1}
                    onChange={e => setNuevoProveedor((p: any) => ({ ...p, numero1: e.target.value }))}
                    placeholder="Teléfono 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Teléfono 2</Label>
                  <Input
                    value={nuevoProveedor.numero2}
                    onChange={e => setNuevoProveedor((p: any) => ({ ...p, numero2: e.target.value }))}
                    placeholder="Teléfono 2 (opcional)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Correo *</Label>
                <Input
                  type="email"
                  value={nuevoProveedor.correo}
                  onChange={e => setNuevoProveedor((p: any) => ({ ...p, correo: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Dirección *</Label>
                <Input
                  value={nuevoProveedor.direccion}
                  onChange={e => setNuevoProveedor((p: any) => ({ ...p, direccion: e.target.value }))}
                  placeholder="Dirección completa"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNuevoDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={onAgregar}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
