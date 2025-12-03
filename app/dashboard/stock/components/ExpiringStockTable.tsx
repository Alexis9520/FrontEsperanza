import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockItem } from "../stock-types"
import { differenceInDays, parseISO } from "date-fns"
import { AlertTriangle, Calendar, RefreshCcw, Clock, Package, XCircle, Loader2 } from "lucide-react"
import { clsx } from "clsx"

interface ExpiringStockTableProps {
  data: StockItem[]
  loading: boolean
  withinDays: number
  setWithinDays: (days: number) => void
  refresh: () => void
}

export function ExpiringStockTable({ 
  data, 
  loading, 
  withinDays, 
  setWithinDays, 
  refresh 
}: ExpiringStockTableProps) {
  
  const getDaysRemaining = (dateStr: string) => {
    try {
      return differenceInDays(parseISO(dateStr), new Date())
    } catch {
      return 0
    }
  }

  // Stats
  const expiredCount = data.filter(d => getDaysRemaining(d.fechaVencimiento) <= 0).length
  const criticalCount = data.filter(d => {
    const days = getDaysRemaining(d.fechaVencimiento)
    return days > 0 && days <= 7
  }).length
  const warningCount = data.filter(d => {
    const days = getDaysRemaining(d.fechaVencimiento)
    return days > 7 && days <= 30
  }).length

  return (
    <div className="space-y-5">
      {/* Header con controles - diseño glass */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Lotes Próximos a Vencer</h3>
                <p className="text-sm text-muted-foreground">
                  {data.length} lotes encontrados en los próximos {withinDays} días
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={withinDays.toString()}
                onValueChange={(val) => setWithinDays(Number(val))}
              >
                <SelectTrigger className="w-[180px] bg-background/60 backdrop-blur-sm border-border/50">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Próximos 7 días</SelectItem>
                  <SelectItem value="15">Próximos 15 días</SelectItem>
                  <SelectItem value="30">Próximos 30 días</SelectItem>
                  <SelectItem value="60">Próximos 60 días</SelectItem>
                  <SelectItem value="90">Próximos 90 días</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={refresh} 
                disabled={loading} 
                className="bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background"
              >
                <RefreshCcw className={clsx("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Stats - diseño sutil con bordes */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border border-red-500/20 bg-red-500/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500 tabular-nums">{expiredCount}</p>
                <p className="text-xs text-muted-foreground">Vencidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 tabular-nums">{criticalCount}</p>
                <p className="text-xs text-muted-foreground">Críticos (≤7d)</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-yellow-500/20 bg-yellow-500/[0.03] backdrop-blur-sm">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 tabular-nums">{warningCount}</p>
                <p className="text-xs text-muted-foreground">Atención (≤30d)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla - diseño glass */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Detalle de lotes</span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20 border-b border-border/50">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Código</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Producto</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Laboratorio</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Stock</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Vencimiento</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tiempo Restante</TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Buscando lotes por vencer</p>
                        <p className="text-sm text-muted-foreground">Por favor espere...</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <p className="font-medium text-primary">¡Excelente!</p>
                      <p className="text-sm text-muted-foreground">No hay productos próximos a vencer en los próximos {withinDays} días</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => {
                  const days = getDaysRemaining(item.fechaVencimiento)
                  const isExpired = days <= 0
                  const isCritical = days > 0 && days <= 7
                  const isWarning = days > 7 && days <= 30
                  const progressValue = Math.max(0, Math.min(100, (days / withinDays) * 100))
                  
                  return (
                    <TableRow 
                      key={item.id}
                      className={clsx(
                        "transition-all duration-200 border-b border-border/30",
                        isExpired 
                          ? "bg-red-500/[0.04] hover:bg-red-500/[0.08]" 
                          : isCritical 
                            ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]" 
                            : isWarning 
                              ? "bg-yellow-500/[0.03] hover:bg-yellow-500/[0.06]" 
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
                          <span className="font-medium">{item.nombre}</span>
                          {item.concentracion && (
                            <span className="text-xs text-muted-foreground">{item.concentracion}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{item.laboratorio || "—"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold tabular-nums">{item.cantidadUnidades.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="tabular-nums text-muted-foreground">{item.fechaVencimiento}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                          <div className="flex items-center justify-between">
                            <span className={clsx(
                              "font-bold text-sm tabular-nums",
                              isExpired 
                                ? "text-red-600 dark:text-red-500" 
                                : isCritical 
                                  ? "text-amber-600 dark:text-amber-500" 
                                  : "text-yellow-600 dark:text-yellow-500"
                            )}>
                              {isExpired ? "Vencido" : `${days} días`}
                            </span>
                          </div>
                          <Progress 
                            value={isExpired ? 100 : progressValue} 
                            className={clsx(
                              "h-1",
                              isExpired 
                                ? "[&>div]:bg-red-500" 
                                : isCritical 
                                  ? "[&>div]:bg-amber-500" 
                                  : "[&>div]:bg-yellow-500"
                            )} 
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={clsx(
                            "gap-1",
                            isExpired 
                              ? "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 dark:text-red-500" 
                              : isCritical 
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 dark:text-amber-500" 
                                : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20 dark:text-yellow-500"
                          )}
                        >
                          {isExpired ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {isExpired ? "Vencido" : isCritical ? "Crítico" : "Atención"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
