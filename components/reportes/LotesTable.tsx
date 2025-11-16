"use client"

import React, { useEffect, useState } from "react"
import { Download, Package } from "lucide-react"
import { getLotesReport, type LoteReportDTO } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Spinner from "@/components/ui/Spinner"

const PEN = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 })
function money(n?: number | null) { return typeof n === "number" ? PEN.format(n) : "—" }
function dateIso(d?: string | null) { 
  if (!d) return "—"
  try {
    return format(new Date(d), "dd/MM/yyyy")
  } catch {
    return "—"
  }
}

interface LotesTableProps {
  from: Date;
  to: Date;
}

export function LotesTable({ from, to }: LotesTableProps) {
  const [data, setData] = useState<LoteReportDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const fechaInicio = format(from, "yyyy-MM-dd")
        const fechaFin = format(to, "yyyy-MM-dd")
        const res = await getLotesReport({ fechaInicio, fechaFin })
        if (!mounted) return
        setData(res || [])
      } catch (e) {
        console.error("Error cargando reporte de lotes", e)
        if (mounted) setError("Error al cargar el reporte de lotes")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [from, to])

  const exportToCSV = () => {
    if (!data || data.length === 0) return
    
    const headers = [
      "Código Barras",
      "Producto",
      "Concentración",
      "Presentación",
      "Código Stock",
      "Cantidad Unidades",
      "Cantidad Inicial",
      "Fecha Vencimiento",
      "Precio Compra",
      "Fecha Creación"
    ]
    
    const rows = data.map(item => [
      item.codigoBarras || "",
      item.nombreProducto || "",
      item.concentracion || "",
      item.presentacion || "",
      item.codigoStock || "",
      item.cantidadUnidades?.toString() || "0",
      item.cantidadInicial?.toString() || "0",
      item.fechaVencimiento || "",
      item.precioCompra?.toString() || "0",
      item.fechaCreacion || ""
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `lotes_reporte_${format(from, "yyyy-MM-dd")}_${format(to, "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No hay lotes registrados en el período seleccionado</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {data.length} lote{data.length !== 1 ? "s" : ""}
        </p>
        <Button size="sm" variant="outline" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-1" /> Descargar CSV
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Código Barras</th>
                <th className="px-4 py-3 text-left font-medium">Producto</th>
                <th className="px-4 py-3 text-left font-medium">Concentración</th>
                <th className="px-4 py-3 text-left font-medium">Presentación</th>
                <th className="px-4 py-3 text-left font-medium">Código Stock</th>
                <th className="px-4 py-3 text-right font-medium">Cant. Unidades</th>
                <th className="px-4 py-3 text-right font-medium">Cant. Inicial</th>
                <th className="px-4 py-3 text-left font-medium">F. Vencimiento</th>
                <th className="px-4 py-3 text-right font-medium">Precio Compra</th>
                <th className="px-4 py-3 text-left font-medium">F. Creación</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={`${item.stockId}-${idx}`} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">{item.codigoBarras || "—"}</td>
                  <td className="px-4 py-3 font-medium">{item.nombreProducto || "—"}</td>
                  <td className="px-4 py-3">{item.concentracion || "—"}</td>
                  <td className="px-4 py-3">{item.presentacion || "—"}</td>
                  <td className="px-4 py-3">{item.codigoStock || "—"}</td>
                  <td className="px-4 py-3 text-right">{item.cantidadUnidades ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{item.cantidadInicial ?? "—"}</td>
                  <td className="px-4 py-3">{dateIso(item.fechaVencimiento)}</td>
                  <td className="px-4 py-3 text-right">{money(item.precioCompra)}</td>
                  <td className="px-4 py-3">{dateIso(item.fechaCreacion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
