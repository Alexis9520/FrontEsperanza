import { Search, X, Filter, Hash, ArrowDownUp, Columns, Download, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Rango } from "../types"

interface VentasFiltersProps {
  busqueda: string
  setBusqueda: (val: string) => void
  rango: Rango
  setRango: (val: Rango) => void
  ordenDesc: boolean
  setOrdenDesc: (val: boolean | ((prev: boolean) => boolean)) => void
  compactas: boolean
  setCompactas: (val: boolean | ((prev: boolean) => boolean)) => void
  totalBoletas: number
  paginaActual: number
  totalPaginas: number
  onExportCSV: () => void
  onExportPDF: () => void
}

export function VentasFilters({
  busqueda,
  setBusqueda,
  rango,
  setRango,
  ordenDesc,
  setOrdenDesc,
  compactas,
  setCompactas,
  totalBoletas,
  paginaActual,
  totalPaginas,
  onExportCSV,
  onExportPDF
}: VentasFiltersProps) {
  return (
    <>
      <CardHeader className="pb-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Listado de Boletas
            </CardTitle>
            <CardDescription>
              Busca, filtra, ordena y exporta tus boletas
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrdenDesc(o => !o)}
              className="gap-2"
              title="Cambiar orden"
            >
              <ArrowDownUp className="h-4 w-4" />
              {ordenDesc ? "Recientes" : "Antiguas"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompactas(c => !c)}
              className="gap-2"
            >
              <Columns className="h-4 w-4" />
              {compactas ? "Full" : "Compacto"}
            </Button>
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-12 px-6">
        <div className="lg:col-span-5 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar número, cliente, método..."
            className="pl-8"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            autoFocus
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="lg:col-span-4 flex items-center">
          <DateRangePicker
            value={
              rango.from && rango.to
                ? {
                    from: rango.from,
                    to: rango.to
                  }
                : rango.from
                ? {
                    from: rango.from,
                    to: rango.from
                  }
                : undefined
            }
            onChange={range => {
              if (range?.from && !range?.to) {
                setRango({
                  from: range.from,
                  to: range.from
                })
              } else {
                setRango({
                  from: range?.from,
                  to: range?.to
                })
              }
            }}
            className="w-full"
          />
        </div>
        <div className="lg:col-span-3 flex gap-3 items-center">
          <div className="ml-auto text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> {totalBoletas} total
            </div>
            <div className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" /> Pag {paginaActual}/{totalPaginas}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
