"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import clsx from "clsx"

import { apiUrl } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/lib/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

/* =========================================================
   TIPOS
========================================================= */
type Proveedor = {
  id: number
  ruc: string
  razonComercial: string
  numero1: string
  numero2?: string
  correo: string
  direccion: string
  fechaCreacion?: string
  fechaActualizacion?: string
  activo: boolean
}

/* =========================================================
   COMPONENTE PRINCIPAL
======================================================== */
export default function ProveedoresPage() {
  const { toast } = useToast()

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(false)

  // Nuevo proveedor
  const [nuevoProveedor, setNuevoProveedor] = useState({
    ruc: "",
    razonComercial: "",
    numero1: "",
    numero2: "",
    correo: "",
    direccion: ""
  })
  const [showNuevoDialog, setShowNuevoDialog] = useState(false)

  // Editar proveedor
  const [editandoProveedor, setEditandoProveedor] = useState<any>(null)

  // Confirmación antes de eliminar
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null)
  const [eliminando, setEliminando] = useState(false)

  /* ------------ CARGA ------------- */
  const cargarProveedores = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchWithAuth(apiUrl("/proveedores"))
      setProveedores(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error cargarProveedores:", err)
      toast({
        title: "Error",
        description: "No se pudo cargar proveedores",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    cargarProveedores()
  }, [cargarProveedores])

  /* ------------ CRUD NUEVO ------------- */
  async function agregarProveedor() {
    if (!nuevoProveedor.ruc || !nuevoProveedor.razonComercial || !nuevoProveedor.numero1 || !nuevoProveedor.correo || !nuevoProveedor.direccion) {
      toast({
        title: "Campos obligatorios",
        description: "RUC, Razón Comercial, Número 1, Correo y Dirección son obligatorios",
        variant: "destructive"
      })
      return
    }

    const body = {
      ruc: nuevoProveedor.ruc,
      razonComercial: nuevoProveedor.razonComercial,
      numero1: nuevoProveedor.numero1,
      numero2: nuevoProveedor.numero2 || null,
      correo: nuevoProveedor.correo,
      direccion: nuevoProveedor.direccion
    }

    try {
      await fetchWithAuth(apiUrl("/proveedores"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      toast({
        title: "Proveedor agregado",
        description: "Creado correctamente"
      })
      setNuevoProveedor({
        ruc: "",
        razonComercial: "",
        numero1: "",
        numero2: "",
        correo: "",
        direccion: ""
      })
      setShowNuevoDialog(false)
      cargarProveedores()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar",
        variant: "destructive"
      })
    }
  }

  /* ------------ CRUD EDITAR ------------- */
  function editarProveedor(p: Proveedor) {
    setEditandoProveedor({
      id: p.id,
      ruc: p.ruc || "",
      razonComercial: p.razonComercial || "",
      numero1: p.numero1 || "",
      numero2: p.numero2 || "",
      correo: p.correo || "",
      direccion: p.direccion || ""
    })
  }

  async function guardarEdicion() {
    if (!editandoProveedor) return
    if (!editandoProveedor.ruc || !editandoProveedor.razonComercial || !editandoProveedor.numero1 || !editandoProveedor.correo || !editandoProveedor.direccion) {
      toast({
        title: "Campos obligatorios",
        description: "RUC, Razón Comercial, Número 1, Correo y Dirección son obligatorios",
        variant: "destructive"
      })
      return
    }

    const body = {
      ruc: editandoProveedor.ruc,
      razonComercial: editandoProveedor.razonComercial,
      numero1: editandoProveedor.numero1,
      numero2: editandoProveedor.numero2 || null,
      correo: editandoProveedor.correo,
      direccion: editandoProveedor.direccion
    }

    try {
      await fetchWithAuth(
        apiUrl(`/proveedores/${editandoProveedor.id}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      )
      toast({ title: "Proveedor actualizado", description: "Cambios guardados" })
      setEditandoProveedor(null)
      cargarProveedores()
    } catch (err) {
      console.error("Error guardarEdicion:", err)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  async function eliminarProveedorPorId(id: number) {
    try {
      await fetchWithAuth(apiUrl(`/proveedores/${id}`), {
        method: "DELETE"
      })
      toast({ title: "Proveedor eliminado" })
      cargarProveedores()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No se pudo eliminar",
        variant: "destructive"
      })
    }
  }

  function cerrarEdicion() {
    setEditandoProveedor(null)
  }

  /* ------------ FILTRADO ------------- */
  const proveedoresFiltrados = proveedores.filter(p => {
    const search = busqueda.toLowerCase()
    return (
      p.ruc.toLowerCase().includes(search) ||
      p.razonComercial.toLowerCase().includes(search) ||
      p.correo.toLowerCase().includes(search)
    )
  })

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="relative flex flex-col gap-8 pb-20">
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_65%),linear-gradient(140deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.10)_0_2px,transparent_2px_10px)]" />
      </div>

      {/* Header */}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={cargarProveedores}
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
                      onChange={e => setNuevoProveedor(p => ({ ...p, ruc: e.target.value }))}
                      placeholder="RUC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Razón Comercial *</Label>
                    <Input
                      value={nuevoProveedor.razonComercial}
                      onChange={e => setNuevoProveedor(p => ({ ...p, razonComercial: e.target.value }))}
                      placeholder="Razón Comercial"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Teléfono 1 *</Label>
                    <Input
                      value={nuevoProveedor.numero1}
                      onChange={e => setNuevoProveedor(p => ({ ...p, numero1: e.target.value }))}
                      placeholder="Teléfono 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Teléfono 2</Label>
                    <Input
                      value={nuevoProveedor.numero2}
                      onChange={e => setNuevoProveedor(p => ({ ...p, numero2: e.target.value }))}
                      placeholder="Teléfono 2 (opcional)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Correo *</Label>
                  <Input
                    type="email"
                    value={nuevoProveedor.correo}
                    onChange={e => setNuevoProveedor(p => ({ ...p, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Dirección *</Label>
                  <Input
                    value={nuevoProveedor.direccion}
                    onChange={e => setNuevoProveedor(p => ({ ...p, direccion: e.target.value }))}
                    placeholder="Dirección completa"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNuevoDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={agregarProveedor}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por RUC, razón comercial o correo..."
          className="pl-9 bg-background/60 backdrop-blur-sm"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <Card className="relative overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            Proveedores ({proveedoresFiltrados.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Lista de proveedores registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-background/70 backdrop-blur-md overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 backdrop-blur-md">
                <TableRow>
                  <TableHead>RUC</TableHead>
                  <TableHead>Razón Comercial</TableHead>
                  <TableHead>Teléfonos</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedoresFiltrados.map(p => (
                  <TableRow key={p.id} className="group hover:bg-muted/25">
                    <TableCell className="font-medium tabular-nums">
                      {p.ruc}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{p.razonComercial}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{p.numero1}</span>
                        </div>
                        {p.numero2 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{p.numero2}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{p.correo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm max-w-xs truncate">
                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{p.direccion}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.activo ? "default" : "secondary"}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => editarProveedor(p)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setProveedorAEliminar(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {proveedoresFiltrados.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No se encontraron proveedores
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10">
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
        </CardContent>
      </Card>

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
                  setEliminando(true)
                  await eliminarProveedorPorId(proveedorAEliminar.id)
                } finally {
                  setEliminando(false)
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
    </div>
  )
}
