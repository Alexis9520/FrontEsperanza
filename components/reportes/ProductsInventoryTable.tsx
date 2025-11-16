"use client"

import React, { useEffect, useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Download, Search, Filter, CheckSquare, Square } from "lucide-react"
import { getProducts, type ProductDTO, type PageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const PEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 })
function money(n?: number | null) { return typeof n === "number" ? PEN.format(n) : "—" }
function dateIso(d?: string | null) { 
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("es-PE")
  } catch {
    return "—"
  }
}

export function ProductsInventoryTable() {
  const [search, setSearch] = useState("")
  const [categoria, setCategoria] = useState("")
  const [laboratorio, setLaboratorio] = useState("")
  const [tipoMedicamento, setTipoMedicamento] = useState("")

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)

  const [data, setData] = useState<PageResponse<ProductDTO> | null>(null)
  const [loading, setLoading] = useState(false)

  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const params = useMemo(() => ({
    search: search.trim() || undefined,
    categoria: categoria.trim() || undefined,
    laboratorio: laboratorio.trim() || undefined,
    tipoMedicamento: tipoMedicamento.trim() || undefined,
    page,
    size
  }), [search, categoria, laboratorio, tipoMedicamento, page, size])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const res = await getProducts(params)
        if (!mounted) return
        setData(res)
      } catch (e) {
        console.error("Error cargando productos", e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [params])

  const toggleExpand = (productId: number) => {
    setExpanded(prev => ({ ...prev, [productId]: !prev[productId] }))
  }

  const toggleSelect = (productId: number) => {
    setSelected(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (!data || !data.content) return
    
    const allIds = data.content.map(p => p.id)
    const allSelected = allIds.every(id => selected.has(id))
    
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(allIds))
    }
  }

  const generateReport = () => {
    if (!data || selected.size === 0) return
    
    const selectedProducts = data.content.filter(p => selected.has(p.id))
    
    const doc = new jsPDF()
    
    doc.setFontSize(16)
    doc.text("Reporte de Inventario de Productos", 14, 15)
    
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, 14, 22)
    doc.text(`Total de productos: ${selectedProducts.length}`, 14, 27)
    
    const tableData = selectedProducts.map(p => [
      p.codigoBarras || "—",
      p.nombre || "—",
      p.categoria || "—",
      p.laboratorio || "—",
      p.cantidadGeneral?.toString() || "0",
      money(p.precioVentaUnd),
      p.stocks?.length?.toString() || "0"
    ])
    
    autoTable(doc, {
      startY: 32,
      head: [["Código", "Nombre", "Categoría", "Laboratorio", "Stock", "Precio", "Lotes"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    doc.save(`inventario_productos_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const totalPages = data ? data.totalPages : 0
  const allCurrentSelected = data?.content ? data.content.every(p => selected.has(p.id)) : false

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    if (!data?.content) return []
    const cats = new Set(data.content.map(p => p.categoria).filter((c): c is string => Boolean(c)))
    return Array.from(cats).sort()
  }, [data])

  const uniqueLaboratorios = useMemo(() => {
    if (!data?.content) return []
    const labs = new Set(data.content.map(p => p.laboratorio).filter((l): l is string => Boolean(l)))
    return Array.from(labs).sort()
  }, [data])

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="bg-transparent outline-none text-sm w-64"
              placeholder="Buscar por nombre, código..."
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value) }}
            />
          </div>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm"
              value={categoria}
              onChange={(e) => { setPage(0); setCategoria(e.target.value) }}
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm"
              value={laboratorio}
              onChange={(e) => { setPage(0); setLaboratorio(e.target.value) }}
            >
              <option value="">Todos los laboratorios</option>
              {uniqueLaboratorios.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border rounded px-2 py-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm"
              value={tipoMedicamento}
              onChange={(e) => { setPage(0); setTipoMedicamento(e.target.value) }}
            >
              <option value="">Todos los tipos</option>
              <option value="GENÉRICO">GENÉRICO</option>
              <option value="COMERCIAL">COMERCIAL</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={generateReport}
            disabled={selected.size === 0}
          >
            <Download className="w-4 h-4 mr-1" /> 
            Generar Reporte ({selected.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No hay productos</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button 
                        onClick={toggleSelectAll}
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        {allCurrentSelected && data.content.length > 0 ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left"></th>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="px-4 py-3 text-left font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium">Laboratorio</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium">Stock Total</th>
                    <th className="px-4 py-3 text-right font-medium">Precio Venta</th>
                    <th className="px-4 py-3 text-center font-medium">Lotes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(product.id)}>
                            {selected.has(product.id) ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {product.stocks && product.stocks.length > 0 && (
                            <button
                              onClick={() => toggleExpand(product.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {expanded[product.id] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{product.codigoBarras || "—"}</td>
                        <td className="px-4 py-3 font-medium">{product.nombre}</td>
                        <td className="px-4 py-3">{product.categoria || "—"}</td>
                        <td className="px-4 py-3">{product.laboratorio || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            product.tipoMedicamento === "GENÉRICO" 
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-purple-500/20 text-purple-400"
                          )}>
                            {product.tipoMedicamento || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{product.cantidadGeneral ?? 0}</td>
                        <td className="px-4 py-3 text-right">{money(product.precioVentaUnd)}</td>
                        <td className="px-4 py-3 text-center">{product.stocks?.length || 0}</td>
                      </tr>
                      
                      {expanded[product.id] && product.stocks && product.stocks.length > 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-2 bg-muted/10">
                            <div className="pl-8 pr-4 py-2">
                              <h4 className="text-sm font-medium mb-2">Lotes disponibles:</h4>
                              <div className="space-y-1 text-sm">
                                {product.stocks.map((stock, idx) => (
                                  <div key={idx} className="flex items-center gap-4 py-1 border-l-2 border-muted pl-3">
                                    <span className="font-mono text-xs text-muted-foreground">
                                      {stock.codigoStock || "Sin código"}
                                    </span>
                                    <span>Cantidad: {stock.cantidadUnidades}</span>
                                    <span>Vencimiento: {dateIso(stock.fechaVencimiento)}</span>
                                    <span>Precio compra: {money(stock.precioCompra)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Página {page + 1} de {totalPages} 
              {data.totalElements > 0 && ` (${data.totalElements} productos)`}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
