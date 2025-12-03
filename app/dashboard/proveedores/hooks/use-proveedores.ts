"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth, ProductDTO, NewStockLot } from "@/lib/api"
import { apiUrl } from "@/lib/config"

import { Proveedor } from "../types"

export function useProveedores() {
  const { toast } = useToast()

  const [activeView, setActiveView] = useState<'proveedores' | 'pedidos'>('proveedores')
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
  function iniciarEdicion(p: Proveedor) {
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

  return {
    activeView,
    setActiveView,
    proveedores,
    proveedoresFiltrados,
    busqueda,
    setBusqueda,
    loading,
    cargarProveedores,
    
    nuevoProveedor,
    setNuevoProveedor,
    showNuevoDialog,
    setShowNuevoDialog,
    agregarProveedor,

    editandoProveedor,
    setEditandoProveedor,
    iniciarEdicion,
    guardarEdicion,
    cerrarEdicion,

    proveedorAEliminar,
    setProveedorAEliminar,
    eliminando,
    setEliminando,
    eliminarProveedorPorId,

    // Pedidos
    showPedidoDialog,
    setShowPedidoDialog,
    proveedorPedido,
    productosProveedor,
    loadingProductos,
    filtroProducto,
    setFiltroProducto,
    fechaPedido,
    setFechaPedido,
    lotesPorProducto,
    productoExpandido,
    setProductoExpandido,
    enviandoPedido,
    abrirDialogoPedido,
    agregarLoteAProducto,
    removerLote,
    updateLote,
    enviarPedido,
    productosFiltrados
  }
}
