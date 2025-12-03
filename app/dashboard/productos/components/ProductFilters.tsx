"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface ProductFiltersProps {
  busqueda: string
  setBusqueda: (val: string) => void
  loading: boolean
  totalElements: number
  pageSize: number
  setPageSize: (val: number) => void
  setPage: (val: number) => void
  startIndex: number
  endIndex: number
}

export function ProductFilters({
  busqueda,
  setBusqueda,
  loading,
  totalElements,
  pageSize,
  setPageSize,
  setPage,
  startIndex,
  endIndex
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-5 md:items-center justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar código, nombre, categoría, laboratorio..."
          className="pl-9 pr-24 bg-background/60 backdrop-blur-sm"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <div className="absolute right-3 top-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
          {loading ? (
            <span className="animate-pulse">Cargando...</span>
          ) : (
            <span>{totalElements}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filas / página</span>
        </div>
        <Select
          value={String(pageSize)}
          onValueChange={v => {
            setPageSize(Number(v))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Tamaño" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 25, 50].map(s => (
              <SelectItem key={s} value={String(s)}>
                {s} / pág
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {startIndex}-{endIndex} de {totalElements}
        </span>
      </div>
    </div>
  )
}
