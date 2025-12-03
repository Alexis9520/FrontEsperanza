import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/use-toast"
import { apiUrl } from "@/lib/config"
import { crearVenta, VentaProductoPayload } from "@/lib/api"
import { buildTicketHTML } from "@/lib/print-utils"
import {
  Producto,
  ProductoCarrito,
  UsuarioSesion,
  SortField,
  MetodoPago,
  VentaPreview
} from "../components/types"
import { fetchWithAuth, buildVentaPreviewFromState } from "../components/api-utils"

export function useSales() {
  const router = useRouter()
  const { toast } = useToast()

  // Search State
  const [busqueda, setBusqueda] = useState("")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [mostrarResultados, setMostrarResultados] = useState(false)

  // Pagination (kept for compatibility, though not fully used in UI in original)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Sorting
  const [sortField, setSortField] = useState<SortField>("nombre")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  // Selection State
  const [blisterUnidadSeleccion, setBlisterUnidadSeleccion] = useState<
    Record<string, { blisters: number; unidades: number }>
  >({})

  // Cart & Payment State
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([])
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("efectivo")
  const [montoEfectivo, setMontoEfectivo] = useState("")
  const [montoYape, setMontoYape] = useState("")

  // Customer & Session State
  const [dniCliente, setDniCliente] = useState("00000000")
  const [nombreCliente, setNombreCliente] = useState("CLIENTE GENERAL")
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesion | null>(null)

  // Box State
  const [cajaAbierta, setCajaAbierta] = useState<boolean | null>(null)
  const [cargandoCaja, setCargandoCaja] = useState(false)
  
  // Sale Status State
  const [ventaStatus, setVentaStatus] = useState<"idle" | "procesando" | "exito" | "generando_boleta" | "error">("idle")

  // Config State
  const [configuracionGeneral] = useState(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("configuracionGeneral")
      return data
        ? JSON.parse(data)
        : {
            nombreNegocio: "Nueva Esperanza",
            direccion: "Av. La Esperanza 403 - El Tambo",
            telefono: "+51 961 668 320",
            ruc: "1234567890",
            moneda: "S/"
          }
    }
    return {
      nombreNegocio: "Botica Nueva Esperanza",
      direccion: "Av. La Esperanza 403 - El Tambo",
      telefono: "+51 961 668 320",
      ruc: "1234567890",
      moneda: "S/"
    }
  })

  const [configuracionBoleta] = useState(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("configuracionBoleta")
      return data
        ? JSON.parse(data)
        : {
            serieBoleta: "B",
            mensajePie: "",
            mostrarLogo: true,
            imprimirAutomatico: true,
            formatoImpresion: "80mm"
          }
    }
    return {
      serieBoleta: "B",
      mensajePie: "",
      mostrarLogo: true,
      imprimirAutomatico: true,
      formatoImpresion: "80mm"
    }
  })

  // --- Effects & Logic ---

  const checkCajaAbierta = useCallback(
    async (showMessage = false): Promise<boolean> => {
      if (!usuarioSesion?.dni) {
        setCajaAbierta(false)
        return false
      }
      try {
        setCargandoCaja(true)
        const url = apiUrl(`/api/cajas/actual?dniUsuario=${encodeURIComponent(usuarioSesion.dni)}`)
        const resp = await fetchWithAuth(url)
        if (!resp) {
          setCajaAbierta(false)
          if (showMessage) {
            toast({
              title: "No hay caja abierta",
              description: "Debes abrir una caja antes de realizar la venta.",
              variant: "destructive"
            })
          }
          return false
        }
        const abierta =
          (resp.estado && resp.estado.toUpperCase() === "ABIERTA") ||
          (!resp.estado && !resp.fechaCierre)
        setCajaAbierta(abierta)
        if (showMessage && !abierta) {
          toast({
            title: "Caja no disponible",
            description: "La caja actual está cerrada.",
            variant: "destructive"
          })
        }
        return abierta
      } catch {
        setCajaAbierta(false)
        if (showMessage) {
          toast({
            title: "Error verificando caja",
            description: "No se pudo consultar el estado de la caja.",
            variant: "destructive"
          })
        }
        return false
      } finally {
        setCargandoCaja(false)
      }
    },
    [usuarioSesion?.dni, toast]
  )

  const cargarProductos = useCallback(
    async (opts?: { q?: string; page?: number; size?: number }) => {
      try {
        const q = opts?.q ?? debouncedBusqueda ?? ""
        const p = opts?.page ?? page
        const s = opts?.size ?? pageSize
        const url = apiUrl(`/productos?page=${Math.max(0, p - 1)}&size=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`)
        const data = await fetchWithAuth(url)
        if (Array.isArray(data)) {
          setProductos(data)
          setTotalElements(data.length)
          setTotalPages(1)
        } else if (data && Array.isArray(data.content)) {
          setProductos(data.content)
          setTotalElements(data.totalElements ?? 0)
          setTotalPages(data.totalPages ?? 1)
        } else {
          setProductos([])
          setTotalElements(0)
          setTotalPages(1)
        }
      } catch (err) {
        console.error("Error cargarProductos:", err)
        toast({
          title: "Error",
          description: "No se pudo cargar productos",
          variant: "destructive"
        })
        setProductos([])
      }
    },
    [debouncedBusqueda, page, pageSize, toast]
  )

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda.trim()), 300)
    return () => clearTimeout(t)
  }, [busqueda])

  useEffect(() => {
    if (debouncedBusqueda) setMostrarResultados(true)
    cargarProductos({ q: debouncedBusqueda, page, size: pageSize })
  }, [cargarProductos, debouncedBusqueda, page, pageSize])

  useEffect(() => {
    const usuarioStr = typeof window !== "undefined" ? localStorage.getItem("usuario") : null
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (usuarioStr && token) {
      try {
        const usuario = JSON.parse(usuarioStr)
        setUsuarioSesion(usuario)
      } catch {
        setUsuarioSesion(null)
        localStorage.removeItem("usuario")
        localStorage.removeItem("token")
        toast({
          title: "Error",
          description: "No has iniciado sesión",
          variant: "destructive"
        })
        router.push("/login")
      }
    } else {
      setUsuarioSesion(null)
      toast({
        title: "Error",
        description: "No has iniciado sesión",
        variant: "destructive"
      })
      router.push("/login")
    }
  }, [toast, router])

  useEffect(() => {
    if (usuarioSesion?.dni) checkCajaAbierta()
  }, [usuarioSesion?.dni, checkCajaAbierta])

  const resultados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const arr = Array.isArray(productos) ? productos : []
    const base = mostrarResultados
      ? arr.filter(p =>
          (p.nombre ?? "").toLowerCase().includes(q) ||
          (p.codigoBarras ?? "").toLowerCase().includes(q) ||
          (p.laboratorio ?? "").toLowerCase().includes(q) ||
          (p.concentracion ?? "").toLowerCase().includes(q) ||
          (p.tipoMedicamento ?? "").toLowerCase().includes(q)
        )
      : []
    base.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1
      switch (sortField) {
        case "nombre":
          return (a.nombre ?? "").localeCompare(b.nombre ?? "") * mul
        case "precio": {
          const pa = a.precioVentaUnd - (a.descuento || 0)
          const pb = b.precioVentaUnd - (b.descuento || 0)
          return (pa - pb) * mul
        }
        case "stock":
          return (a.cantidadGeneral - b.cantidadGeneral) * mul
        case "laboratorio":
          return (a.laboratorio || "").localeCompare(b.laboratorio || "") * mul
        case "tipo":
          return (a.tipoMedicamento || "").localeCompare(b.tipoMedicamento || "") * mul
        case "concentracion":
          return (a.concentracion || "").localeCompare(b.concentracion || "") * mul
        default:
          return 0
      }
    })
    return base
  }, [productos, busqueda, sortField, sortDir, mostrarResultados])

  const total = carrito.reduce(
    (sum, item) =>
      sum +
      (item.precioVentaBlister ?? 0) * item.cantidadBlister +
      (item.precioVentaUnd - (item.descuento ?? 0)) * item.cantidadUnidad,
    0
  )

  // Auto-fill Yape amount
  useEffect(() => {
    if (metodoPago === "yape") {
      setMontoYape(total.toFixed(2))
    }
  }, [total, metodoPago])

  let vuelto = 0
  let faltante = 0
  if (metodoPago === "efectivo") {
    const efectivo = Number.parseFloat(montoEfectivo) || 0
    vuelto = efectivo > total ? efectivo - total : 0
    faltante = efectivo < total ? total - efectivo : 0
  } else if (metodoPago === "yape") {
    const yape = Number.parseFloat(montoYape) || 0
    vuelto = yape > total ? yape - total : 0
    faltante = yape < total ? total - yape : 0
  } else {
    const ef = Number(montoEfectivo) || 0
    const yp = Number(montoYape) || 0
    const pagado = ef + yp
    vuelto = pagado > total ? pagado - total : 0
    faltante = pagado < total ? total - pagado : 0
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => (d === "asc" ? "desc" : "asc"))
    else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const agregarAlCarrito = (producto: Producto, selectionKey: string) => {
    const codigo = (producto.codigoBarras || "").trim()
    if (!codigo && (producto.id === undefined || producto.id === null)) {
      toast({
        title: "Producto inválido",
        description: "El producto debe tener código de barras o un identificador (id).",
        variant: "destructive"
      })
      return
    }

    const precioUnidadFinal = producto.precioVentaUnd - (producto.descuento ?? 0)
    if (precioUnidadFinal <= 0) {
      toast({
        title: "Precio inválido",
        description: `El producto "${producto.nombre}" tiene precio unidad <= 0.`,
        variant: "destructive"
      })
      return
    }
    if (
      producto.cantidadUnidadesBlister &&
      producto.precioVentaBlister !== undefined &&
      producto.precioVentaBlister <= 0
    ) {
      toast({
        title: "Precio blister inválido",
        description: `El producto "${producto.nombre}" tiene precio de blister <= 0.`,
        variant: "destructive"
      })
      return
    }

    const sel = blisterUnidadSeleccion[selectionKey] || { blisters: 0, unidades: 0 }
    const unidadesPorBlister = producto.cantidadUnidadesBlister || 0
    const cantidadTotal = unidadesPorBlister * sel.blisters + sel.unidades
    if (cantidadTotal <= 0) {
      toast({ title: "Cantidad inválida", description: "Agrega al menos 1 unidad o blister", variant: "destructive" })
      return
    }
    if (cantidadTotal > producto.cantidadGeneral) {
      toast({
        title: "Stock insuficiente",
        description: `Máximo ${producto.cantidadGeneral} unidades`,
        variant: "destructive"
      })
      return
    }

    setCarrito(prev => {
      const existing = producto.id !== undefined && producto.id !== null
        ? prev.find(p => p.id === producto.id)
        : prev.find(p => p.codigoBarras === producto.codigoBarras)
      const precioBlister = producto.precioVentaBlister ?? 0

      if (existing) {
        const newB = existing.cantidadBlister + sel.blisters
        const newU = existing.cantidadUnidad + sel.unidades
        const nuevoTotalUnidades = unidadesPorBlister * newB + newU
        if (nuevoTotalUnidades > existing.stockDisponible) {
          toast({
            title: "Stock insuficiente",
            description: `Máximo ${existing.stockDisponible} unidades`,
            variant: "destructive"
          })
          return prev
        }
        return prev.map(p =>
          existing.id !== undefined && existing.id !== null
            ? (p.id === existing.id
                ? {
                    ...p,
                    cantidadBlister: newB,
                    cantidadUnidad: newU,
                    subtotal: precioBlister * newB + precioUnidadFinal * newU
                  }
                : p)
            : (p.codigoBarras === existing.codigoBarras
                ? {
                    ...p,
                    cantidadBlister: newB,
                    cantidadUnidad: newU,
                    subtotal: precioBlister * newB + precioUnidadFinal * newU
                  }
                : p)
        )
      }

      return [
        ...prev,
        {
          id: producto.id,
          codigoBarras: producto.codigoBarras,
          nombre: producto.nombre,
          precioVentaUnd: producto.precioVentaUnd,
          precioVentaBlister: producto.precioVentaBlister,
          cantidadUnidadesBlister: producto.cantidadUnidadesBlister,
          descuento: producto.descuento,
          cantidadBlister: sel.blisters,
          cantidadUnidad: sel.unidades,
          subtotal: precioBlister * sel.blisters + precioUnidadFinal * sel.unidades,
          stockDisponible: producto.cantidadGeneral
        }
      ]
    })
    
    // Optional: Clear selection after adding
    setBlisterUnidadSeleccion(prev => ({
        ...prev,
        [selectionKey]: { blisters: 0, unidades: 0 }
    }))
    // Optional: Clear search? No, user might want to add more.
  }

  const cambiarCantidadCarrito = (codigoBarras: string, tipo: "blister" | "unidad", delta: number) => {
    setCarrito(prev =>
      prev
        .map(item => {
          let match = false
          if (codigoBarras.startsWith("id:")) {
            const idNum = Number(codigoBarras.slice(3))
            match = item.id === idNum
          } else {
            match = item.codigoBarras === codigoBarras
          }
          if (!match) return item

          if ((!item.codigoBarras || !item.codigoBarras.trim()) && (item.id === undefined || item.id === null)) {
            toast({
              title: "Código inválido",
              description: "Este producto no tiene código de barras ni identificador.",
              variant: "destructive"
            })
            return item
          }

          const precioUnidadFinal = item.precioVentaUnd - (item.descuento ?? 0)
          if (precioUnidadFinal <= 0) {
            toast({
              title: "Precio inválido",
              description: `El producto "${item.nombre}" tiene precio unidad <= 0.`,
              variant: "destructive"
            })
            return item
          }

          const stockMax = item.stockDisponible
          let nb = item.cantidadBlister
          let nu = item.cantidadUnidad

          if (tipo === "blister") {
            nb = Math.max(0, nb + delta)
          } else {
            nu = Math.max(0, nu + delta)
          }

          const unidadesPorBlister = item.cantidadUnidadesBlister || 0
          const totalTemp = unidadesPorBlister * nb + nu
          if (totalTemp > stockMax) {
            toast({
              title: "Stock insuficiente",
              description: `Máximo ${stockMax} unidades`,
              variant: "destructive"
            })
            return item
          }
          const precioBlister = item.precioVentaBlister ?? 0
          return {
            ...item,
            cantidadBlister: nb,
            cantidadUnidad: nu,
            subtotal: precioBlister * nb + precioUnidadFinal * nu
          }
        })
        .filter(i => i.cantidadBlister > 0 || i.cantidadUnidad > 0)
    )
  }

  const eliminarDelCarrito = (codigoBarras: string) => {
    let eliminado: ProductoCarrito | undefined
    if (codigoBarras.startsWith("id:")) {
      const idNum = Number(codigoBarras.slice(3))
      eliminado = carrito.find(c => c.id === idNum)
      setCarrito(prev => prev.filter(c => c.id !== idNum))
    } else {
      eliminado = carrito.find(c => c.codigoBarras === codigoBarras)
      setCarrito(prev => prev.filter(c => c.codigoBarras !== codigoBarras))
    }
    if (eliminado) {
      toast({
        title: "Producto eliminado",
        description: `"${eliminado.nombre}" fue removido`,
      })
    }
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast({ title: "Carrito vacío", description: "Agrega productos", variant: "destructive" })
      return
    }
    const abierta = await checkCajaAbierta(true)
    if (!abierta) return

    const productoInvalido = carrito.find(p => {
      const tieneIdent = (p.id !== undefined && p.id !== null) || ((p.codigoBarras || "").trim() !== "")
      const precioUnidadFinal = p.precioVentaUnd - (p.descuento ?? 0)
      return !tieneIdent || precioUnidadFinal <= 0
    })
    if (productoInvalido) {
      toast({
        title: "Carrito inválido",
        description: `El producto "${productoInvalido.nombre}" tiene código vacío y sin id, o precio <= 0.`,
        variant: "destructive"
      })
      return
    }

    if (metodoPago === "efectivo") {
      const efectivo = Number(montoEfectivo) || 0
      if (efectivo < total) {
        toast({ title: "Monto insuficiente", description: "El efectivo no cubre el total", variant: "destructive" })
        return
      }
    } else if (metodoPago === "yape") {
      const yape = Number(montoYape) || 0
      if (yape < total) {
        toast({ title: "Monto insuficiente", description: "El monto Yape no cubre el total", variant: "destructive" })
        return
      }
    } else {
      const ef = Number(montoEfectivo) || 0
      const yp = Number(montoYape) || 0
      if (ef <= 0 || yp <= 0) {
        toast({ title: "Montos inválidos", description: "Ambos montos deben ser > 0", variant: "destructive" })
        return
      }
      if (ef + yp < total) {
        toast({ title: "Suma insuficiente", description: "La suma no cubre el total", variant: "destructive" })
        return
      }
    }

    if (!nombreCliente.trim() || !usuarioSesion?.nombreCompleto) {
      toast({ title: "Faltan datos", description: "Completa los datos del cliente", variant: "destructive" })
      return
    }

    const productosPayload: VentaProductoPayload[] = carrito.map(item => {
      const unidadesPorBlister = item.cantidadUnidadesBlister || 0
      const blisterCount = item.cantidadBlister || 0
      const unidadCount = item.cantidadUnidad || 0
      const totalUnits = unidadesPorBlister * blisterCount + unidadCount

      const payload: VentaProductoPayload = { cantidad: totalUnits }
      if (item.id !== undefined && item.id !== null) payload.id = item.id
      else payload.codBarras = item.codigoBarras
      return payload
    })

    const ventaDTO = {
      dniCliente: dniCliente.trim() || "",
      nombreCliente: nombreCliente.trim(),
      dniVendedor: usuarioSesion?.dni || "",
      productos: productosPayload,
      metodoPago: {
        nombre: metodoPago.toUpperCase(),
        efectivo: (metodoPago === "efectivo" || metodoPago === "mixto") ? Number(montoEfectivo) : 0.0,
        digital: metodoPago === "yape" ? (Number(montoYape) - vuelto) : (metodoPago === "mixto" ? Number(montoYape) : 0),
        efectivoFix: metodoPago === "efectivo" 
          ? total
          : (metodoPago === "mixto" ? (total - (Number(montoYape) || 0)) : 0)
      }
    }

    try {
      setVentaStatus("procesando")
      const resp = await crearVenta(ventaDTO, toast)
      if (!resp?.numero) {
        toast({ title: "Error", description: "No se recibió número de boleta", variant: "destructive" })
        setVentaStatus("error")
        return
      }
      setVentaStatus("exito")
      toast({ title: "Venta realizada", description: "Registrada correctamente" })

      setVentaStatus("generando_boleta")
      const ventaPreview: VentaPreview = buildVentaPreviewFromState({
        numero: resp.numero,
        fecha: resp.fecha || new Date().toLocaleString(),
        carrito,
        total,
        metodoPago,
        montoEfectivo: Number(montoEfectivo) || 0,
        montoYape: Number(montoYape) || 0,
        nombreCliente: nombreCliente.trim(),
        dniCliente: dniCliente.trim(),
        nombreVendedor: usuarioSesion?.nombreCompleto
      })

      const html = buildTicketHTML(
        ventaPreview,
        {
          nombreNegocio: configuracionGeneral.nombreNegocio,
          direccion: configuracionGeneral.direccion,
          telefono: configuracionGeneral.telefono,
          email: configuracionGeneral.email,
          ruc: configuracionGeneral.ruc,
          moneda: configuracionGeneral.moneda
        },
        {
          mensajePie: configuracionBoleta.mensajePie,
          mostrarLogo: configuracionBoleta.mostrarLogo,
          formatoImpresion: configuracionBoleta.formatoImpresion as any
        }
      )

      const previewWin = window.open("/print", "ticketPreview", "width=800,height=900")
      if (!previewWin) {
        toast({
          title: "Pop-up bloqueado",
          description: "Permite ventanas emergentes para imprimir.",
          variant: "destructive"
        })
      }
      try {
        localStorage.setItem(
          "ticket_preview_job",
          JSON.stringify({
            html,
            formato: configuracionBoleta.formatoImpresion,
            auto: !!configuracionBoleta.imprimirAutomatico
          })
        )
      } catch {}

      try {
        await cargarProductos({ q: debouncedBusqueda, page: 1, size: pageSize })
      } catch {}

      setCarrito([])
      setMontoEfectivo("")
      setMontoYape("")
      setMostrarResultados(false)
      setDniCliente("")
      setNombreCliente("")
      setTimeout(() => setVentaStatus("idle"), 2500)
    } catch (e: any) {
      setVentaStatus("error")
      const msg = typeof e === "string" ? e : e?.message || "No se pudo registrar la venta"
      if (msg.includes("No hay una caja abierta")) {
        setCajaAbierta(false)
        toast({
          title: "Caja cerrada",
          description: "Abre una caja antes de vender.",
          variant: "destructive"
        })
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" })
      }
    }
  }

  return {
    busqueda,
    setBusqueda,
    mostrarResultados,
    setMostrarResultados,
    resultados,
    sortField,
    sortDir,
    toggleSort,
    blisterUnidadSeleccion,
    setBlisterUnidadSeleccion,
    agregarAlCarrito,
    carrito,
    cambiarCantidadCarrito,
    eliminarDelCarrito,
    total,
    dniCliente,
    setDniCliente,
    nombreCliente,
    setNombreCliente,
    usuarioSesion,
    metodoPago,
    setMetodoPago,
    montoEfectivo,
    setMontoEfectivo,
    montoYape,
    setMontoYape,
    faltante,
    vuelto,
    procesarVenta,
    ventaStatus,
    cajaAbierta,
    cargandoCaja,
    procesarVentaDisabled: carrito.length === 0 || !cajaAbierta || cargandoCaja
  }
}
