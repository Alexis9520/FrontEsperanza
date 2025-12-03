import React from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface StockFiltersProps {
  busqueda: string
  setBusqueda: (v: string) => void
  filterLab: string
  setFilterLab: (v: string) => void
  filterCat: string
  setFilterCat: (v: string) => void
  laboratorios: string[]
  categorias: string[]
  total: number
  setPage: (p: number) => void
}

export function StockFilters({
  busqueda, setBusqueda,
  filterLab, setFilterLab,
  filterCat, setFilterCat,
  laboratorios, categorias,
  total,
  setPage
}: StockFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto, código, laboratorio..."
          className="pl-8 w-72"
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPage(1) }}
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select
          className="border rounded h-9 px-2 text-sm bg-background/70 backdrop-blur"
          value={filterLab}
          onChange={e => { setFilterLab(e.target.value); setPage(1) }}
        >
          {laboratorios.map(l => (
            <option key={l} value={l}>{l === "todos" ? "Todos los laboratorios" : l}</option>
          ))}
        </select>
        <select
          className="border rounded h-9 px-2 text-sm bg-background/70 backdrop-blur"
          value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setPage(1) }}
        >
          {categorias.map(c => (
            <option key={c} value={c}>{c === "todos" ? "Todas las categorías" : c}</option>
          ))}
        </select>
      </div>
      <div className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted/50">
        {total} resultados
      </div>
    </div>
  )
}
