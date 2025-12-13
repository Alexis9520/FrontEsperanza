"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth, crearProducto, actualizarProducto, deleteStock, getProductMetrics } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { Producto, FriendlyErrorInfo } from "../types"

/* =========================================================
   HELPERS
========================================================= */

const today = () => new Date()

export function calcularDiasParaVencer(fecha: string) {
  if (!fecha) return 0
  const f = new Date(fecha)
  const h = today()
  h.setHours(0, 0, 0, 0)
  f.setHours(0, 0, 0, 0)
  return Math.ceil((f.getTime() - h.getTime()) / 86400000)
}

export function obtenerEstadoLote(fechaVencimiento: string) {
  const dias = calcularDiasParaVencer(fechaVencimiento)
  if (dias < 0) return { estado: "vencido", color: "destructive", texto: "Vencido", dias }
  if (dias <= 30) return { estado: "vence-pronto", color: "secondary", texto: "Pronto", dias }
  return { estado: "vigente", color: "outline", texto: "Vigente", dias }
}

function extractStatusFromError(error: any): number | null {
  if (!error) return null
  const candidate = (error as any).status ?? error?.statusCode ?? error?.response?.status ?? error?.cause?.status ?? null
  const value = typeof candidate === "string" ? Number(candidate) : candidate
  return typeof value === "number" && !Number.isNaN(value) ? value : null
}

function interpretStockDeletionError(error: any): FriendlyErrorInfo {
  const status = extractStatusFromError(error)
  if (status === 403) {
    return {
      title: "Lote con pedido vinculado",
      description: "No puedes eliminar este lote porque proviene de un pedido activo. Elimina o actualiza el pedido primero."
    }
  }
  if (status === 409) {
    return {
      title: "Lote con ventas registradas",
      description: "El lote ya tiene ventas asociadas, por lo que no puede eliminarse. Ajusta el stock desde un movimiento manual."
    }
  }
  if (status === 404) {
    return {
      title: "Lote no encontrado",
      description: "El lote ya fue eliminado o no existe. Actualiza para ver el estado más reciente."
    }
  }
  return {
    title: "No se pudo eliminar el lote",
    description: "Hubo un problema al eliminar el lote. Intenta nuevamente o contacta al administrador si persiste."
  }
}

function interpretProductUpdateError(error: any): FriendlyErrorInfo {
  const status = extractStatusFromError(error)
  const backendMsg = (error && ((error as any).backendMessage || (error as any).message || "")) || ""
  const lowerMsg = String(backendMsg).toLowerCase()
  if (status === 400) {
    return {
      title: "Revisa los datos",
      description: "El servidor rechazó la solicitud porque hay datos incompletos o con un formato inválido."
    }
  }
  if (status === 403) {
    return {
      title: "Permiso denegado",
      description: "Tu usuario no tiene permisos para editar este producto. Solicita acceso al administrador."
    }
  }
  if (status === 404) {
    return {
      title: "Producto no encontrado",
      description: "El producto ya no existe o fue eliminado por otro usuario."
    }
  }
  if (status === 409) {
    // Detectar si el conflicto viene por número de registro sanitario
    if (lowerMsg.includes("registro") || lowerMsg.includes("registro sanitario") || lowerMsg.includes("nroregistro") || lowerMsg.includes("nro_registro") || lowerMsg.includes("nro registro")) {
      return {
        title: "Número de registro sanitario duplicado",
        description: "Ya existe un producto con el mismo número de registro sanitario. Usa uno distinto o deja el campo vacío."
      }
    }
    return {
      title: "Registro duplicado",
      description: "Ya existe un producto con los mismos datos (nombre o código de barras). Ajusta la información y vuelve a intentar."
    }
  }
  return {
    title: "No se pudo guardar",
    description: "Ocurrió un problema inesperado al guardar el producto. Intenta nuevamente en unos segundos."
  }
}

function interpretProductDeletionError(error: any): FriendlyErrorInfo {
  const status = extractStatusFromError(error)
  if (status === 403) {
    return {
      title: "No se puede eliminar",
      description: "No cuentas con permisos para eliminar este producto o está protegido por políticas de seguridad."
    }
  }
  if (status === 409) {
    return {
      title: "Producto con movimientos",
      description: "El producto tiene ventas, pedidos u otros movimientos asociados y no puede eliminarse."
    }
  }
  if (status === 404) {
    return {
      title: "Producto no encontrado",
      description: "Parece que el producto ya fue eliminado. Refresca la lista para confirmar."
    }
  }
  return {
    title: "No se pudo eliminar",
    description: "Hubo un inconveniente al eliminar el producto. Intenta nuevamente o contacta soporte."
  }
}

function validateRns(value: any): { ok: boolean; message?: string } {
  const v = typeof value === 'string' ? value.trim() : ''
  if (!v) return { ok: true }
  if (v.length > 64) return { ok: false, message: 'N.º Registro Sanitario: máximo 64 caracteres.' }
  const re = new RegExp('^[A-Za-z0-9\\-\\/\\s]*$')
  if (!re.test(v)) return { ok: false, message: 'N.º Registro Sanitario: formato inválido.' }
  return { ok: true }
}

export function useProductos() {
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [densityCompact, setDensityCompact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
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
    proveedorIds: [] as number[],
    nro_registro_sanitario: ""
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

  // Comparación de precios
  const [priceCompareProduct, setPriceCompareProduct] = useState<Producto | null>(null)

  /* ------------ CARGA DATOS AUXILIARES ------------- */
  const cargarDiccionarioProveedores = useCallback(async () => {
    try {
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
  }, [cargarProductos, refreshTick])

  /* ------------ MÉTRICAS (desde API Backend) ------------- */
  const [globalMetricas, setGlobalMetricas] = useState<null | {
    productos: number
    unidades: number
    criticos: number
    vencidos: number
  }>(null)
  const [globalMetricasLoading, setGlobalMetricasLoading] = useState(false)

  const cargarMetricasGlobales = useCallback(async () => {
    try {
      setGlobalMetricasLoading(true)
      const data = await getProductMetrics()
      setGlobalMetricas({
        productos: data.totalProductosActivos ?? 0,
        unidades: data.cantidadTotalUnidades ?? 0,
        criticos: data.productosStockCritico ?? 0,
        vencidos: data.lotesVencidos ?? 0
      })
    } catch (err) {
      console.error("Error cargarMetricasGlobales:", err)
      setGlobalMetricas(null)
    } finally {
      setGlobalMetricasLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarMetricasGlobales()
  }, [cargarMetricasGlobales, refreshTick])

  const metricas = useMemo(() => {
    if (globalMetricas) return globalMetricas
    return { productos: 0, unidades: 0, criticos: 0, vencidos: 0 }
  }, [globalMetricas])

  /* ------------ CRUD NUEVO ------------- */
  async function agregarProducto() {
    if (!nuevoProducto.nombre || !(nuevoProducto.nombre || "").trim()) {
      toast({
        title: "Campo obligatorio",
        description: "Nombre del producto es obligatorio",
        variant: "destructive"
      })
      return
    }

    // Validate RNS client-side before sending
    const validRns = validateRns(nuevoProducto.nro_registro_sanitario)
    if (!validRns.ok) {
      toast({ title: 'Campo inválido', description: validRns.message, variant: 'destructive' })
      return false
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
      proveedorIds: nuevoProducto.proveedorIds,
      nroRegistroSanitario: nuevoProducto.nro_registro_sanitario && nuevoProducto.nro_registro_sanitario.trim() !== "" ? nuevoProducto.nro_registro_sanitario : null,
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
        proveedorIds: [],
        nro_registro_sanitario: "",
      })
      cargarProductos()
      setRefreshTick(t => t + 1)
      return true
    } catch (err) {
      const status = extractStatusFromError(err)
      if (status === 409) {
        const { title, description } = interpretProductUpdateError(err)
        toast({ title, description, variant: 'destructive' })
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar",
          variant: "destructive"
        })
      }
      return false
    }
  }

  /* ------------ CRUD EDITAR ------------- */
  function iniciarEdicion(p: Producto) {
    setEditandoProducto({
      id: p.id,
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
      proveedorIds: p.proveedores?.map(prov => prov.id) || [],
      nro_registro_sanitario: (p as any).nroRegistroSanitario || ""
    })
  }

  async function guardarEdicion() {
    if (!editandoProducto) return
    if (!editandoProducto.nombre || !(editandoProducto.nombre || "").trim()) {
      toast({
        title: "Campo obligatorio",
        description: "Nombre del producto es obligatorio",
        variant: "destructive"
      })
      return
    }

    // Validate RNS client-side before sending
    const validEditRns = validateRns(editandoProducto.nro_registro_sanitario)
    if (!validEditRns.ok) {
      toast({ title: 'Campo inválido', description: validEditRns.message, variant: 'destructive' })
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
      nroRegistroSanitario: editandoProducto.nro_registro_sanitario && editandoProducto.nro_registro_sanitario.trim() !== "" ? editandoProducto.nro_registro_sanitario : null,
    }

    try {
      const res = await actualizarProducto(editandoProducto.id, body as any)
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
      const { title, description } = interpretProductUpdateError(err)
      toast({
        title,
        description,
        variant: "destructive"
      })
    }
  }

  async function eliminarProductoPorId(id: number) {
    try {
      await fetchWithAuth(apiUrl(`/productos/${id}`), {
        method: "DELETE"
      })
      toast({ title: "Producto eliminado" })
      cargarProductos()
      setRefreshTick(t => t + 1)
    } catch (err: any) {
      const { title, description } = interpretProductDeletionError(err)
      toast({
        title,
        description,
        variant: "destructive"
      })
    }
  }

  async function eliminarStock(id: number) {
    try {
      await deleteStock(id)
      toast({ title: 'Lote eliminado' })
      setRefreshTick(t => t + 1)
      cargarProductos()
    } catch (err: any) {
      console.error('Error eliminar stock', err)
      const { title, description } = interpretStockDeletionError(err)
      toast({ title, description, variant: 'destructive' })
      throw err
    }
  }

  function cerrarEdicion() {
    setEditandoProducto(null)
  }

  function toggleExpand(id: number) {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return {
    // State
    productos,
    busqueda,
    setBusqueda,
    expandedRows,
    densityCompact,
    setDensityCompact,
    loading,
    diccionarioProveedores,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    nuevoProducto,
    setNuevoProducto,
    editandoProducto,
    setEditandoProducto,
    productoAEliminar,
    setProductoAEliminar,
    eliminando,
    setEliminando,
    lotesModalProducto,
    setLotesModalProducto,
    editingStock,
    setEditingStock,
    stockToDelete,
    setStockToDelete,
    deletingStock,
    setDeletingStock,
    creatingStockFor,
    setCreatingStockFor,
    priceCompareProduct,
    setPriceCompareProduct,
    metricas,
    globalMetricasLoading,

    // Actions
    cargarProductos,
    setRefreshTick,
    agregarProducto,
    iniciarEdicion,
    guardarEdicion,
    cerrarEdicion,
    eliminarProductoPorId,
    eliminarStock,
    toggleExpand
  }
}
