"use client"

import React, { useEffect, useState, useMemo } from "react"
import { ChevronDown, ChevronRight, Download, Search, Filter, CheckSquare, Square, FileText } from "lucide-react"
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
  const [exporting, setExporting] = useState(false) // Nuevo estado para carga de exportación

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

  // --- LÓGICA DE GENERACIÓN DE PDF REUTILIZABLE ---
  const createPdf = (productsToPrint: ProductDTO[], filename: string) => {
    const doc = new jsPDF() 

    // PREPARACIÓN DE DATOS APLANADOS
    // Convertimos la jerarquía Producto -> Lotes en filas planas para la tabla
    const tableBody: any[] = []
    let rowNumber = 1

    productsToPrint.forEach((producto) => {
      if (producto.stocks && producto.stocks.length > 0) {
        producto.stocks.forEach((stock) => {
          tableBody.push([
            rowNumber++,
            producto.nombre,
            producto.laboratorio || "",
            dateIso(stock.fechaVencimiento),
            stock.codigoStock || "S/N",
            stock.cantidadUnidades?.toString() || "0",
            "", "", "" 
          ])
        })
      } else {
        tableBody.push([
          rowNumber++,
          producto.nombre,
          producto.laboratorio || "",
          "—", "—",
          producto.cantidadGeneral?.toString() || "0",
          "", "", ""
        ])
      }
    })

    autoTable(doc, {
      startY: 35,
      head: [[
        "Nº", "DESCRIPCIÓN DEL PRODUCTO", "LAB.", "VENC.", "LOTE", 
        "STOCK\nSIST.", "STOCK\nFÍSICO", "DIF.", "OBS."
      ]],
      body: tableBody,
      theme: 'grid',
      margin: { top: 35, bottom: 55, left: 10, right: 10 }, 
      styles: { 
        fontSize: 7, 
        cellPadding: 1.5,
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },  
        1: { cellWidth: 'auto' },              
        2: { cellWidth: 20 },                  
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 12 },
        6: { cellWidth: 12 },                  
        7: { cellWidth: 12 },                  
        8: { cellWidth: 20 }                   
      },
      
      // --- Para limitar a 30 filas por página, dividimos manualmente el cuerpo de la tabla ---
      // autoTable no soporta didParseRow, así que dividimos el cuerpo en páginas de 30 filas

      // --- CABECERA Y PIE DE PÁGINA ---
      didDrawPage: (data) => {
        const pageWidth = doc.internal.pageSize.width
        const pageHeight = doc.internal.pageSize.height
        
        // Cabecera
        doc.setFontSize(8)
        doc.text("", 10, 10)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("REGISTRO DE INVENTARIO DE PRODUCTOS", pageWidth / 2, 15, { align: "center" })
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text("Tipo: General [ ]   Parcial [ X ]", 10, 25)
        doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, pageWidth - 10, 25, { align: "right" })

        // Pie de página
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

  // Opción 1: Generar reporte solo de lo seleccionado manualmente
  const handleGenerateSelected = () => {
    if (!data || selected.size === 0) return
    const selectedProducts = data.content.filter(p => selected.has(p.id))
    createPdf(selectedProducts, `inventario_seleccion_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Opción 2: Exportar TODO lo que coincida con los filtros (sin límites de paginación)
  const handleExportAll = async () => {
    setExporting(true)
    try {
      // Pedimos una página gigante para simular "sin límites"
      // Usamos los mismos params (filtros) pero forzamos page 0 y size grande
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

  // Listas para filtros
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
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 border rounded px-2 py-1 dark:border-slate-700">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              className="bg-transparent outline-none text-sm w-40 lg:w-64"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => { setPage(0); setSearch(e.target.value) }}
            />
          </div>
          {/* Selects de categoría, lab, tipo... (Igual que antes) */}
          <div className="flex items-center gap-2 border rounded px-2 py-1 dark:border-slate-700">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm max-w-[120px]"
              value={categoria}
              onChange={(e) => { setPage(0); setCategoria(e.target.value) }}
            >
              <option value="">Categoría</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 border rounded px-2 py-1 dark:border-slate-700">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm max-w-[120px]"
              value={laboratorio}
              onChange={(e) => { setPage(0); setLaboratorio(e.target.value) }}
            >
              <option value="">Laboratorio</option>
              {uniqueLaboratorios.map(lab => <option key={lab} value={lab}>{lab}</option>)}
            </select>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2">
           {/* Botón Exportar Selección Actual */}
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleGenerateSelected}
            disabled={selected.size === 0 || exporting}
          >
            <CheckSquare className="w-4 h-4 mr-1" /> 
            Reporte Selección ({selected.size})
          </Button>

          {/* Botón Exportar TODO (Sin límites) */}
          <Button 
            size="sm" 
            variant="default" // Destacado
            onClick={handleExportAll}
            disabled={loading || exporting || !data || data.totalElements === 0}
          >
            {exporting ? (
               <span className="animate-spin mr-2">⏳</span>
            ) : (
               <FileText className="w-4 h-4 mr-1" /> 
            )}
            Exportar Todo (PDF)
          </Button>
        </div>
      </div>

      {/* Tabla y Paginación (Sin cambios mayores en la UI visual) */}
      {loading && !exporting ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : !data || data.content.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No hay productos</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">
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
                    <th className="px-4 py-3 w-8"></th>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="px-4 py-3 text-left font-medium">Nombre</th>
                    <th className="px-4 py-3 text-left font-medium">Categoría</th>
                    <th className="px-4 py-3 text-left font-medium">Laboratorio</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-right font-medium">Stock</th>
                    <th className="px-4 py-3 text-right font-medium">P. Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((product) => (
                    <React.Fragment key={product.id}>
                      <tr className="border-t border-slate-200 dark:border-slate-700 hover:bg-muted/30 dark:hover:bg-slate-700 transition-colors">
                        <td className="px-4 py-3">
                          <button onClick={() => toggleSelect(product.id)}>
                            {selected.has(product.id) ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {product.stocks && product.stocks.length > 0 && (
                            <button onClick={() => toggleExpand(product.id)}>
                              {expanded[product.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.codigoBarras || "—"}</td>
                        <td className="px-4 py-3 font-medium">{product.nombre}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.categoria || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{product.laboratorio || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                            product.tipoMedicamento === "GENÉRICO" 
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          )}>
                            {product.tipoMedicamento || "OTRO"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{product.cantidadGeneral ?? 0}</td>
                        <td className="px-4 py-3 text-right font-mono">{money(product.precioVentaUnd)}</td>
                      </tr>
                      
                      {/* Fila expandida para Lotes */}
                      {expanded[product.id] && product.stocks && product.stocks.length > 0 && (
                        <tr>
                          <td colSpan={9} className="px-4 py-2 bg-muted/10 dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700">
                            <div className="pl-10 pr-4 py-2">
                              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Detalle de Lotes</div>
                              <div className="grid gap-2">
                                {product.stocks.map((stock, idx) => (
                                  <div key={idx} className="grid grid-cols-4 gap-4 text-xs bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground">Lote</span>
                                      <span className="font-mono">{stock.codigoStock || "S/N"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground">Vencimiento</span>
                                      <span className={cn(
                                        new Date(stock.fechaVencimiento!) < new Date() ? "text-red-600 font-bold" : ""
                                      )}>
                                        {dateIso(stock.fechaVencimiento)}
                                      </span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground">Cantidad</span>
                                      <span>{stock.cantidadUnidades} und.</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                      <span className="text-muted-foreground">P. Compra</span>
                                      <span>{money(stock.precioCompra)}</span>
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
          <div className="flex items-center justify-between text-sm pt-2">
            <div className="text-muted-foreground">
              Mostrando {data.content.length} de {data.totalElements} productos
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