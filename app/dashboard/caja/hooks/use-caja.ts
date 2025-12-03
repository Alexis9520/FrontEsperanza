import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { apiUrl } from "@/lib/config"
import { CajaResumen, HistorialCaja, Movimiento, Usuario } from "@/app/dashboard/caja/components/types"

async function fetchWithToken(url: string, options: RequestInit = {}): Promise<any> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("token")
  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json"
  }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 204) return null
  const ct = res.headers.get("content-type")
  if (ct && ct.includes("application/json")) return res.json()
  const txt = await res.text()
  return txt || null
}

export function useCaja() {
  const { toast } = useToast()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [resumen, setResumen] = useState<CajaResumen | null>(null)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [historial, setHistorial] = useState<HistorialCaja[]>([])
  const [historialPage, setHistorialPage] = useState(0)
  const [historialPageSize, setHistorialPageSize] = useState(10)
  const [historialTotal, setHistorialTotal] = useState<number | null>(null)
  const [historialLoading, setHistorialLoading] = useState(false)
  const [historialLoadAll, setHistorialLoadAll] = useState(false)
  const [loading, setLoading] = useState(false)

  // Cargar usuario
  useEffect(() => {
    if (typeof window === "undefined") return
    const storedUsuario = localStorage.getItem("usuario")
    if (storedUsuario) {
      try {
        setUsuario(JSON.parse(storedUsuario) as Usuario)
      } catch {
        setUsuario(null)
      }
    }
  }, [])

  const refreshCaja = useCallback(async () => {
    if (!usuario?.dni) return
    setLoading(true)
    try {
      const data = await fetchWithToken(apiUrl(`/api/cajas/actual?dniUsuario=${usuario.dni}`))
      
      if (data) {
        const idCaja = data.id ?? data.idCaja
        const cajaEstaAbierta = !data.fechaCierre
        
        // Helper para mapear movimientos
        const mapMovimientos = (movs: any[]): Movimiento[] => {
          return (movs || []).map((m: any) => ({
            id: m.id,
            fecha: m.fecha,
            tipo: m.tipo,
            descripcion: m.descripcion,
            monto: m.monto,
            usuario: typeof m.usuario === 'string' ? { nombre: m.usuario } : (m.usuario || { nombre: 'Desconocido' })
          }))
        }

        const movimientosMapped = mapMovimientos(data.movimientos)

        // Mapear respuesta del backend a nuestro tipo CajaResumen
        const resumenData: CajaResumen = {
          id: idCaja,
          saldoInicial: data.efectivoInicial ?? 0,
          saldoActual: data.efectivoFinal ?? 0,
          totalIngresos: data.ingresos ?? 0,
          totalEgresos: data.egresos ?? 0,
          ingresosPorVentas: data.efectivoFinal ?? 0,
          otrosIngresos: data.ingresos ?? 0,
          gastosOperativos: data.egresos ?? 0,
          otrosEgresos: 0,
          ingresosYape: data.totalYape ?? 0,
          fechaApertura: data.fechaApertura,
          fechaCierre: data.fechaCierre,
          usuarioResponsable: data.usuarioResponsable,
          movimientos: movimientosMapped
        }

        setResumen(resumenData)
        setMovimientos(movimientosMapped)
        setCajaAbierta(cajaEstaAbierta)
      } else {
        setResumen(null)
        setMovimientos([])
        setCajaAbierta(false)
      }
    } catch (error: any) {
      console.error("Error refreshing caja:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la caja.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [usuario, toast])

  const fetchHistorial = useCallback(async (page = historialPage, size = historialPageSize, loadAll = historialLoadAll) => {
    setHistorialLoading(true)
    try {
      // Si solicitamos todas, omitimos paginación (o pedimos un size grande)
      const qs = loadAll ? `?conMovimientos=true` : `?conMovimientos=true&page=${page}&size=${size}`
      const url = apiUrl(`/api/cajas/historial${qs}`)
      const res = await fetchWithToken(url)

      let content: any[] = []
      let total: number | null = null

      if (Array.isArray(res)) {
        content = res
        total = res.length
      } else if (res && Array.isArray(res.content)) {
        content = res.content
        // intentar leer total desde el wrapper de paginación
        total = (res.totalElements ?? res.total ?? res.totalCount) ?? null
      } else if (res && Array.isArray(res)) {
        content = res
        total = res.length
      }

      const mappedHistorial: HistorialCaja[] = content.map((h: any) => ({
        id: h.id ?? h.idCaja,
        fechaApertura: h.fechaApertura,
        fechaCierre: h.fechaCierre,
        saldoInicial: Number(h.efectivoInicial ?? 0),
        saldoFinalDeclarado: (h.fechaCierre && h.efectivoFinalDeclarado != null) ? Number(h.efectivoFinalDeclarado) : undefined,
        saldoFinalCalculado: (h.fechaCierre && h.efectivoFinal != null) ? Number(h.efectivoFinal) : undefined,
        totalIngresos: Number(h.ingresos ?? 0),
        totalEgresos: Number(h.egresos ?? 0),
        ingresosYape: Number(h.totalYape ?? h.ventasYape ?? 0),
        diferencia: h.diferencia != null ? Number(h.diferencia) : undefined,
        usuario: {
          nombre: h.usuarioResponsable ?? "Desconocido",
          rol: "Vendedor"
        },
        movimientos: (h.movimientos || []).map((m: any) => ({
            id: m.id,
            fecha: m.fecha,
            tipo: m.tipo,
            descripcion: m.descripcion,
            monto: m.monto,
            usuario: typeof m.usuario === 'string' ? { nombre: m.usuario } : (m.usuario || { nombre: 'Desconocido' })
        })),
        observaciones: h.observaciones
      }))

      setHistorial(mappedHistorial)
      setHistorialTotal(total)
    } catch (error: any) {
      console.error("Error fetching historial:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el historial.",
        variant: "destructive"
      })
    } finally {
      setHistorialLoading(false)
    }
  }, [historialPage, historialPageSize, historialLoadAll, toast])

  useEffect(() => {
    if (usuario) {
      refreshCaja()
      // cargar historial con paginación actual (por defecto page 0 tamaño 10)
      fetchHistorial(historialPage, historialPageSize, historialLoadAll)
    }
  }, [usuario, refreshCaja, fetchHistorial])

  const abrirCaja = async (montoInicial: number) => {
    if (!usuario?.dni) return
    try {
      await fetchWithToken(apiUrl("/api/cajas/abrir"), {
        method: "POST",
        body: JSON.stringify({
          dniUsuario: usuario.dni,
          efectivoInicial: montoInicial
        })
      })
      toast({
        title: "Caja Abierta",
        description: `Se ha abierto la caja con S/ ${montoInicial.toFixed(2)}`
      })
      await refreshCaja()
      await fetchHistorial()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo abrir la caja.",
        variant: "destructive"
      })
      throw error
    }
  }

  const cerrarCaja = async (montoFinal: number, observaciones: string) => {
    if (!usuario?.dni) return
    try {
      await fetchWithToken(apiUrl("/api/cajas/cerrar"), {
        method: "POST",
        body: JSON.stringify({
          dniUsuario: usuario.dni,
          efectivoFinalDeclarado: montoFinal,
          observaciones // Si el backend lo soporta
        })
      })
      toast({
        title: "Caja Cerrada",
        description: "La caja se ha cerrado correctamente."
      })
      await refreshCaja()
      await fetchHistorial()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cerrar la caja.",
        variant: "destructive"
      })
      throw error
    }
  }

  const registrarMovimiento = async (tipo: "INGRESO" | "EGRESO", monto: number, descripcion: string) => {
    if (!usuario?.dni) return
    try {
      // El backend espera "Ingreso" o "Egreso" (Title Case)
      const tipoBackend = tipo === "INGRESO" ? "Ingreso" : "Egreso"
      
      await fetchWithToken(apiUrl("/api/cajas/movimiento"), {
        method: "POST",
        body: JSON.stringify({
          tipo: tipoBackend,
          monto,
          descripcion,
          dniUsuario: usuario.dni
        })
      })
      toast({
        title: "Movimiento Registrado",
        description: `${tipo === "INGRESO" ? "Ingreso" : "Egreso"} de S/ ${monto.toFixed(2)} registrado.`
      })
      await refreshCaja()
      await fetchHistorial(historialPage, historialPageSize, historialLoadAll)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el movimiento.",
        variant: "destructive"
      })
      throw error
    }
  }

  const setHistorialPageAndFetch = async (page: number) => {
    setHistorialPage(page)
    await fetchHistorial(page, historialPageSize, historialLoadAll)
  }

  const setHistorialPageSizeAndFetch = async (size: number) => {
    setHistorialPageSize(size)
    setHistorialPage(0)
    await fetchHistorial(0, size, historialLoadAll)
  }

  const toggleHistorialLoadAll = async (loadAll: boolean) => {
    setHistorialLoadAll(loadAll)
    // when toggling, reset to first page
    setHistorialPage(0)
    await fetchHistorial(0, historialPageSize, loadAll)
  }

  return {
    usuario,
    cajaAbierta,
    resumen,
    movimientos,
    historial,
    loading,
    historialLoading,
    historialPage,
    historialPageSize,
    historialTotal,
    historialLoadAll,
    setHistorialPage: setHistorialPageAndFetch,
    setHistorialPageSize: setHistorialPageSizeAndFetch,
    toggleHistorialLoadAll: toggleHistorialLoadAll,
    abrirCaja,
    cerrarCaja,
    registrarMovimiento,
    refreshCaja,
    fetchHistorial
  }
}
