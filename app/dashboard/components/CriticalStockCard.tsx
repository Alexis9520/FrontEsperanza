"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle, ChevronLeft, ChevronRight, Package } from "lucide-react"
import { type ProductoCritico } from "./types"
import { useState, useMemo } from "react"

interface CriticalStockCardProps {
  productos: ProductoCritico[]
  loading?: boolean
}

const PAGE_SIZE = 5

export function CriticalStockCard({ productos, loading }: CriticalStockCardProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(productos.length / PAGE_SIZE))
  
  const pageItems = useMemo(
    () => productos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [productos, page]
  )

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-red-500/20">
        <CardHeader className="pb-3">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
          <div className="h-3 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-5 w-12 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "border-red-500/20 bg-red-500/[0.02]",
      "transition-all duration-300 hover:shadow-md hover:shadow-red-500/5"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          Stock Crítico
          {productos.length > 0 && (
            <Badge variant="destructive" className="ml-auto text-[10px] px-1.5">
              {productos.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Productos bajo mínimo</CardDescription>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Sin productos críticos</p>
            <p className="text-xs text-emerald-500">¡Todo en orden!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map((producto, i) => (
              <div 
                key={i}
                className={cn(
                  "group flex items-center justify-between p-2.5 rounded-lg",
                  "bg-red-500/5 border border-red-500/10",
                  "transition-all duration-200",
                  "hover:bg-red-500/10 hover:border-red-500/20"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="text-sm truncate">{producto.nombre}</span>
                </div>
                <Badge 
                  variant="destructive" 
                  className="text-[10px] font-mono shrink-0"
                >
                  {producto.stock} u
                </Badge>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, productos.length)} de {productos.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
