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
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
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

      <div className="p-6 pt-4 pb-4 border-b border-border/50 bg-background/50">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar número, cliente, método..."
              className="pl-9 bg-background/60 border-border/50"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
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
          <div className="lg:col-span-3 flex items-center justify-end">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30">
                <Filter className="h-3.5 w-3.5" />
                <span className="font-medium text-foreground">{totalBoletas}</span> total
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30">
                <Hash className="h-3.5 w-3.5" />
                Pág <span className="font-medium text-foreground">{paginaActual}</span>/<span className="font-medium text-foreground">{totalPaginas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
