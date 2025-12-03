"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react"
import { type ProductoVencimiento } from "./types"
import { useState, useMemo } from "react"

interface ExpiringProductsCardProps {
  productos: ProductoVencimiento[]
  loading?: boolean
}

const PAGE_SIZE = 4

function getSeverity(dias: number): { variant: "destructive" | "secondary" | "outline"; label: string; color: string } {
  if (dias <= 0) return { variant: "destructive", label: "Vencido", color: "text-red-500" }
  if (dias <= 7) return { variant: "destructive", label: `${dias}d`, color: "text-red-500" }
  if (dias <= 15) return { variant: "secondary", label: `${dias}d`, color: "text-amber-500" }
  return { variant: "outline", label: `${dias}d`, color: "text-muted-foreground" }
}

export function ExpiringProductsCard({ productos, loading }: ExpiringProductsCardProps) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(productos.length / PAGE_SIZE))
  
  const pageItems = useMemo(
    () => productos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [productos, page]
  )

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm border-amber-500/20">
        <CardHeader className="pb-3">
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-36 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 animate-pulse">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "border-amber-500/20 bg-amber-500/[0.02]",
      "transition-all duration-300 hover:shadow-md hover:shadow-amber-500/5"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          Próximos a Vencer
          {productos.length > 0 && (
            <Badge className="ml-auto text-[10px] px-1.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-0">
              {productos.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Lotes en ventana de riesgo</CardDescription>
      </CardHeader>
      <CardContent>
        {productos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground">Sin vencimientos próximos</p>
            <p className="text-xs text-emerald-500">¡Todo en orden!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map((producto, i) => {
              const severity = getSeverity(producto.dias)
              
              return (
                <div 
                  key={i}
                  className={cn(
                    "group flex items-center justify-between p-2.5 rounded-lg",
                    "bg-muted/20 border border-transparent",
                    "transition-all duration-200",
                    "hover:bg-muted/40 hover:border-border/50"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className={cn("h-4 w-4 shrink-0", severity.color)} />
                    <span className="text-sm truncate">{producto.nombre}</span>
                  </div>
                  <Badge 
                    variant={severity.variant}
                    className="text-[10px] font-mono shrink-0"
                  >
                    {severity.label}
                  </Badge>
                </div>
              )
            })}

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
