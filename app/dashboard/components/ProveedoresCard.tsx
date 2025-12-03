"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Building2, Star, TrendingUp } from "lucide-react"
import { type Proveedores } from "./types"

interface ProveedoresCardProps {
  proveedores: Proveedores
  loading?: boolean
}

export function ProveedoresCard({ proveedores, loading }: ProveedoresCardProps) {
  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "transition-all duration-300 hover:shadow-md"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-emerald-500" />
          </div>
          Proveedores
        </CardTitle>
        <CardDescription>Estado de proveedores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className={cn(
            "p-2 rounded-lg text-center",
            "bg-emerald-500/5 border border-emerald-500/10"
          )}>
            <p className="text-lg font-bold text-emerald-500">{proveedores.activos}</p>
            <p className="text-[9px] text-muted-foreground">Activos</p>
          </div>
          <div className={cn(
            "p-2 rounded-lg text-center",
            "bg-blue-500/5 border border-blue-500/10"
          )}>
            <p className="text-lg font-bold text-blue-500">{proveedores.conPedidos30Dias}</p>
            <p className="text-[9px] text-muted-foreground">30 días</p>
          </div>
          <div className={cn(
            "p-2 rounded-lg text-center",
            proveedores.sinPedidos90Dias > 0 
              ? "bg-amber-500/5 border border-amber-500/10" 
              : "bg-muted/20 border border-border/50"
          )}>
            <p className={cn(
              "text-lg font-bold",
              proveedores.sinPedidos90Dias > 0 ? "text-amber-500" : "text-muted-foreground"
            )}>
              {proveedores.sinPedidos90Dias}
            </p>
            <p className="text-[9px] text-muted-foreground">Inactivos</p>
          </div>
        </div>

        {/* Top proveedores */}
        {proveedores.topProveedores.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              Top proveedores
            </p>
            <div className="space-y-1.5">
              {proveedores.topProveedores.slice(0, 4).map((prov, i) => (
                <div 
                  key={prov.proveedorId}
                  className={cn(
                    "group flex items-center gap-3 p-2 rounded-lg",
                    "bg-muted/20 border border-transparent",
                    "transition-all duration-200",
                    "hover:bg-muted/40 hover:border-border/50"
                  )}
                >
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 && "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
                    i === 1 && "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
                    i === 2 && "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
                    i > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{prov.nombre}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {prov.pedidos} pedidos
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
