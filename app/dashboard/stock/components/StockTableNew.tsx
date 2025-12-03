import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StockItem } from "../stock-types"
import { Package, AlertCircle, CheckCircle2, Loader2, Search, TrendingUp } from "lucide-react"
import { clsx } from "clsx"

interface StockTableProps {
  data: StockItem[]
  loading: boolean
}

export function StockTable({ data, loading }: StockTableProps) {
  if (loading) {
    return (
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
            <div className="text-center">
              <p className="font-medium">Cargando inventario</p>
              <p className="text-sm text-muted-foreground">Por favor espere...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground mt-1">Intenta ajustar los filtros de búsqueda</p>
        </CardContent>
      </Card>
    )
  }

  // Calcular estadísticas rápidas
  const totalUnits = data.reduce((acc, item) => acc + item.cantidadUnidades, 0)
  const lowStockCount = data.filter(item => item.cantidadUnidades <= item.cantidadMinima).length

  return (
    <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Mini estadísticas en el header */}
      <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{data.length} productos</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold tabular-nums">{totalUnits.toLocaleString()}</span>
            </div>
            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-muted-foreground">Bajo stock:</span>
                <span className="font-semibold text-amber-600 tabular-nums">{lowStockCount}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Código</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Producto</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Laboratorio</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Categoría</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Stock</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Precio</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Vencimiento</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const isLowStock = item.cantidadUnidades <= item.cantidadMinima
              const stockPercentage = Math.min((item.cantidadUnidades / Math.max(item.cantidadMinima * 3, 1)) * 100, 100)
              
              return (
                <TableRow 
                  key={item.id} 
                  className={clsx(
                    "transition-all duration-200 border-b border-border/30",
                    isLowStock 
                      ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.06]" 
                      : index % 2 === 0 
                        ? "bg-transparent hover:bg-muted/30" 
                        : "bg-muted/10 hover:bg-muted/30"
                  )}
                >
                  <TableCell>
                    <code className="px-2 py-1 bg-muted/50 border border-border/50 rounded text-xs font-mono">
                      {item.codigoStock}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{item.nombre}</span>
                      {item.concentracion && (
                        <span className="text-xs text-muted-foreground">{item.concentracion}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{item.laboratorio || "—"}</span>
                  </TableCell>
                  <TableCell>
                    {item.categoria ? (
                      <Badge variant="secondary" className="font-normal bg-secondary/50 border border-border/50">
                        {item.categoria}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={clsx(
                        "font-bold tabular-nums text-sm",
                        isLowStock ? "text-amber-600 dark:text-amber-500" : "text-foreground"
                      )}>
                        {item.cantidadUnidades.toLocaleString()}
                      </span>
                      <Progress 
                        value={stockPercentage} 
                        className={clsx(
                          "h-1 w-16",
                          isLowStock 
                            ? "[&>div]:bg-amber-500" 
                            : "[&>div]:bg-primary"
                        )} 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-primary tabular-nums">
                      {typeof item.precioVenta === "number" && Number.isFinite(item.precioVenta)
                        ? `S/ ${Number(item.precioVenta).toFixed(2)}`
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {item.fechaVencimiento || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge className="gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20">
                        <AlertCircle className="h-3 w-3" />
                        Bajo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-primary border-primary/30 bg-primary/5 hover:bg-primary/10">
                        <CheckCircle2 className="h-3 w-3" />
                        OK
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
