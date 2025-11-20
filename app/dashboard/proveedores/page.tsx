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
  RefreshCw,
  ShoppingCart,
  Package,
  X,
  ChevronDown,
  CalendarIcon,
  ChevronRight
} from "lucide-react"
import clsx from "clsx"

import { apiUrl } from "@/lib/config"
import { AddStockPayload, fetchWithAuth, NewStockLot, ProductDTO } from "@/lib/api"
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
import { ScrollArea } from "@/components/ui/scroll-area"

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
  
  /* ------------ ESTADOS PARA NUEVO PEDIDO ------------- */
  const [showPedidoDialog, setShowPedidoDialog] = useState(false)
  const [proveedorPedido, setProveedorPedido] = useState<Proveedor | null>(null)
  const [productosProveedor, setProductosProveedor] = useState<ProductDTO[]>([])
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [filtroProducto, setFiltroProducto] = useState("")
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().split('T')[0]) // Default Hoy
  
  // "Carrito" de lotes: Un objeto donde la clave es el ID del producto y el valor es un array de lotes
  const [lotesPorProducto, setLotesPorProducto] = useState<Record<number, NewStockLot[]>>({})
  
  // Estado para controlar qué producto está expandido en el acordeón
  const [productoExpandido, setProductoExpandido] = useState<number | null>(null)
  const [enviandoPedido, setEnviandoPedido] = useState(false)
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
  /* ------------ FUNCIONES DE PEDIDO ------------- */
  async function abrirDialogoPedido(prov: Proveedor) {
    setProveedorPedido(prov)
    setProductosProveedor([])
    setLotesPorProducto({})
    setFiltroProducto("")
    setProductoExpandido(null)
    setFechaPedido(new Date().toISOString().split('T')[0])
    setShowPedidoDialog(true)
    setLoadingProductos(true)

    try {
      // Fetch productos del proveedor
      const productos = await fetchWithAuth(apiUrl(`/productos/proveedor/${prov.id}`)) as ProductDTO[]
      setProductosProveedor(Array.isArray(productos) ? productos : [])
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "No se pudieron cargar los productos", variant: "destructive" })
    } finally {
      setLoadingProductos(false)
    }
  }

  // Agregar un lote vacío a un producto específico
  function agregarLoteAProducto(productoId: number) {
    setLotesPorProducto(prev => {
      const actuales = prev[productoId] || []
      return {
        ...prev,
        [productoId]: [
          ...actuales,
          { codigoStock: "", cantidadUnidades: 0, fechaVencimiento: "", precioCompra: 0 }
        ]
      }
    })
  }

  // Remover un lote específico
  function removerLote(productoId: number, index: number) {
    setLotesPorProducto(prev => {
      const actuales = [...(prev[productoId] || [])]
      actuales.splice(index, 1)
      return { ...prev, [productoId]: actuales }
    })
  }

  // Actualizar campo de un lote
  function updateLote(productoId: number, index: number, field: keyof NewStockLot, value: any) {
    setLotesPorProducto(prev => {
      const actuales = [...(prev[productoId] || [])]
      actuales[index] = { ...actuales[index], [field]: value }
      return { ...prev, [productoId]: actuales }
    })
  }

  // Enviar todo el pedido
  async function enviarPedido() {
    // 1. Identificar productos que tienen lotes configurados
    const productosConLotes = Object.entries(lotesPorProducto).filter(([_, lotes]) => lotes.length > 0)

    if (productosConLotes.length === 0) {
      toast({ title: "Pedido vacío", description: "Agrega al menos un lote a un producto.", variant: "destructive" })
      return
    }

    // 2. Validar datos básicos
    for (const [prodId, lotes] of productosConLotes) {
      for (const lote of lotes) {
        if (!lote.codigoStock || lote.cantidadUnidades <= 0 || lote.precioCompra <= 0 || !lote.fechaVencimiento) {
          toast({ title: "Datos incompletos", description: "Verifica que todos los lotes tengan código, cantidad, precio y fecha.", variant: "destructive" })
          return
        }
      }
    }

    setEnviandoPedido(true)
    try {
      // Enviar todas las peticiones en paralelo y esperar que todas terminen.
      const proveedorId = proveedorPedido?.id ?? null

      const requests = productosConLotes.map(([prodIdStr, lotes]) => {
        const productoId = Number(prodIdStr)
        // Buscar el producto para obtener codigoBarras
        const prod = productosProveedor.find(p => p.id === productoId)
        const codigoBarras = prod?.codigoBarras || null

        // Nuevo modelo solicitado por el backend
        const payload = {
          stockData: {
            productoId,
            codigoBarras,
            lotes
          },
          fechaDePedido: fechaPedido,
          proveedorId: proveedorId
        }

        return fetchWithAuth(apiUrl("/api/pedidos/agregar-stock"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then((res: any) => {
          if (res && res.ok === false) {
            throw new Error(`HTTP ${res.status}`)
          }
          return res
        })
      })

      const results = await Promise.allSettled(requests)

      let errores = 0
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          errores++
          console.error(`Error en petición ${i}:`, r.reason)
        }
      })

      if (errores === 0) {
        toast({ title: "Éxito", description: "Pedido registrado correctamente." })
        setShowPedidoDialog(false)
        // Nota: Si otra vista (ej. la tabla de Pedidos) depende de datos en el servidor,
        // hay que refrescarla aquí (llamando su loader o recargando la página).
      } else {
        toast({ title: "Atención", description: `El pedido se procesó con ${errores} errores. Revisa la consola.`, variant: "destructive" })
      }
    } catch (err) {
      console.error("Error enviando pedidos:", err)
      toast({ title: "Error", description: "Ocurrió un error al enviar el pedido.", variant: "destructive" })
    } finally {
      setEnviandoPedido(false)
    }
  }
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
  const productosFiltrados = productosProveedor.filter(prod => {
    const f = filtroProducto.toLowerCase()
    return prod.nombre.toLowerCase().includes(f) || prod.codigoBarras.toLowerCase().includes(f)
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
                        {/* Botón NUEVO PEDIDO */}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 text-xs gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 mr-2"
                          onClick={() => abrirDialogoPedido(p)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Nuevo Pedido
                        </Button>
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
      {/* ==========================================
          DIALOG: NUEVO PEDIDO (STOCK)
         ========================================== */}
      <Dialog open={showPedidoDialog} onOpenChange={setShowPedidoDialog}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="h-6 w-6 text-emerald-500" />
              Nuevo Pedido: <span className="text-emerald-600">{proveedorPedido?.razonComercial}</span>
            </DialogTitle>
            <DialogDescription>
              Busca productos de este proveedor y agrega lotes para reabastecer el stock.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-6 flex-1 min-h-0">
            {/* Barra Superior: Fecha y Filtro */}
            <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
              <div className="space-y-1.5 w-full sm:w-1/3">
                <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                   <CalendarIcon className="h-3.5 w-3.5" /> Fecha del Pedido
                </Label>
                <Input type="date" value={fechaPedido} onChange={(e) => setFechaPedido(e.target.value)} />
              </div>
              <div className="space-y-1.5 w-full sm:w-2/3 relative">
                <Label className="text-xs text-muted-foreground">Buscar Producto</Label>
                <Search className="absolute left-2.5 top-8 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Nombre o Código de Barras..." 
                  className="pl-9" 
                  value={filtroProducto}
                  onChange={(e) => setFiltroProducto(e.target.value)}
                />
              </div>
            </div>

            {/* Lista de Productos (Scrollable) */}
            <div className="border rounded-lg bg-muted/10 flex-1 overflow-hidden flex flex-col">
              <div className="bg-muted/50 p-2 text-xs font-medium grid grid-cols-12 gap-2 border-b px-4">
                <div className="col-span-6 sm:col-span-5">Producto</div>
                <div className="col-span-4 sm:col-span-3">Código</div>
                <div className="col-span-2 sm:col-span-2 text-center">Stock Actual</div>
                <div className="col-span-2 text-right">Acción</div>
              </div>
              
              <ScrollArea className="flex-1">
                {loadingProductos ? (
                   <div className="flex justify-center items-center h-40"><RefreshCw className="animate-spin h-8 w-8 text-muted-foreground"/></div>
                ) : productosFiltrados.length === 0 ? (
                   <div className="text-center py-10 text-muted-foreground">No hay productos coincidentes.</div>
                ) : (
                  <div className="divide-y">
                    {productosFiltrados.map(prod => {
                      const lotesAgregados = lotesPorProducto[prod.id] || [];
                      const isExpanded = productoExpandido === prod.id;
                      const totalAgregado = lotesAgregados.reduce((acc, l) => acc + (Number(l.cantidadUnidades) || 0), 0);

                      // Detalle de lotes incompletos para mostrar en el tooltip junto al nombre del producto
                      const incompleteDetails = lotesAgregados.map((lote, idx) => {
                        const missing: string[] = []
                        if (!(Number(lote.cantidadUnidades) > 0)) missing.push('cantidad')
                        if (!(Number(lote.precioCompra) > 0)) missing.push('precio')
                        if (!lote.fechaVencimiento) missing.push('fecha')
                        if (missing.length) return `Lote ${lote.codigoStock || (idx + 1)}: ${missing.join(', ')}`
                        return null
                      }).filter(Boolean) as string[]

                      return (
                        <div key={prod.id} className={clsx("transition-colors", isExpanded ? "bg-muted/20" : "hover:bg-muted/10")}>
                          {/* Fila Principal del Producto */}
                          <div 
                            className="grid grid-cols-12 gap-2 p-3 px-4 items-center cursor-pointer"
                            onClick={() => setProductoExpandido(isExpanded ? null : prod.id)}
                          >
                            <div className="col-span-6 sm:col-span-5 flex flex-col">
                              <span className="font-semibold text-sm truncate flex items-center">
                                {prod.nombre}
                                {incompleteDetails.length > 0 && (
                                  <span title={incompleteDetails.join(' • ')} className="ml-2 inline-flex items-center text-amber-600 text-xs">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 mr-1" aria-hidden="true" />
                                    <span>Faltan campos</span>
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">{prod.concentracion} - {prod.presentacion}</span>
                            </div>
                            <div className="col-span-4 sm:col-span-3 text-xs text-muted-foreground font-mono">{prod.codigoBarras}</div>
                            <div className="col-span-2 sm:col-span-2 text-center">
                              <Badge variant="outline" className="tabular-nums">{prod.cantidadGeneral}</Badge>
                              {totalAgregado > 0 && (
                                <Badge variant="default" className="ml-1 bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5">+{totalAgregado}</Badge>
                              )}
                            </div>
                            <div className="col-span-2 text-right flex justify-end">
                               {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground"/> : <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
                            </div>
                          </div>

                          {/* Panel Desplegable para Agregar Lotes */}
                          {isExpanded && (
                            <div className="bg-background/50 p-4 border-t shadow-inner">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                  <Package className="h-3 w-3"/> Lotes a ingresar
                                </h4>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => agregarLoteAProducto(prod.id)}>
                                  <Plus className="h-3 w-3"/> Agregar Lote
                                </Button>
                              </div>

                              {lotesAgregados.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic py-2">No has agregado lotes para este pedido.</p>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground px-1">
                                    <div className="col-span-3">Cód. Lote</div>
                                    <div className="col-span-2">Cant.</div>
                                    <div className="col-span-3">Vencimiento</div>
                                    <div className="col-span-3">P. Compra (Unit)</div>
                                    <div className="col-span-1"></div>
                                  </div>
                                  {lotesAgregados.map((lote, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                      <div className="col-span-3">
                                        <Input 
                                          className="h-8 text-xs" 
                                          placeholder="LOTE-123" 
                                          value={lote.codigoStock}
                                          onChange={(e) => updateLote(prod.id, idx, 'codigoStock', e.target.value)}
                                        />
                                      </div>
                                      <div className="col-span-2">
                                        <Input 
                                          type="number" 
                                          className="h-8 text-xs" 
                                          placeholder="0" 
                                          value={lote.cantidadUnidades || ""}
                                          onChange={(e) => updateLote(prod.id, idx, 'cantidadUnidades', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div className="col-span-3">
                                        <Input 
                                          type="date" 
                                          className="h-8 text-xs px-2" 
                                          value={lote.fechaVencimiento || ""}
                                          onChange={(e) => updateLote(prod.id, idx, 'fechaVencimiento', e.target.value)}
                                        />
                                      </div>
                                      <div className="col-span-3">
                                        <div className="relative">
                                          <span className="absolute left-2 top-2 text-xs text-muted-foreground">$</span>
                                          <Input 
                                            type="number" 
                                            className="h-8 text-xs pl-5" 
                                            placeholder="0.00" 
                                            value={lote.precioCompra || ""}
                                            onChange={(e) => updateLote(prod.id, idx, 'precioCompra', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>
                                      </div>
                                      <div className="col-span-1 flex justify-end">
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => removerLote(prod.id, idx)}
                                        >
                                          <X className="h-3 w-3"/>
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
             <div className="flex justify-between w-full items-center">
                <p className="text-xs text-muted-foreground">
                  Productos con lotes: <span className="font-medium text-foreground">{Object.values(lotesPorProducto).filter(l => l.length > 0).length}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPedidoDialog(false)} disabled={enviandoPedido}>
                    Cancelar
                  </Button>
                  <Button onClick={enviarPedido} disabled={enviandoPedido} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    {enviandoPedido ? (
                      <RefreshCw className="h-4 w-4 animate-spin" /> 
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    {enviandoPedido ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                </div>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>          
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
