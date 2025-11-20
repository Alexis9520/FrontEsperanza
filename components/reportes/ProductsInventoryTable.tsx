"use client"

import React, { useEffect, useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Search, Filter, CheckSquare, Square, FileText, Package } from "lucide-react"
import { getProducts, type ProductDTO, type PageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card" // Asumo que tienes estos componentes disponibles
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
  const [exporting, setExporting] = useState(false)

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

  // --- LÓGICA DE GENERACIÓN DE PDF (Misma lógica, sin cambios) ---
  const createPdf = (productsToPrint: ProductDTO[], filename: string) => {
    const doc = new jsPDF() 
    const tableBody: any[] = []
    let rowNumber = 1

    productsToPrint.forEach((producto) => {
      const nonZeroStocks = (producto.stocks || []).filter(s => (s.cantidadUnidades ?? 0) > 0)

      if (nonZeroStocks.length > 0) {
        nonZeroStocks.forEach((stock) => {
          tableBody.push([
            rowNumber++, producto.nombre, producto.laboratorio || "", dateIso(stock.fechaVencimiento),
            stock.codigoStock || "S/N", (stock.cantidadUnidades ?? 0).toString(), "", "", ""
          ])
        })
      } else {
        tableBody.push([
          rowNumber++, producto.nombre, producto.laboratorio || "", "—", "—",
          producto.cantidadGeneral?.toString() || "0", "", "", ""
        ])
      }
    })

    autoTable(doc, {
      startY: 35,
      head: [["Nº", "DESCRIPCIÓN DEL PRODUCTO", "LAB.", "VENC.", "LOTE", "STOCK\nSIST.", "STOCK\nFÍSICO", "DIF.", "OBS."]],
      body: tableBody,
      theme: 'grid',
      margin: { top: 35, bottom: 55, left: 10, right: 10 }, 
      styles: { fontSize: 7, cellPadding: 1.5, valign: 'middle', lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], overflow: 'linebreak' },
      headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', valign: 'middle', fontSize: 7 },
      columnStyles: { 0: { halign: 'center', cellWidth: 8 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 20 }, 3: { halign: 'center', cellWidth: 18 }, 4: { halign: 'center', cellWidth: 18 }, 5: { halign: 'center', cellWidth: 12 }, 6: { cellWidth: 12 }, 7: { cellWidth: 12 }, 8: { cellWidth: 20 } },
      didDrawPage: (data) => {
        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height
        doc.setFontSize(8)
        doc.text("", 10, 10)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("REGISTRO DE INVENTARIO DE PRODUCTOS", pageWidth / 2, 15, { align: "center" })
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text("Tipo: General [ ]   Parcial [ X ]", 10, 25)
        doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, pageWidth - 10, 25, { align: "right" })
        const footerY = pageHeight - 45
        doc.setLineWidth(0.1)
        doc.line(10, footerY - 5, pageWidth - 10, footerY - 5)
        doc.setFontSize(7)
        doc.text("Observaciones:", 10, footerY - 7)
        const yFirmas = footerY + 25
        const anchoFirma = 50
        doc.line(15, yFirmas, 15 + anchoFirma, yFirmas)
        doc.text("RESPONSABLE INVENTARIO", 15 + (anchoFirma/2), yFirmas + 4, { align: "center", maxWidth: anchoFirma })
        const xCentro = (pageWidth / 2) - (anchoFirma / 2)
        doc.line(xCentro, yFirmas, xCentro + anchoFirma, yFirmas)
        doc.text("VºBº D.T. Q.F.", pageWidth / 2, yFirmas + 4, { align: "center" })
        const xDerecha = pageWidth - 15 - anchoFirma
        doc.line(xDerecha, yFirmas, xDerecha + anchoFirma, yFirmas)
        doc.text("PROPIETARIO DEL EEFF", xDerecha + (anchoFirma/2), yFirmas + 4, { align: "center", maxWidth: anchoFirma })
        doc.text(`Pág. ${data.pageNumber}`, pageWidth - 10, pageHeight - 5, { align: "right" })
      }
    })
    doc.save(filename)
  }

  const handleGenerateSelected = () => {
    if (!data || selected.size === 0) return
    const selectedProducts = data.content.filter(p => selected.has(p.id))
    createPdf(selectedProducts, `inventario_seleccion_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const handleExportAll = async () => {
    setExporting(true)
    try {
      const allDataParams = { ...params, page: 0, size: 10000 }
      const res = await getProducts(allDataParams)
      if (res && res.content.length > 0) {
        createPdf(res.content, `inventario_total_${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        alert("No hay datos para exportar con los filtros actuales.")
      }
    } catch (error) {
      console.error("Error al exportar todo", error)
      alert("Error al generar el reporte completo.")
    } finally {
      setExporting(false)
    }
  }

  const totalPages = data ? data.totalPages : 0
  const allCurrentSelected = data?.content ? data.content.every(p => selected.has(p.id)) : false

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
    <Card className="mt-6 border-emerald-500/20 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Gestión de Inventario
            </CardTitle>
            <CardDescription>
              Visualiza el stock, gestiona lotes y exporta reportes de tus productos.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2 items-end">
            {/* Botones de Acción alineados arriba */}
             <Button 
              size="sm" 
              variant="outline" 
              className="h-9 gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
              onClick={handleGenerateSelected}
              disabled={selected.size === 0 || exporting}
            >
              <CheckSquare className="w-4 h-4" /> 
              Reporte Selección ({selected.size})
            </Button>

            <Button 
              size="sm" 
              className="h-9 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleExportAll}
              disabled={loading || exporting || !data || data.totalElements === 0}
            >
              {exporting ? (
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                 <FileText className="w-4 h-4" /> 
              )}
              Exportar Todo
            </Button>
          </div>
        </div>

        {/* Barra de Filtros Integrada */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-500/10">
          <div className="flex items-center gap-2 px-3 py-1 bg-background/50 border border-emerald-500/20 rounded-md w-full md:w-auto focus-within:ring-1 focus-within:ring-emerald-400/50">
            <Search className="w-4 h-4 text-emerald-400" />
            <input
              className="bg-transparent outline-none text-sm w-full md:w-64 placeholder:text-muted-foreground/70"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value) }}
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-background/50 border border-emerald-500/20 rounded-md w-full sm:w-auto">
            <Filter className="w-4 h-4 text-emerald-400" />
            <select
              className="bg-transparent outline-none text-sm w-full sm:w-[140px] text-muted-foreground"
              value={categoria}
              onChange={(e) => { setPage(0); setCategoria(e.target.value) }}
            >
              <option value="">Todas Categorías</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-background/50 border border-emerald-500/20 rounded-md w-full sm:w-auto">
            <Filter className="w-4 h-4 text-emerald-400" />
            <select
              className="bg-transparent outline-none text-sm w-full sm:w-[140px] text-muted-foreground"
              value={laboratorio}
              onChange={(e) => { setPage(0); setLaboratorio(e.target.value) }}
            >
              <option value="">Todos Laboratorios</option>
              {uniqueLaboratorios.map(lab => <option key={lab} value={lab}>{lab}</option>)}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading && !exporting ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
            <p className="text-sm">Cargando inventario...</p>
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
             <Search className="w-10 h-10 opacity-20" />
             <p>No se encontraron productos con los filtros actuales.</p>
          </div>
        ) : (
          <>
            <div className="border border-emerald-500/20 rounded-lg overflow-hidden bg-white dark:bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-500/10">
                    <tr>
                      <th className="px-4 py-3 text-left w-10">
                        <button 
                          onClick={toggleSelectAll}
                          className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        >
                          {allCurrentSelected && data.content.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 w-8"></th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Laboratorio</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">P. Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {data.content.map((product) => (
                      <React.Fragment key={product.id}>
                        <tr className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                          <td className="px-4 py-3">
                            <button onClick={() => toggleSelect(product.id)}>
                              {selected.has(product.id) ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Square className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-colors" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            {product.stocks && product.stocks.length > 0 && (
                              <button onClick={() => toggleExpand(product.id)} className="text-muted-foreground hover:text-emerald-600">
                                {expanded[product.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.codigoBarras || "—"}</td>
                          <td className="px-4 py-3 font-medium text-foreground">{product.nombre}</td>
                          <td className="px-4 py-3 text-muted-foreground">{product.categoria || "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{product.laboratorio || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-sm",
                              product.tipoMedicamento === "GENÉRICO" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                              {product.tipoMedicamento || "OTRO"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-medium">
                            <span className={cn(
                              (product.cantidadGeneral ?? 0) <= 5 ? "text-red-500" : "text-emerald-600"
                            )}>
                              {product.cantidadGeneral ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">{money(product.precioVentaUnd)}</td>
                        </tr>
                        
                        {/* Fila expandida para Lotes */}
                        {expanded[product.id] && product.stocks && product.stocks.length > 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-3 bg-emerald-50/20 dark:bg-emerald-900/5 border-b border-emerald-500/10 shadow-inner">
                              <div className="pl-10 pr-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600/80 mb-3 uppercase tracking-wider">
                                  <Package className="w-3 h-3" /> Detalle de Lotes Activos
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {product.stocks.map((stock, idx) => (
                                    <div key={idx} className="flex flex-col text-xs bg-background p-2.5 rounded border border-emerald-100 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
                                      <div className={`absolute top-0 left-0 w-1 h-full ${new Date(stock.fechaVencimiento!) < new Date() ? 'bg-red-500' : 'bg-emerald-400'}`} />
                                      <div className="flex justify-between mb-1 pl-2">
                                        <span className="text-muted-foreground">Lote:</span>
                                        <span className="font-mono font-medium">{stock.codigoStock || "S/N"}</span>
                                      </div>
                                      <div className="flex justify-between mb-1 pl-2">
                                        <span className="text-muted-foreground">Vence:</span>
                                        <span className={cn(
                                          new Date(stock.fechaVencimiento!) < new Date() ? "text-red-600 font-bold" : ""
                                        )}>
                                          {dateIso(stock.fechaVencimiento)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between mb-1 pl-2">
                                        <span className="text-muted-foreground">Cant:</span>
                                        <span className="font-bold">{stock.cantidadUnidades} und.</span>
                                      </div>
                                      <div className="flex justify-between pl-2 border-t border-dashed border-slate-200 dark:border-slate-700 pt-1 mt-1">
                                        <span className="text-muted-foreground text-[10px]">P. Compra:</span>
                                        <span className="font-mono text-[10px]">{money(stock.precioCompra)}</span>
                                      </div>
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

            {/* Paginación Visual */}
            <div className="flex items-center justify-between text-sm pt-4">
              <div className="text-muted-foreground text-xs">
                Mostrando <span className="font-medium text-emerald-600">{data.content.length}</span> de {data.totalElements} productos
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-emerald-200 hover:bg-emerald-50 text-emerald-700 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronDown className="w-4 h-4 rotate-90 mr-1" /> Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-emerald-200 hover:bg-emerald-50 text-emerald-700 disabled:opacity-50"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente <ChevronDown className="w-4 h-4 -rotate-90 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}