"use client"

import { CalendarClock, AlignLeft, User2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatFechaDDMM } from "./lib/utils"
import { useVentas } from "./hooks/use-ventas"
import { VentasHeader } from "./components/VentasHeader"
import { VentasFilters } from "./components/VentasFilters"
import { BoletasTable } from "./components/BoletasTable"
import { PaginationControls } from "./components/PaginationControls"

export default function VentasPage() {
  const {
    boletas,
    totalBoletas,
    loading,
    paginaActual,
    setPaginaActual,
    tamanoPagina,
    setTamanoPagina,
    boletaExpandida,
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
    exportarBoletasCSV,
    exportarBoletasPDF,
    onToggleExpand,
    totalPaginas
  } = useVentas()

  return (
    <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
      {/* Fondo estandarizado - igual a Caja/Stock */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
      </div>

      <VentasHeader
        autoRefrescar={autoRefrescar}
        setAutoRefrescar={setAutoRefrescar}
      />

      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <VentasFilters
          busqueda={busquedaBoletas}
          setBusqueda={setBusquedaBoletas}
          rango={rangoFechasBoletas}
          setRango={setRangoFechasBoletas}
          ordenDesc={ordenDesc}
          setOrdenDesc={setOrdenDesc}
          compactas={columnasCompactas}
          setCompactas={setColumnasCompactas}
          totalBoletas={totalBoletas}
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onExportCSV={exportarBoletasCSV}
          onExportPDF={exportarBoletasPDF}
        />

        <CardContent className="space-y-6">
          {/* Paginación superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Rango:{" "}
                {rangoFechasBoletas.from
                  ? `${formatFechaDDMM(rangoFechasBoletas.from)}${rangoFechasBoletas.to &&
                    rangoFechasBoletas.to.getTime() !==
                    rangoFechasBoletas.from.getTime()
                    ? " → " + formatFechaDDMM(rangoFechasBoletas.to)
                    : ""
                  }`
                  : "Todos"}
              </span>
              {busquedaBoletas && (
                <span className="flex items-center gap-1">
                  <AlignLeft className="h-3.5 w-3.5" /> Búsqueda: "
                  {busquedaBoletas.slice(0, 24)}
                  {busquedaBoletas.length > 24 && "..."}"
                </span>
              )}
              <span className="flex items-center gap-1">
                <User2 className="h-3.5 w-3.5" /> Exp:{" "}
                {boletaExpandida ? "#" + boletaExpandida : "Ninguna"}
              </span>
            </div>
            <PaginationControls
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              tamanoPagina={tamanoPagina}
              setPaginaActual={setPaginaActual}
              setTamanoPagina={v => {
                setTamanoPagina(v)
                setPaginaActual(1)
              }}
            />
          </div>

          <BoletasTable
            boletas={boletas}
            loading={loading}
            compactas={columnasCompactas}
            boletaExpandida={boletaExpandida}
            onToggleExpand={onToggleExpand}
          />

          {/* Paginación inferior */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
              <span>
                Mostrando{" "}
                <b className="text-foreground">{boletas.length}</b> de{" "}
                <b className="text-foreground">{totalBoletas}</b> boletas
              </span>
              <span>
                Página <b className="text-foreground">{paginaActual}</b> /{" "}
                <b className="text-foreground">{totalPaginas}</b>
              </span>
            </div>
            <PaginationControls
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              tamanoPagina={tamanoPagina}
              setPaginaActual={setPaginaActual}
              setTamanoPagina={v => {
                setTamanoPagina(v)
                setPaginaActual(1)
              }}
              variant="secondary"
              showSizeSelector
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
