import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useTheme } from "next-themes"
import { useToast } from "@/lib/use-toast"
import { buildTicketHTML } from "@/lib/print-utils"
import { getBoletas } from "@/lib/api"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { ConfGeneral, ConfBoleta, ConfNotificaciones, VentaPreview } from "../components/types"

const ENABLE_AUTOSAVE = true
const AUTOSAVE_DELAY = 900

function safeTime(s: any) {
  const t = new Date(s as string).getTime()
  return isNaN(t) ? 0 : t
}

export function useConfiguracion() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [configuracionGeneral, setConfiguracionGeneral] = useLocalStorageState<ConfGeneral>("configuracionGeneral", {
    nombreNegocio: "Botica Nueva Esperanza",
    direccion: "Av. La Esperanza 403 - El Tambo",
    telefono: "+51 961 668 320",
    email: "contacto@nuevaesperanza.net.pe",
    ruc: "1234567890",
    moneda: "S/",
  })

  const [configuracionBoleta, setConfiguracionBoleta] = useLocalStorageState<ConfBoleta>("configuracionBoleta", {
    serieBoleta: "B",
    mensajePie: "¡Gracias por su compra!",
    mostrarLogo: true,
    imprimirAutomatico: true,
    formatoImpresion: "80mm",
  })

  const [configuracionNotificaciones, setConfiguracionNotificaciones] = useState<ConfNotificaciones>({
    stockBajo: true,
    proximosVencer: true,
    ventasAltas: true,
    cierreCaja: true,
    nuevosUsuarios: true,
  })

  const [ultimaVenta, setUltimaVenta] = useState<VentaPreview | null>(null)
  const ventanaAbiertaRef = useRef<Window | null>(null)

  const [changedGeneral, setChangedGeneral] = useState(false)
  const [changedBoleta, setChangedBoleta] = useState(false)
  const [autoSavedGeneralAt, setAutoSavedGeneralAt] = useState<number | null>(null)
  const [autoSavedBoletaAt, setAutoSavedBoletaAt] = useState<number | null>(null)

  const moneda = configuracionGeneral.moneda

  /* -------- Carga última venta -------- */
  useEffect(() => {
    const load = async () => {
      try {
        const ls = localStorage.getItem("ultimaVentaPreview")
        if (ls) {
          setUltimaVenta(JSON.parse(ls))
          return
        }
      } catch {}
      try {
        const data = await getBoletas({ page: 1, limit: 10 })
        const itemsRaw = data?.items
        const lista: any[] = Array.isArray(itemsRaw) ? itemsRaw : []
        const adapt = (b: any): VentaPreview => {
          const numero = b.numero ?? b.boleta ?? "B-000000"
          const fechaR = b.fecha ?? b.fecha_venta ?? new Date().toISOString()
          const cliente = b.cliente ?? b.nombre_cliente ?? "Público general"
          const dni = b.dni ?? b.dni_cliente ?? ""
          const vendedor = b.usuario ?? b.usuario_nombre ?? ""
          const productos = (b.productos ?? b.detalles ?? []) as any[]
          const items = productos.map((p: any) => {
            const qty = Number(p.cantidad ?? 0)
            const precio = Number(p.precio ?? p.precio_unitario ?? 0)
            return {
              nombre: p.nombre ?? p.producto ?? "Producto",
              cantidad: qty,
              precio,
              subtotal: qty * precio
            }
          })
          const total =
            Number(b.totalCompra ?? b.total_compra ?? b.total) ||
            items.reduce((acc, it) => acc + it.subtotal, 0)
          const metodoNombre = b.metodoPago ?? b.metodo_pago ?? "Efectivo"
          const efectivo = Number(b.efectivo ?? 0)
          const digital = Number(b.digital ?? 0)
          const pagado = efectivo + digital
          const vuelto = pagado > total ? pagado - total : 0
          return {
            numero,
            fecha: new Date(fechaR).toLocaleString(),
            cliente,
            dni,
            vendedor,
            items,
            total,
            metodo: {
              nombre: String(metodoNombre),
              efectivo: efectivo || undefined,
              digital: digital || undefined,
              vuelto: vuelto || undefined
            }
          }
        }
        const adaptadas: VentaPreview[] = lista.map(adapt).sort(
          (a: VentaPreview, b: VentaPreview) => safeTime(b.fecha) - safeTime(a.fecha)
        )
        if (adaptadas[0]) {
          setUltimaVenta(adaptadas[0])
          try { localStorage.setItem("ultimaVentaPreview", JSON.stringify(adaptadas[0])) } catch {}
        }
      } catch {}
    }
    load()
  }, [])

  /* -------- Mock si no hay venta -------- */
  const mockVenta: VentaPreview = useMemo(() => ({
    numero: `${configuracionBoleta.serieBoleta}-000123`,
    fecha: new Date().toLocaleString(),
    cliente: "Público general",
    dni: "",
    vendedor: "",
    items: [
      { nombre: "Paracetamol 500mg", cantidad: 1, precio: 2.5, subtotal: 2.5 },
      { nombre: "Ibuprofeno 400mg", cantidad: 2, precio: 3, subtotal: 6 },
    ],
    total: 8.5,
    metodo: { nombre: "Efectivo", efectivo: 10, digital: 0, vuelto: 1.5 },
  }), [configuracionBoleta.serieBoleta])

  const ventaParaPreview = ultimaVenta ?? mockVenta

  /* -------- Ticket HTML para print window -------- */
  const construirHTMLTicket = useCallback(() => {
    return buildTicketHTML(
      ventaParaPreview,
      {
        nombreNegocio: configuracionGeneral.nombreNegocio,
        direccion: configuracionGeneral.direccion,
        telefono: configuracionGeneral.telefono,
        email: configuracionGeneral.email || "",
        ruc: configuracionGeneral.ruc || "",
        moneda
      },
      {
        mensajePie: configuracionBoleta.mensajePie,
        mostrarLogo: configuracionBoleta.mostrarLogo,
        formatoImpresion: configuracionBoleta.formatoImpresion
      }
    )
  }, [ventaParaPreview, configuracionGeneral, configuracionBoleta, moneda])

  const guardarJob = (auto = false) => {
    try {
      localStorage.setItem("ticket_preview_job", JSON.stringify({
        html: construirHTMLTicket(),
        formato: configuracionBoleta.formatoImpresion,
        auto
      }))
    } catch {}
  }

  const vistaPreviaTicket = () => {
    guardarJob(false)
    const win = window.open("/print", "ticketPreview", "width=800,height=900")
    if (!win) {
      toast({ title: "Pop‑up bloqueado", description: "Permite ventanas emergentes para la vista previa.", variant: "destructive" })
      return
    }
    ventanaAbiertaRef.current = win
  }
  const reenviarJob = () => {
    if (!ventanaAbiertaRef.current || ventanaAbiertaRef.current.closed) {
      toast({ title: "Ventana no abierta", description: "Abre primero la vista previa.", variant: "destructive" })
      return
    }
    guardarJob(false)
    try { ventanaAbiertaRef.current.focus() } catch {}
    toast({ title: "Vista previa actualizada", description: "Ticket reenviado." })
  }

  /* -------- Guardados manuales / autosave -------- */
  const guardarConfiguracionGeneral = () => {
    setChangedGeneral(false)
    setAutoSavedGeneralAt(Date.now())
    toast({ title: "General guardado", description: "Configuración actualizada." })
  }
  const guardarConfiguracionBoleta = () => {
    setChangedBoleta(false)
    setAutoSavedBoletaAt(Date.now())
    toast({ title: "Boletas guardado", description: "Configuración aplicada." })
  }
  const guardarConfiguracionNotificaciones = () => {
    toast({ title: "Notificaciones", description: "Sección en desarrollo." })
  }

  const resetearConfiguracion = () => {
    setConfiguracionGeneral({
      nombreNegocio: "Botica Nueva Esperanza",
      direccion: "Av. La Esperanza 403 - El Tambo",
      telefono: "+51 961 668 320",
      email: "contacto@nuevaesperanza.net.pe",
      ruc: "1234567890",
      moneda: "S/",
    })
    setConfiguracionBoleta({
      serieBoleta: "B",
      mensajePie: "¡Gracias por su compra!",
      mostrarLogo: true,
      imprimirAutomatico: true,
      formatoImpresion: "80mm",
    })
    setChangedGeneral(false)
    setChangedBoleta(false)
    toast({ title: "Restablecido", description: "Valores predeterminados." })
  }

  const debouncedGeneral = useDebouncedCallback(() => {
    if (ENABLE_AUTOSAVE && changedGeneral) guardarConfiguracionGeneral()
  }, AUTOSAVE_DELAY, [configuracionGeneral, changedGeneral])

  const debouncedBoleta = useDebouncedCallback(() => {
    if (ENABLE_AUTOSAVE && changedBoleta) guardarConfiguracionBoleta()
  }, AUTOSAVE_DELAY, [configuracionBoleta, changedBoleta])

  useEffect(() => { if (changedGeneral) debouncedGeneral() }, [configuracionGeneral, changedGeneral, debouncedGeneral])
  useEffect(() => { if (changedBoleta) debouncedBoleta() }, [configuracionBoleta, changedBoleta, debouncedBoleta])

  const updateGeneral = (patch: Partial<ConfGeneral>) => {
    setConfiguracionGeneral(prev => ({ ...prev, ...patch }))
    setChangedGeneral(true)
  }
  const updateBoleta = (patch: Partial<ConfBoleta>) => {
    setConfiguracionBoleta(prev => ({ ...prev, ...patch }))
    setChangedBoleta(true)
  }

  return {
    theme,
    setTheme,
    configuracionGeneral,
    configuracionBoleta,
    configuracionNotificaciones,
    setConfiguracionNotificaciones,
    ventaParaPreview,
    moneda,
    changedGeneral,
    changedBoleta,
    autoSavedGeneralAt,
    autoSavedBoletaAt,
    updateGeneral,
    updateBoleta,
    guardarConfiguracionGeneral,
    guardarConfiguracionBoleta,
    guardarConfiguracionNotificaciones,
    resetearConfiguracion,
    vistaPreviaTicket,
    reenviarJob,
    ENABLE_AUTOSAVE
  }
}
