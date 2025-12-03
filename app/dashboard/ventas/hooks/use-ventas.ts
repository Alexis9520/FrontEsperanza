import { useState, useEffect, useRef, useCallback } from "react"
import { getBoletasPage, getBoletaById } from "@/lib/api"
import type { BoletaDTO, VentaItem } from "@/lib/api"
import { Boleta, Rango } from "../types"
import { downloadCSV, exportarBoletasPDF, formatFechaHora, safeTime } from "../lib/utils"

export function useVentas() {
  const [boletas, setBoletas] = useState<Boleta[]>([])
  const [totalBoletas, setTotalBoletas] = useState(0)
  const [loading, setLoading] = useState(false)

  // paginación UI (1-based)
  const [paginaActual, setPaginaActual] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(10)

  const [boletaExpandida, setBoletaExpandida] = useState<number | null>(null)
  const [busquedaBoletas, setBusquedaBoletas] = useState("")
  const [rangoFechasBoletas, setRangoFechasBoletas] = useState<Rango>({
    from: undefined,
    to: undefined
  })
  const [ordenDesc, setOrdenDesc] = useState(true)
  const [columnasCompactas, setColumnasCompactas] = useState(false)
  const [autoRefrescar, setAutoRefrescar] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const fetchBoletas = useCallback(async () => {
    setLoading(true)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const from = rangoFechasBoletas.from
        ? rangoFechasBoletas.from.toISOString().slice(0, 10)
        : undefined
      const to = rangoFechasBoletas.to
        ? rangoFechasBoletas.to.toISOString().slice(0, 10)
        : undefined

      // Backend es 0-based + "size"
      const data = await getBoletasPage({
        page: paginaActual - 1,
        size: tamanoPagina,
        search: busquedaBoletas,
        from,
        to
      })

      const rows = Array.isArray(data?.content) ? data.content : []
      const adaptadas: Boleta[] = rows.map((b: any) => ({
        id: b.id,
        numero: b.numero ?? b.boleta ?? "",
        fecha: b.fecha ?? b.fecha_venta ?? "",
        cliente: b.cliente ?? b.nombre_cliente ?? "",
        metodoPago: b.metodoPago ?? b.metodo_pago ?? "",
        total: b.total ?? b.total_compra ?? b.totalCompra ?? "",
        totalCompra: b.totalCompra ?? b.total_compra ?? b.total ?? "",
        vuelto: b.vuelto ?? "",
        usuario: b.usuario ?? b.usuario_nombre ?? "",
        // Listado general no trae productos; se cargarán bajo demanda
        productos: b.productos ?? []
      }))

      adaptadas.sort((a, b) => {
        const A = safeTime(a.fecha)
        const B = safeTime(b.fecha)
        return ordenDesc ? B - A : A - B
      })

      setBoletas(adaptadas)
      setTotalBoletas(typeof data.totalElements === "number" ? data.totalElements : adaptadas.length)
    } catch {
      setBoletas([])
      setTotalBoletas(0)
    } finally {
      setLoading(false)
    }
  }, [paginaActual, tamanoPagina, busquedaBoletas, rangoFechasBoletas, ordenDesc])

  // Auto refresh
  useEffect(() => {
    if (!autoRefrescar) return
    const id = setInterval(() => {
      fetchBoletas()
    }, 60000)
    return () => clearInterval(id)
  }, [autoRefrescar, fetchBoletas])

  // Cambios de filtros → vuelve a página 1
  useEffect(() => {
    setPaginaActual(1)
  }, [busquedaBoletas, rangoFechasBoletas, tamanoPagina])

  useEffect(() => {
    fetchBoletas()
  }, [fetchBoletas])

  const exportarBoletasCSV = () => {
    const rows: string[][] = [
      [
        "Número",
        "Fecha",
        "Cliente",
        "Método",
        "Total Compra",
        "Vuelto",
        "Usuario"
      ],
      ...boletas.map(b => [
        String(b.numero),
        formatFechaHora(b.fecha),
        String(b.cliente || ""),
        String(b.metodoPago || ""),
        String(b.totalCompra ?? b.total ?? ""),
        String(b.vuelto ?? ""),
        String(b.usuario ?? "")
      ])
    ]
    downloadCSV("boletas.csv", rows)
  }

  const onToggleExpand = async (b: Boleta) => {
    const expandida = boletaExpandida === b.id
    if (expandida) {
      setBoletaExpandida(null)
      return
    }
    setBoletaExpandida(b.id)
    // Lazy-load de productos si están vacíos
    if (!b.productos || b.productos.length === 0) {
      try {
        const full = (await getBoletaById(b.id)) as BoletaDTO
        // Some backends return products under `productos`, others under `detalles`.
        const rawDetails: unknown = (full as any).productos ?? (full as any).detalles ?? []
        const detailsArr: unknown[] = Array.isArray(rawDetails) ? (rawDetails as unknown[]) : []
        const detalles: VentaItem[] = detailsArr.map(p => {
          const obj: any = p || {}
          return {
            id: typeof obj.id === "number" ? obj.id : obj.id ? Number(obj.id) : undefined,
            codBarras: obj.codBarras ?? obj.codigoBarras ?? "",
            nombre: obj.nombre ?? "",
            cantidad: Number(obj.cantidad ?? 0),
            precio: Number(obj.precio ?? obj.precioUnitario ?? 0)
          }
        })

        setBoletas(prev =>
          prev.map(x =>
            x.id === b.id
              ? {
                  ...x,
                  productos: detalles,
                  totalCompra: (full as any).totalCompra ?? x.totalCompra,
                  vuelto: (full as any).vuelto ?? x.vuelto
                }
              : x
          )
        )
      } catch {
        // Ignorar errores puntuales de carga de detalles
      }
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(totalBoletas / tamanoPagina))

  return {
    boletas,
    totalBoletas,
    loading,
    paginaActual,
    setPaginaActual,
    tamanoPagina,
    setTamanoPagina,
    boletaExpandida,
    setBoletaExpandida,
    busquedaBoletas,
    setBusquedaBoletas,
    rangoFechasBoletas,
    setRangoFechasBoletas,
    ordenDesc,
    setOrdenDesc,
    columnasCompactas,
    setColumnasCompactas,
    autoRefrescar,
    setAutoRefrescar,
    fetchBoletas,
    exportarBoletasCSV,
    exportarBoletasPDF: () => exportarBoletasPDF(boletas),
    onToggleExpand,
    totalPaginas
  }
}
