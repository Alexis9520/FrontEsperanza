"use client"

import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar código, nombre, categoría, laboratorio..."
              className="pl-9 pr-24 bg-background/60 backdrop-blur-sm border-border/50"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <div className="absolute right-3 top-2 flex items-center gap-2 text-xs text-muted-foreground">
              {loading ? (
                <span className="animate-pulse">Cargando...</span>
              ) : (
                <span className="font-medium text-foreground">{totalElements}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filas:</span>
            </div>
            <Select
              value={String(pageSize)}
              onValueChange={v => {
                setPageSize(Number(v))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[80px] h-8 bg-background/60 border-border/50">
                <SelectValue placeholder="Tamaño" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map(s => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {startIndex}-{endIndex} de <span className="font-medium text-foreground">{totalElements}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

