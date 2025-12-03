import { useState, useCallback, useEffect, useMemo } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { LoteRaw, ProductSummary } from "../types"
import { apiUrl } from "@/lib/config"
import { buildSummaries } from "../utils"

export function useStock() {
  const { toast } = useToast()
  const [lotes, setLotes] = useState<LoteRaw[]>([])
  const [loading, setLoading] = useState(false)

  // Filtros (se enviarán al backend)
  const [busqueda, setBusqueda] = useState("")
  const [filterLab, setFilterLab] = useState("todos")
  const [filterCat, setFilterCat] = useState("todos")

  // UI
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [densityCompact, setDensityCompact] = useState(false)

  // Paginación (UI 1-based)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0) // total del backend

  // Carga completa (para filtros y tabs especiales)
  const [allLotes, setAllLotes] = useState<LoteRaw[] | null>(null)
  const [allLoading, setAllLoading] = useState(false)

  // Carga desde backend (PAGINADO)
  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const q = busqueda.trim() ? encodeURIComponent(busqueda.trim()) : ""
      const lab = filterLab !== "todos" ? encodeURIComponent(filterLab) : ""
      const cat = filterCat !== "todos" ? encodeURIComponent(filterCat) : ""
      const params = new URLSearchParams()
      params.set("page", String(page - 1)) // backend 0-based
      params.set("size", String(pageSize))
      if (q) params.set("q", q)
      if (lab) params.set("lab", lab)
      if (cat) params.set("cat", cat)

      const res = await fetchWithAuth(apiUrl(`/api/stock?${params.toString()}`))
      // Esperado: { content: LoteRaw[], total|totalElements, page, size, totalPages }
      const content: LoteRaw[] = Array.isArray(res?.content) ? res.content : []
      const totalElements: number = typeof res?.totalElements === "number"
        ? res.totalElements
        : (typeof res?.total === "number" ? res.total : content.length)

      setLotes(content)
      setTotal(totalElements)
    } catch (e: any) {
      setLotes([])
      setTotal(0)
      toast({
        title: "Error",
        description: "No se pudo cargar el stock",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [busqueda, filterLab, filterCat, page, pageSize, toast])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Cargar todos los lotes (por lotes) para cálculos globales / filtros y tabs
  const cargarTodos = useCallback(async () => {
    try {
      setAllLoading(true)
      const q = busqueda.trim() ? encodeURIComponent(busqueda.trim()) : ""
      const lab = filterLab !== "todos" ? encodeURIComponent(filterLab) : ""
      const cat = filterCat !== "todos" ? encodeURIComponent(filterCat) : ""

      // pedir 1 elemento para conocer total
      const params0 = new URLSearchParams()
      params0.set("page", "0")
      params0.set("size", "1")
      if (q) params0.set("q", q)
      if (lab) params0.set("lab", lab)
      if (cat) params0.set("cat", cat)

      const info = await fetchWithAuth(apiUrl(`/api/stock?${params0.toString()}`))
      const totalElements: number = typeof info?.totalElements === 'number' ? info.totalElements : (typeof info?.total === 'number' ? info.total : (Array.isArray(info?.content) ? info.content.length : 0))

      if (!totalElements) {
        setAllLotes([])
        return
      }

      const lote = 500
      const pages = Math.max(1, Math.ceil(totalElements / lote))
      let all: LoteRaw[] = []
      for (let p = 0; p < pages; p++) {
        const params = new URLSearchParams()
        params.set("page", String(p))
        params.set("size", String(lote))
        if (q) params.set("q", q)
        if (lab) params.set("lab", lab)
        if (cat) params.set("cat", cat)
        const res = await fetchWithAuth(apiUrl(`/api/stock?${params.toString()}`))
        const content: LoteRaw[] = Array.isArray(res?.content) ? res.content : []
        all = all.concat(content)
      }

      setAllLotes(all)
    } catch (err) {
      console.error('Error cargarTodos:', err)
      setAllLotes(null)
    } finally {
      setAllLoading(false)
    }
  }, [busqueda, filterLab, filterCat])

  useEffect(() => {
    // cargar dataset completo para filtros y tabs especiales
    cargarTodos()
  }, [cargarTodos])

  // Resúmenes (sobre la página actual)
  const productosResumen: ProductSummary[] = useMemo(() => buildSummaries(lotes), [lotes])

  // Opciones de filtros: preferimos derivarlas del dataset completo cuando esté disponible
  const allSummaries = useMemo(() => allLotes ? buildSummaries(allLotes) : null, [allLotes])
  const laboratorios = useMemo(() => {
    const source = allSummaries ?? productosResumen
    return ["todos", ...Array.from(new Set(source.map(p => p.laboratorio).filter(Boolean)))]
  }, [allSummaries, productosResumen])
  const categorias = useMemo(() => {
    const source = allSummaries ?? productosResumen
    return ["todos", ...Array.from(new Set(source.map(p => p.categoria).filter(Boolean)))]
  }, [allSummaries, productosResumen])

  // Derivados Tabs: preferimos usar el dataset completo (allSummaries) si está disponible,
  // y aplicamos paginación en el front para cada tab.
  const sourceForTabs = allSummaries ?? productosResumen

  const criticosFull = useMemo(() => sourceForTabs.filter(p => p.cantidadGeneral <= p.cantidadMinima), [sourceForTabs])
  const proximosFull = useMemo(() => sourceForTabs.filter(p => {
    const d = p.diasHastaPrimerVencimiento
    return d !== null && d > 0 && d <= 30
  }), [sourceForTabs])
  const vencidosFull = useMemo(() => sourceForTabs.filter(p => p.unidadesVencidas > 0), [sourceForTabs])
  const riesgoFull = useMemo(() => sourceForTabs.filter(p => p.porcentajeEnRiesgo > 0).sort((a, b) => b.porcentajeEnRiesgo - a.porcentajeEnRiesgo), [sourceForTabs])

  /* ---------------- KPIs (sobre la página actual) ---------------- */
  const kpis = useMemo(() => {
    const totalProductos = productosResumen.length
    const productosCriticos = productosResumen.filter(p => p.cantidadGeneral <= p.cantidadMinima).length
    const productosConVencimiento30d = productosResumen.filter(p =>
      p.diasHastaPrimerVencimiento !== null &&
      p.diasHastaPrimerVencimiento > 0 &&
      p.diasHastaPrimerVencimiento <= 30
    ).length
    const productosVencidos = productosResumen.filter(p => p.unidadesVencidas > 0).length
    const valorInventarioCosto = productosResumen.reduce((s, p) => s + p.costoTotal, 0)
    const valorInventarioVenta = productosResumen.reduce((s, p) => s + p.valorVentaTeorico, 0)
    const margenPotencialTotal = valorInventarioVenta - valorInventarioCosto
    const totalUnidades = productosResumen.reduce((s, p) => s + p.cantidadGeneral, 0)
    const totalRiesgoUnits = productosResumen.reduce((s, p) => s + (p.unidadesRiesgo30d + p.unidadesVencidas), 0)
    const porcentajeStockEnRiesgo = totalUnidades > 0 ? (totalRiesgoUnits / totalUnidades) * 100 : 0

    return {
      totalProductos,
      productosCriticos,
      productosConVencimiento30d,
      productosVencidos,
      valorInventarioCosto,
      valorInventarioVenta,
      margenPotencialTotal,
      porcentajeStockEnRiesgo
    }
  }, [productosResumen])

  function toggleExpand(codigo: string) {
    setExpanded(prev => ({ ...prev, [codigo]: !prev[codigo] }))
  }

  return {
    lotes,
    loading,
    busqueda, setBusqueda,
    filterLab, setFilterLab,
    filterCat, setFilterCat,
    expanded, toggleExpand,
    densityCompact, setDensityCompact,
    page, setPage,
    pageSize, setPageSize,
    total,
    allLotes,
    allLoading,
    cargar,
    productosResumen,
    laboratorios,
    categorias,
    criticosFull,
    proximosFull,
    vencidosFull,
    riesgoFull,
    kpis
  }
}
