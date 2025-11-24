"use client"

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react"
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  LayoutList,
  Layers,
  Minimize2,
  Maximize2,
  Sparkles,
  Filter,
  RefreshCw,
  Boxes,
  ShieldAlert,
  Activity,
  AlertTriangle,
  X
} from "lucide-react"
import clsx from "clsx"
import ProductoForm from "@/components/productos/ProductoForm"
import EditStockDialog from "@/components/productos/EditStockDialog"
import CreateStockDialog from "@/components/productos/CreateStockDialog"
import { apiUrl } from "@/lib/config"
import { fetchWithAuth, crearProducto, actualizarProducto, deleteStock } from "@/lib/api"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

/* =========================================================
   TIPOS
========================================================= */
type StockLote = {
  id: number
  codigoStock?: string
  cantidadUnidades: number
  fechaVencimiento: string
  precioCompra: number
}
// Nuevo tipo basado en tu JSON
type Proveedor = {
  id: number
  razonComercial: string
  ruc: string
}
type Producto = {
  id: number
  codigoBarras: string
  nombre: string
  concentracion: string
  cantidadGeneral: number
  cantidadMinima?: number
  precioVentaUnd: number
  descuento: number
  laboratorio: string
  categoria: string
  cantidadUnidadesBlister?: number
  precioVentaBlister?: number
  principioActivo?: string
  tipoMedicamento?: string
  presentacion?: string
  // El backend devuelve el objeto completo en GET
  proveedores?: Proveedor[]
  // Para el POST/PUT usamos este campo auxiliar en el frontend
  proveedorIds?: number[]
  fechaCreacion?: string
  stocks?: StockLote[]
}

/* =========================================================
   HELPERS
========================================================= */

const today = () => new Date()

function calcularDiasParaVencer(fecha: string) {
  if (!fecha) return 0
  const f = new Date(fecha)
  const h = today()
  h.setHours(0, 0, 0, 0)
  f.setHours(0, 0, 0, 0)
  return Math.ceil((f.getTime() - h.getTime()) / 86400000)
}

function obtenerEstadoLote(fechaVencimiento: string) {
  const dias = calcularDiasParaVencer(fechaVencimiento)
  if (dias < 0) return { estado: "vencido", color: "destructive", texto: "Vencido", dias }
  if (dias <= 30) return { estado: "vence-pronto", color: "secondary", texto: "Pronto", dias }
  return { estado: "vigente", color: "outline", texto: "Vigente", dias }
}

/* =========================================================
   COMPONENTE PRINCIPAL
======================================================== */
export default function ProductosPage() {
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [densityCompact, setDensityCompact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  // Diccionario para mostrar nombres en los Badges de edición/creación
  const [diccionarioProveedores, setDiccionarioProveedores] = useState<Record<number, string>>({})
  // Paginación
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    codigo_barras: "",
    nombre: "",
    concentracion: "",
    cantidad_general: "",
    cantidad_minima: "",
    precio_venta_und: "",
    descuento: "",
    laboratorio: "",
    categoria: "",
    cantidad_unidades_blister: "",
    precio_venta_blister: "",
    principioActivo: "",
    tipoMedicamento: "GENÉRICO",
    presentacion: "",
    proveedorIds: [] as number[]
  })


  // Editar producto
  const [editandoProducto, setEditandoProducto] = useState<any>(null)

  // Confirmación antes de eliminar producto
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)
  const [eliminando, setEliminando] = useState(false)

  // Modal lotes
  const [lotesModalProducto, setLotesModalProducto] = useState<Producto | null>(null)
  const [editingStock, setEditingStock] = useState<any>(null)
  const [stockToDelete, setStockToDelete] = useState<{ id: number | string; codigo?: string | null; productoId?: number } | null>(null)
  const [deletingStock, setDeletingStock] = useState(false)
  const [creatingStockFor, setCreatingStockFor] = useState<{ id: number; nombre?: string } | null>(null)

  /* ------------ CARGA DATOS AUXILIARES ------------- */
  const cargarDiccionarioProveedores = useCallback(async () => {
    try {
      // Carga lista completa para tener mapeo ID -> Nombre
      const data = await fetchWithAuth(apiUrl("/proveedores"))
      const lista = Array.isArray(data) ? data : (data.content || [])

      const mapa: Record<number, string> = {}
      lista.forEach((p: any) => {
        mapa[p.id] = p.razonComercial
      })
      setDiccionarioProveedores(mapa)
    } catch (err) {
      console.error("No se pudieron cargar nombres de proveedores", err)
    }
  }, [])
  useEffect(() => {
    cargarDiccionarioProveedores()
  }, [cargarDiccionarioProveedores])

  /* ------------ CARGA PRODUCTOS ------------- */
  const cargarProductos = useCallback(async () => {
    try {
      setLoading(true)
      const q = (debouncedBusqueda || "").trim()
      const url = `/productos?page=${page - 1}&size=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ""}`
      const data = await fetchWithAuth(apiUrl(url))
      setProductos(data.content || [])
      setTotalPages(data.totalPages || 1)
      setTotalElements(data.totalElements || 0)
    } catch (err) {
      console.error("Error cargarProductos:", err)
      toast({
        title: "Error",
        description: "No se pudo cargar productos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast, page, pageSize, debouncedBusqueda])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedBusqueda(busqueda.trim())
    }, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  useEffect(() => {
    setPage(1)
  }, [debouncedBusqueda])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos, refreshTick]) // Añadido refreshTick para recargar tras guardar

  /* ------------ MÉTRICAS (GLOBALES vs PAGINADAS) ------------- */

  const [globalMetricas, setGlobalMetricas] = useState<null | {
    productos: number
    unidades: number
    criticos: number
    vencidos: number
  }>(null)
  const [globalMetricasLoading, setGlobalMetricasLoading] = useState(false)

  function calcularMetricasDesdeArray(arr: Producto[]) {
    let criticos = 0
    let totalUnidades = 0
    let vencidos = 0
    arr.forEach(p => {
      totalUnidades += p.cantidadGeneral || 0
      if (p.cantidadMinima !== undefined && p.cantidadGeneral <= (p.cantidadMinima ?? 0)) criticos++
        ; (p.stocks || []).forEach(l => {
          if (calcularDiasParaVencer(l.fechaVencimiento) < 0) vencidos++
        })
    })
    return {
      productos: arr.length,
      unidades: totalUnidades,
      criticos,
      vencidos
    }
  }

  const cargarMetricasGlobales = useCallback(async () => {
    try {
      setGlobalMetricasLoading(true)
      // Primero pedimos 1 elemento sin filtros para obtener totalElements global
      const info = await fetchWithAuth(apiUrl(`/productos?page=0&size=1`))
      const total = info?.totalElements || (Array.isArray(info) ? info.length : 0)

      if (!total) {
        setGlobalMetricas({ productos: 0, unidades: 0, criticos: 0, vencidos: 0 })
        return
      }

      // Para evitar pedir todos en una sola llamada cuando hay muchos, cargamos por lotes.
      const lote = 500
      const pages = Math.max(1, Math.ceil(total / lote))
      let all: Producto[] = []
      for (let p = 0; p < pages; p++) {
        const d = await fetchWithAuth(apiUrl(`/productos?page=${p}&size=${lote}`))
        const items = d?.content || (Array.isArray(d) ? d : [])
        all = all.concat(items)
      }

      const gm = calcularMetricasDesdeArray(all)
      setGlobalMetricas(gm)
    } catch (err) {
      console.error("Error cargarMetricasGlobales:", err)
      // No interrumpimos la UI: mantenemos las métricas paginadas si no hay respuesta
      setGlobalMetricas(null)
    } finally {
      setGlobalMetricasLoading(false)
    }
  }, [toast])

  // Cargar métricas globales al montar y cuando se refresque el dashboard
  useEffect(() => {
    cargarMetricasGlobales()
  }, [cargarMetricasGlobales, refreshTick])

  // Métricas que usa la UI: preferimos globalMetricas cuando esté disponible,
  // si no, calculamos a partir de los productos de la página actual.
  const metricas = useMemo(() => {
    if (globalMetricas) return globalMetricas
    return calcularMetricasDesdeArray(productos)
  }, [globalMetricas, productos])

  /* ------------ CRUD NUEVO ------------- */


  async function agregarProducto() {
    // Ahora sólo nombre es obligatorio
    if (!nuevoProducto.nombre || !(nuevoProducto.nombre || "").trim()) {
      toast({
        title: "Campo obligatorio",
        description: "Nombre del producto es obligatorio",
        variant: "destructive"
      })
      return
    }

    const totalUnidades = Number(nuevoProducto.cantidad_general) || 0

    const body: any = {
      codigoBarras: nuevoProducto.codigo_barras && nuevoProducto.codigo_barras.trim() !== "" ? nuevoProducto.codigo_barras : null,
      nombre: nuevoProducto.nombre,
      concentracion: nuevoProducto.concentracion && nuevoProducto.concentracion.trim() !== "" ? nuevoProducto.concentracion : null,
      cantidadGeneral: totalUnidades > 0 ? totalUnidades : null,
      cantidadMinima: nuevoProducto.cantidad_minima ? Number(nuevoProducto.cantidad_minima) : null,
      precioVentaUnd: nuevoProducto.precio_venta_und ? Number(nuevoProducto.precio_venta_und) : null,
      descuento: nuevoProducto.descuento ? Number(nuevoProducto.descuento) : null,
      laboratorio: nuevoProducto.laboratorio && nuevoProducto.laboratorio.trim() !== "" ? nuevoProducto.laboratorio : null,
      categoria: nuevoProducto.categoria && nuevoProducto.categoria.trim() !== "" ? nuevoProducto.categoria : null,
      cantidadUnidadesBlister: nuevoProducto.cantidad_unidades_blister ? Number(nuevoProducto.cantidad_unidades_blister) : null,
      precioVentaBlister: nuevoProducto.precio_venta_blister ? Number(nuevoProducto.precio_venta_blister) : null,
      principioActivo: nuevoProducto.principioActivo && nuevoProducto.principioActivo.trim() !== "" ? nuevoProducto.principioActivo : null,
      tipoMedicamento: nuevoProducto.tipoMedicamento || null,
      presentacion: nuevoProducto.presentacion && nuevoProducto.presentacion.trim() !== "" ? nuevoProducto.presentacion : null,
      proveedorIds: nuevoProducto.proveedorIds, // <--- CAMBIO: Enviar array
    }

    try {
      const data = await crearProducto(body as any, toast)
      toast({
        title: data?.reactivado ? "Producto restaurado" : "Producto agregado",
        description: data?.reactivado ? "Se reactivó y actualizó" : "Creado correctamente"
      })
      setNuevoProducto({
        codigo_barras: "",
        nombre: "",
        concentracion: "",
        cantidad_general: "",
        cantidad_minima: "",
        precio_venta_und: "",
        descuento: "",
        laboratorio: "",
        categoria: "",
        cantidad_unidades_blister: "",
        precio_venta_blister: "",
        principioActivo: "",
        tipoMedicamento: "GENÉRICO",
        presentacion: "",
        proveedorIds: [], // <--- Resetear array
      })
      cargarProductos()
      setRefreshTick(t => t + 1)
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar",
        variant: "destructive"
      })
    }
  }

  /* ------------ CRUD EDITAR ------------- */
  function editarProducto(p: Producto) {
    setEditandoProducto({
      id: p.id, // <-- incluir id para usar en rutas
      codigo_barras: p.codigoBarras || "",
      nombre: p.nombre || "",
      concentracion: p.concentracion || "",
      cantidad_general: p.cantidadGeneral?.toString() || "",
      cantidad_minima: p.cantidadMinima?.toString() || "",
      precio_venta_und: p.precioVentaUnd?.toString() || "",
      descuento: p.descuento?.toString() || "",
      laboratorio: p.laboratorio || "",
      categoria: p.categoria || "",
      cantidad_unidades_blister: p.cantidadUnidadesBlister?.toString() || "",
      precio_venta_blister: p.precioVentaBlister?.toString() || "",
      principioActivo: p.principioActivo || "",
      tipoMedicamento: p.tipoMedicamento || "GENÉRICO",
      presentacion: p.presentacion || "",
      proveedorIds: p.proveedores?.map(prov => prov.id) || [] // <--- CAMBIO: Cargar array existente o vacío
    })
  }



  async function guardarEdicion() {
    if (!editandoProducto) return
    // Sólo nombre es obligatorio al editar
    if (!editandoProducto.nombre || !(editandoProducto.nombre || "").trim()) {
      toast({
        title: "Campo obligatorio",
        description: "Nombre del producto es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (!editandoProducto.id) {
      toast({
        title: "Error",
        description: "Producto sin identificador (id). No se puede guardar.",
        variant: "destructive"
      })
      return
    }

    const totalUnidades = Number(editandoProducto.cantidad_general) || 0

    const body: any = {
      codigoBarras: editandoProducto.codigo_barras && editandoProducto.codigo_barras.trim() !== "" ? editandoProducto.codigo_barras : null,
      nombre: editandoProducto.nombre,
      concentracion: editandoProducto.concentracion && editandoProducto.concentracion.trim() !== "" ? editandoProducto.concentracion : null,
      cantidadGeneral: totalUnidades > 0 ? totalUnidades : null,
      cantidadMinima: editandoProducto.cantidad_minima ? Number(editandoProducto.cantidad_minima) : null,
      precioVentaUnd: editandoProducto.precio_venta_und ? Number(editandoProducto.precio_venta_und) : null,
      descuento: editandoProducto.descuento ? Number(editandoProducto.descuento) : null,
      laboratorio: editandoProducto.laboratorio && editandoProducto.laboratorio.trim() !== "" ? editandoProducto.laboratorio : null,
      categoria: editandoProducto.categoria && editandoProducto.categoria.trim() !== "" ? editandoProducto.categoria : null,
      cantidadUnidadesBlister: editandoProducto.cantidad_unidades_blister ? Number(editandoProducto.cantidad_unidades_blister) : null,
      precioVentaBlister: editandoProducto.precio_venta_blister ? Number(editandoProducto.precio_venta_blister) : null,
      principioActivo: editandoProducto.principioActivo && editandoProducto.principioActivo.trim() !== "" ? editandoProducto.principioActivo : null,
      tipoMedicamento: editandoProducto.tipoMedicamento || null,
      presentacion: editandoProducto.presentacion && editandoProducto.presentacion.trim() !== "" ? editandoProducto.presentacion : null,
      proveedorIds: editandoProducto.proveedorIds,
    }

    try {
      const res = await actualizarProducto(editandoProducto.id, body as any, toast)
      if (res) {
        toast({ title: "Producto actualizado", description: "Cambios guardados" })
        setProductos(prev =>
          prev.map(p =>
            p.id === editandoProducto.id
              ? ({ ...p, ...res, id: p.id, fechaCreacion: p.fechaCreacion } as Producto)
              : p
          )
        )
        cerrarEdicion()
        setRefreshTick(t => t + 1)
      } else {
        toast({
          title: "Error",
          description: "No se guardó",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error guardarEdicion:", err)
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  async function eliminarProductoPorId(id: number) {
    try {
      console.log("DELETE ->", apiUrl(`/productos/${id}`))
      await fetchWithAuth(apiUrl(`/productos/${id}`), {
        method: "DELETE"
      })
      toast({ title: "Producto eliminado" })
      cargarProductos()
      setRefreshTick(t => t + 1)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No se pudo eliminar",
        variant: "destructive"
      })
    }
  }

  function cerrarEdicion() {
    setEditandoProducto(null)
  }

  /* ------------ UI HELPERS ------------- */
  function toggleExpand(id: number) {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function stockMinBadge(producto: Producto) {
    if (producto.cantidadMinima === undefined) return null
    const esCritico = producto.cantidadGeneral <= (producto.cantidadMinima ?? 0)
    return (
      <div className="flex items-center gap-1 flex-wrap text-[10px] mt-1">
        <span className="text-muted-foreground">Min:</span>
        <span className="font-medium">{producto.cantidadMinima}</span>
        {esCritico && (
          <Badge
            variant="destructive"
            className="h-4 px-1.5 text-[9px] rounded-full flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" /> Crítico
          </Badge>
        )}
      </div>
    )
  }

  function stockBar(p: Producto) {
    const min = p.cantidadMinima ?? 0
    const current = p.cantidadGeneral
    const pct =
      min === 0
        ? 100
        : Math.min(100, Math.round((current / (min * 2 || 1)) * 100))
    const color =
      current <= min
        ? "bg-red-500"
        : current <= min * 2
          ? "bg-amber-500"
          : "bg-emerald-500"

    return (
      <div className="space-y-1 w-32">
        <div className="h-1.5 rounded bg-gradient-to-r from-slate-300/40 to-slate-400/30 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
          <div
            className={clsx("h-full transition-all duration-500 ease-out", color)}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] flex justify-between text-muted-foreground">
          <span>{current} u</span>
          {min > 0 && <span>Min {min}</span>}
        </div>
      </div>
    )
  }

  function resumenLotes(producto: Producto) {
    const lotes = producto.stocks || []
    if (!lotes.length)
      return <span className="text-[11px] text-muted-foreground">Sin lotes</span>
    const total = lotes.reduce((s, l) => s + l.cantidadUnidades, 0)
    const proximos = lotes
      .map(l => calcularDiasParaVencer(l.fechaVencimiento))
      .sort((a, b) => a - b)
    const d = proximos[0]
    const estado =
      d < 0
        ? { label: "Vencido", cls: "text-red-600" }
        : d <= 30
          ? { label: `${d} d`, cls: "text-amber-500" }
          : { label: `> ${d} d`, cls: "text-muted-foreground" }

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 flex-wrap">
          <Badge
            variant="outline"
            className="px-1.5 h-5 text-[10px] rounded-full"
          >
            {lotes.length} lote{lotes.length !== 1 && "s"}
          </Badge>
          <Badge
            variant="secondary"
            className="px-1.5 h-5 text-[10px] rounded-full"
          >
            {total} u
          </Badge>
        </div>
        <span className={clsx("text-[10px] font-medium", estado.cls)}>
          {estado.label}
        </span>
      </div>
    )
  }

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = startIndex + productos.length - 1
  const pageItems = productos

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="relative flex flex-col gap-8 pb-20">
      {/* Fondo simplificado (menos colores) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_65%),linear-gradient(140deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.10)_0_2px,transparent_2px_10px)]" />
      </div>

      {/* Header: SIN sombra en el título */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-100">
            Gestión de Productos
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra el catálogo y lotes de inventario
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              cargarProductos()
              setRefreshTick(t => t + 1)
            }}
          >
            <RefreshCw
              className={clsx(
                "h-4 w-4",
                loading && "animate-spin"
              )}
            />
            Refrescar
          </Button>
          <DensityToggle
            compact={densityCompact}
            onChange={() => setDensityCompact(d => !d)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Nuevo Producto
                </DialogTitle>
                <DialogDescription>
                  Registra un producto y lotes iniciales
                </DialogDescription>
              </DialogHeader>

              <ProductoForm
                datos={nuevoProducto}
                setDatos={setNuevoProducto}
                diccionarioProveedores={diccionarioProveedores}
                modoEdicion={false}
              />

              <DialogFooter className="pt-2">
                <Button onClick={agregarProducto}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* MÉTRICAS REDUCIDAS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Boxes}
          label="Productos"
          value={metricas.productos}
          loading={globalMetricasLoading}
          accent="from-cyan-400/25 to-cyan-700/10"
        />
        <MetricCard
          icon={Activity}
          label="Unidades"
          value={metricas.unidades}
          loading={globalMetricasLoading}
          accent="from-indigo-400/25 to-indigo-700/10"
        />
        <MetricCard
          icon={ShieldAlert}
          label="Stock crítico"
          value={metricas.criticos}
          loading={globalMetricasLoading}
          accent="from-amber-400/30 to-amber-700/10"
          warn={metricas.criticos > 0}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Lotes vencidos"
          value={metricas.vencidos}
          loading={globalMetricasLoading}
          accent="from-red-400/30 to-red-700/10"
          danger={metricas.vencidos > 0}
        />
      </div>

      {/* BUSCADOR & CONTROLES */}
      <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar código, nombre, categoría, laboratorio..."
            className="pl-9 pr-24 bg-background/60 backdrop-blur-sm"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div className="absolute right-3 top-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            {loading ? (
              <span className="animate-pulse">Cargando...</span>
            ) : (
              <span>{totalElements}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filas / página</span>
          </div>
          <Select
            value={String(pageSize)}
            onValueChange={v => {
              setPageSize(Number(v))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Tamaño" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 25, 50].map(s => (
                <SelectItem key={s} value={String(s)}>
                  {s} / pág
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {startIndex}-{endIndex} de {totalElements}
          </span>
        </div>
      </div>

      {/* TABLA */}
      <Card className="relative overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <LayoutList className="h-4 w-4 text-cyan-400" />
            Catálogo
          </CardTitle>
          <CardDescription className="text-xs">
            Expande para ver detalles y lotes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-background/70 backdrop-blur-md overflow-x-auto">
            <Table
              className={clsx(
                "transition-all",
                densityCompact && "[&_td]:py-1 [&_th]:py-2 text-sm"
              )}
            >
              <TableHeader className="bg-muted/40 backdrop-blur-md">
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Clasificación</TableHead>
                  <TableHead>Proveedores</TableHead>
                  <TableHead>Presentación</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Blister</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Lotes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map(p => {
                  const expanded = !!expandedRows[p.id]
                  return (
                    <React.Fragment key={p.id}>
                      <TableRow
                        className={clsx(
                          "group cursor-pointer transition-colors",
                          expanded && "bg-muted/30",
                          "hover:bg-muted/25"
                        )}
                        onDoubleClick={() => toggleExpand(p.id)}
                      >
                        <TableCell className="p-0 pl-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleExpand(p.id)}
                            aria-label={expanded ? "Contraer" : "Expandir"}
                          >
                            {expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {p.codigoBarras}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium leading-tight">
                              {p.nombre}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{p.concentracion || "—"}</span>
                              <Badge
                                variant={
                                  p.tipoMedicamento === "GENÉRICO"
                                    ? "outline"
                                    : "secondary"
                                }
                                className="px-1.5 h-4 text-[10px] rounded-full"
                              >
                                {p.tipoMedicamento === "GENÉRICO"
                                  ? "Genérico"
                                  : "Marca"}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-[11px]">
                            <span className="font-medium">
                              {p.categoria || "—"}
                            </span>
                            <div className="text-muted-foreground">
                              {p.laboratorio || "—"}
                            </div>
                          </div>
                        </TableCell>
                        {/* AGREGAR ESTA CELDA NUEVA */}
                        <TableCell className="max-w-[180px]">
                          <div className="flex flex-wrap gap-1">
                            {p.proveedores && p.proveedores.length > 0 ? (
                              p.proveedores.map((prov) => (
                                <Badge
                                  key={prov.id}
                                  variant="secondary"
                                  className="px-1.5 h-5 text-[9px] rounded-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                                >
                                  {prov.razonComercial}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Sin proveedor</span>
                            )}
                          </div>
                        </TableCell>
                        {/* ----------------------- */}
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[11px] max-w-[160px] truncate">
                                  {p.presentacion || "—"}
                                  {p.principioActivo && (
                                    <span className="text-muted-foreground ml-1">
                                      · {p.principioActivo}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {p.principioActivo && (
                                <TooltipContent>
                                  <p className="text-xs">
                                    Principio activo:{" "}
                                    <strong>{p.principioActivo}</strong>
                                  </p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="align-top">
                          {stockBar(p)}
                          {stockMinBadge(p)}
                        </TableCell>
                        <TableCell>
                          {p.cantidadUnidadesBlister ? (
                            <div className="flex flex-col gap-0.5 text-[11px]">
                              <Badge
                                variant="outline"
                                className="px-1.5 h-5 rounded-full"
                              >
                                {p.cantidadUnidadesBlister} u
                              </Badge>
                              {p.precioVentaBlister && (
                                <span className="text-muted-foreground tabular-nums">
                                  S/{" "}
                                  {Number(p.precioVentaBlister).toFixed(2)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold tabular-nums">
                            S/ {Number(p.precioVentaUnd).toFixed(2)}
                          </div>
                          {p.descuento > 0 && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Desc: S/ {p.descuento.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{resumenLotes(p)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => editarProducto(p)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Botón para crear lote movido debajo de la lista de lotes */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setProductoAEliminar(p)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="bg-muted/20">
                          <TableCell />
                          <TableCell colSpan={9} className="py-5">
                            <div className="grid lg:grid-cols-5 gap-6 text-sm">
                              {/* Detalles */}
                              <div className="space-y-3 lg:col-span-1">
                                <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                  <LayoutList className="h-4 w-4" /> Detalles
                                </h4>
                                <Detail
                                  label="Principio activo"
                                  value={p.principioActivo || "—"}
                                />
                                <Detail
                                  label="Presentación"
                                  value={p.presentacion || "—"}
                                />
                                <Detail
                                  label="Tipo"
                                  value={p.tipoMedicamento || "—"}
                                />
                                <Detail
                                  label="Laboratorio"
                                  value={p.laboratorio || "—"}
                                />
                              </div>

                              {/* Lotes */}
                              <div className="space-y-3 lg:col-span-2">
                                <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                  <Package className="h-4 w-4" /> Lotes
                                </h4>
                                {(p.stocks?.length ?? 0) === 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Sin lotes
                                  </div>
                                )}
                                {(p.stocks?.length ?? 0) > 0 && (
                                  <div className="max-h-48 overflow-auto rounded-lg border bg-background/60 backdrop-blur-sm">
                                    <Table className="text-[11px]">
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="py-1">
                                            Lote
                                          </TableHead>
                                          <TableHead className="py-1">
                                            Unid
                                          </TableHead>
                                          <TableHead className="py-1">
                                            Venc
                                          </TableHead>
                                          <TableHead className="py-1">
                                            Compra
                                          </TableHead>
                                          <TableHead className="py-1">
                                            Estado
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {p.stocks?.map(l => {
                                          const est = obtenerEstadoLote(
                                            l.fechaVencimiento
                                          )
                                          return (
                                            <TableRow
                                              key={
                                                l.codigoStock ||
                                                `${l.fechaVencimiento}-${l.cantidadUnidades}`
                                              }
                                            >
                                              <TableCell className="py-1">
                                                {l.codigoStock}
                                              </TableCell>
                                              <TableCell className="py-1 tabular-nums">
                                                {l.cantidadUnidades}
                                              </TableCell>
                                              <TableCell className="py-1">
                                                {new Date(
                                                  l.fechaVencimiento
                                                ).toLocaleDateString("es-PE")}
                                              </TableCell>
                                              <TableCell className="py-1 tabular-nums">
                                                S/{" "}
                                                {Number(
                                                  l.precioCompra
                                                ).toFixed(2)}
                                              </TableCell>
                                              <TableCell className="py-1">
                                                <Badge
                                                  variant={est.color as any}
                                                  className="h-5 px-1.5 text-[10px] rounded-full"
                                                >
                                                  {est.texto}{" "}
                                                  {est.dias >= 0 &&
                                                    `(${est.dias}d)`}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                                <div className="pt-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 text-[11px] flex items-center gap-2 text-red-600"
                                    onClick={() => setCreatingStockFor({ id: p.id, nombre: p.nombre })}
                                  >
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Crear lote sin pedido
                                  </Button>
                                </div>
                              </div>

                              {/* Resumen */}
                              <div className="space-y-3 lg:col-span-2">
                                <h4 className="font-semibold flex items-center gap-1 text-[13px]">
                                  <Layers className="h-4 w-4" /> Resumen
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <InfoBox
                                    label="Unidades totales"
                                    value={p.cantidadGeneral}
                                  />
                                  <InfoBox
                                    label="Stock mínimo"
                                    value={p.cantidadMinima ?? 0}
                                  />
                                  <InfoBox
                                    label="Valor compra"
                                    value={`S/ ${(p.stocks || [])
                                      .reduce(
                                        (s, l) =>
                                          s +
                                          l.cantidadUnidades * l.precioCompra,
                                        0
                                      )
                                      .toFixed(2)}`}
                                    wide
                                  />
                                  <InfoBox
                                    label="Lotes"
                                    value={p.stocks?.length || 0}
                                  />
                                  <InfoBox
                                    label="Próx. Venc."
                                    value={
                                      p.stocks?.length
                                        ? Math.min(
                                          ...p.stocks.map(l =>
                                            calcularDiasParaVencer(
                                              l.fechaVencimiento
                                            )
                                          )
                                        ) + " d"
                                        : "—"
                                    }
                                  />
                                  <div className="col-span-2 pt-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-[11px]"
                                      onClick={() => setLotesModalProducto(p)}
                                    >
                                      Más acciones de lotes
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })}
                {pageItems.length === 0 && !loading && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="py-10 text-center text-muted-foreground"
                    >
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={10} className="py-10">
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

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-xs text-muted-foreground space-x-3">
              <span>
                Página {page} de {totalPages}
              </span>

            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                <Input
                  className="w-16 h-8"
                  type="number"
                  min={1}
                  max={totalPages}
                  value={page}
                  onChange={e => {
                    const val = Number(e.target.value)
                    if (!Number.isNaN(val))
                      setPage(Math.min(Math.max(1, val), totalPages))
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
              Código: {lotesModalProducto?.codigoBarras} •{" "}
              {lotesModalProducto?.stocks?.length || 0} lotes
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
          onSaved={() => { setEditingStock(null); setRefreshTick(t => t + 1); cargarProductos() }}
        />
      )}

      {/* DIALOG CREAR LOTE */}
      {creatingStockFor && (
        <CreateStockDialog
          open={!!creatingStockFor}
          onOpenChange={(v) => { if (!v) setCreatingStockFor(null) }}
          productoId={creatingStockFor.id}
          productoNombre={creatingStockFor.nombre}
          onCreated={() => { setCreatingStockFor(null); setRefreshTick(t => t + 1); cargarProductos() }}
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
              onClick={async () => {
                if (!productoAEliminar) return
                try {
                  setEliminando(true)
                  await eliminarProductoPorId(productoAEliminar.id)
                } finally {
                  setEliminando(false)
                  setProductoAEliminar(null)
                }
              }}
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
              ¿Estás seguro que deseas eliminar el lote <strong>{stockToDelete?.codigo ?? stockToDelete?.id}</strong> del producto <strong>{productos.find(p => p.id === stockToDelete?.productoId)?.nombre}</strong>? Esta acción no se puede deshacer.
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
              onClick={async () => {
                if (!stockToDelete) return
                try {
                  setDeletingStock(true)
                  await deleteStock(stockToDelete.id)
                  toast({ title: 'Lote eliminado' })
                  setRefreshTick(t => t + 1)
                  cargarProductos()
                } catch (err: any) {
                  console.error('Error eliminar stock', err)
                  toast({ title: 'Error', description: err?.message || 'No se pudo eliminar', variant: 'destructive' })
                } finally {
                  setDeletingStock(false)
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
      <Dialog open={!!editandoProducto} onOpenChange={cerrarEdicion}>
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

/* =========================================================
   SUBCOMPONENTES
========================================================= */
function DensityToggle({
  compact,
  onChange
}: {
  compact: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center rounded-full border bg-background/60 backdrop-blur px-1">
      <Button
        size="icon"
        variant={!compact ? "secondary" : "ghost"}
        className="h-8 w-8 rounded-full"
        onClick={() => compact && onChange()}
        aria-label="Vista normal"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant={compact ? "secondary" : "ghost"}
        className="h-8 w-8 rounded-full"
        onClick={() => !compact && onChange()}
        aria-label="Vista compacta"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
    </div>
  )
}


function Detail({ label, value }: { label: string; value: any }) {
  return (
    <p className="text-[12px] leading-snug">
      <span className="text-muted-foreground">{label}:</span>{" "}
      <span className="font-medium">{value}</span>
    </p>
  )
}

function InfoBox({
  label,
  value,
  wide,
  accent
}: {
  label: string
  value: any
  wide?: boolean
  accent?: string
}) {
  return (
    <div
      className={clsx(
        "p-2 rounded-lg border bg-background/50 backdrop-blur-sm flex flex-col gap-0.5",
        wide && "col-span-2"
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={clsx("text-xs font-semibold tabular-nums", accent)}>
        {value}
      </span>
    </div>
  )
}

/* Métrica card simplificada */
function MetricCard({
  icon: Icon,
  label,
  value,
  accent,
  warn,
  danger,
  loading
}: {
  icon: React.ComponentType<any>
  label: string
  value: number | string
  accent: string
  warn?: boolean
  danger?: boolean
  loading?: boolean
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(17,25,38,0.85)_0%,rgba(14,20,30,0.75)_60%,rgba(10,15,24,0.85)_100%)] backdrop-blur-md p-4 flex flex-col gap-3">
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_35%_20%,rgba(56,189,248,0.18),transparent_60%)]" />
      <div
        className={clsx(
          "absolute inset-0 pointer-events-none",
          "bg-gradient-to-br",
          accent,
          "opacity-30"
        )}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-900/50 ring-1 ring-white/10">
          <Icon
            className={clsx(
              "h-5 w-5",
              danger
                ? "text-red-400"
                : warn
                  ? "text-amber-400"
                  : "text-cyan-300"
            )}
          />
        </div>
      </div>
      <div
        className={clsx(
          "relative text-2xl font-semibold tabular-nums tracking-tight",
          danger
            ? "text-red-300"
            : warn
              ? "text-amber-300"
              : "text-slate-100"
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-emerald-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        ) : (
          value
        )}
      </div>
    </div>
  )
}