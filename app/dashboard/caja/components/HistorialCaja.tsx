import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  User,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  CreditCard,
  Search
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { HistorialCaja as IHistorialCaja } from "@/app/dashboard/caja/components/types"
import { GlassPanel, DiferenciaCierreCard } from "./SharedUI"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface HistorialCajaProps {
  historial: IHistorialCaja[]
  loading?: boolean
  currentPage: number
  pageSize: number
  totalElements: number | null
  loadAll: boolean
  onChangePage: (page: number) => void
  onChangePageSize: (size: number) => void
  onToggleLoadAll: (loadAll: boolean) => void
}

export function HistorialCaja({ historial, loading = false, currentPage, pageSize, totalElements, loadAll, onChangePage, onChangePageSize, onToggleLoadAll }: HistorialCajaProps) {
  const total = totalElements ?? historial.length
  const totalPages = loadAll ? 1 : Math.max(1, Math.ceil((total || 0) / pageSize))
  const startIndex = loadAll ? 0 : currentPage * pageSize
  const endIndex = loadAll ? Math.min(historial.length, total || historial.length) : Math.min(startIndex + pageSize, total || 0)

  let paginatedHistorial = historial
  if (loadAll) {
    paginatedHistorial = historial
  } else if (total != null) {
    paginatedHistorial = historial
  } else {
    paginatedHistorial = historial.slice(startIndex, endIndex)
  }

  const handlePageSizeChange = (newSize: number) => {
    onChangePageSize(newSize)
    onChangePage(0)
  }

  const handleToggleLoadAll = () => {
    onToggleLoadAll(!loadAll)
  }

  return (
    <GlassPanel className="">
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="p-5 border-b border-border/40 bg-background/40 backdrop-blur-md flex-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground/90">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                Historial de Cierres
              </h2>
              <p className="text-sm text-muted-foreground pl-1">
                Registro detallado de operaciones y arqueos de caja.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {total} registros
              </div>
              <Button
                size="sm"
                variant={loadAll ? "secondary" : "outline"}
                onClick={handleToggleLoadAll}
                className="transition-all duration-300 hover:shadow-md"
              >
                {loadAll ? "Ver paginado" : "Ver todo"}
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-visible relative min-h-0 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-xl z-20 shadow-sm border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Fecha Apertura</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Fecha Cierre</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Usuario</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Saldo Inicial</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Efec. Decl.</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Sistema</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Diferencia</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4">Yape</TableHead>
                <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground/70 py-4 pr-6">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-primary/50" />
                        </div>
                      </div>
                      <p className="text-muted-foreground font-medium animate-pulse">Cargando historial...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (!paginatedHistorial || paginatedHistorial.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center border-2 border-dashed border-border">
                        <Calendar className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium text-foreground">No hay registros</p>
                        <p className="text-sm text-muted-foreground">No se encontraron movimientos de caja en este periodo.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistorial.map((caja, index) => (
                  <HistorialRow key={caja.id} caja={caja} index={index} />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        {total > 0 && !loadAll && (
          <div className="flex-none border-t border-border/40 bg-background/40 backdrop-blur-md p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                Mostrando <span className="text-foreground">{startIndex + 1}</span> - <span className="text-foreground">{endIndex}</span> de <span className="text-foreground">{total}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold hidden sm:inline">Filas por pág.</span>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => handlePageSizeChange(Number(value))}
                  >
                    <SelectTrigger className="h-8 w-[70px] bg-background/50 border-border/50 focus:ring-primary/20">
                      <SelectValue placeholder={pageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={`${size}`}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-background hover:shadow-sm"
                    onClick={() => onChangePage(0)}
                    disabled={currentPage === 0}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-background hover:shadow-sm"
                    onClick={() => onChangePage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-2 min-w-[3rem] text-center text-sm font-medium">
                    {currentPage + 1} / {totalPages || 1}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-background hover:shadow-sm"
                    onClick={() => onChangePage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-background hover:shadow-sm"
                    onClick={() => onChangePage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}

function HistorialRow({ caja, index }: { caja: IHistorialCaja; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  const saldoSistema = (caja.saldoInicial + caja.totalIngresos - caja.totalEgresos - (caja.ingresosYape || 0))
  const diferencia = (caja.saldoFinalDeclarado != null ? caja.saldoFinalDeclarado - saldoSistema : 0)

  return (
    <>
      <TableRow
        className={cn(
          "group transition-all duration-200 cursor-pointer border-b border-border/30",
          isOpen ? "bg-muted/40" : "hover:bg-muted/30"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <TableCell className="py-3 pl-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 rounded-full transition-transform duration-200",
              isOpen && "bg-background shadow-sm rotate-90"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(!isOpen)
            }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TableCell>
        <TableCell className="font-medium tabular-nums text-foreground/90">
          {format(new Date(caja.fechaApertura), "dd/MM/yyyy HH:mm")}
        </TableCell>
        <TableCell className="tabular-nums text-muted-foreground">
          {caja.fechaCierre
            ? format(new Date(caja.fechaCierre), "dd/MM/yyyy HH:mm")
            : <span className="text-muted-foreground/40 italic">En curso...</span>}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-medium">{caja.usuario.nombre}</span>
          </div>
        </TableCell>
        <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
          S/ {caja.saldoInicial.toFixed(2)}
        </TableCell>
        <TableCell className="text-right font-mono font-medium tabular-nums">
          {caja.saldoFinalDeclarado != null ? `S/ ${caja.saldoFinalDeclarado.toFixed(2)}` : "—"}
        </TableCell>
        <TableCell className="text-right font-mono text-muted-foreground tabular-nums">
          S/ {saldoSistema.toFixed(2)}
        </TableCell>
        <TableCell className="text-right">
          {caja.saldoFinalDeclarado != null ? (
            <span className={cn(
              "font-mono font-bold tabular-nums px-2 py-0.5 rounded text-xs",
              diferencia < 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                diferencia > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                  "bg-muted text-muted-foreground"
            )}>
              {diferencia > 0 ? "+" : ""}S/ {diferencia.toFixed(2)}
            </span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </TableCell>
        <TableCell className="text-right font-mono text-blue-600 dark:text-blue-400 tabular-nums">
          S/ {(caja.ingresosYape || 0).toFixed(2)}
        </TableCell>
        <TableCell className="text-right pr-6">
          <Badge
            variant="outline"
            className={cn(
              "capitalize shadow-sm",
              caja.fechaCierre
                ? "bg-muted/50 text-muted-foreground border-border/50"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse"
            )}
          >
            {caja.fechaCierre ? "Cerrada" : "Abierta"}
          </Badge>
        </TableCell>
      </TableRow>
      <TableRow className="border-none">
        <TableCell colSpan={10} className="p-0">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-muted/20 border-b border-border/30 shadow-inner"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Resumen Financiero */}
                  <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-border/40 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Wallet className="h-4 w-4" /> Resumen Financiero
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-emerald-500" /> Ingresos
                        </span>
                        <span className="text-emerald-600 font-bold tabular-nums">
                          + S/ {caja.totalIngresos.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-red-500" /> Egresos
                        </span>
                        <span className="text-red-600 font-bold tabular-nums">
                          - S/ {caja.totalEgresos.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30 transition-colors">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-blue-500" /> Yape
                        </span>
                        <span className="text-blue-600 font-bold tabular-nums">
                          - S/ {(caja.ingresosYape || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-border/50 my-2 pt-2 flex justify-between items-center px-2">
                        <span className="font-medium text-foreground">Total Efectivo Calculado</span>
                        <span className="font-bold text-lg tabular-nums">
                          S/ {(caja.saldoInicial + caja.totalIngresos - (caja.totalEgresos + (caja.ingresosYape || 0))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de Cierre */}
                  <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-border/40 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Detalles de Cierre
                    </h4>
                    {caja.fechaCierre ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded-lg">
                            <span className="text-xs text-muted-foreground">Efectivo Declarado</span>
                            <span className="font-bold text-base tabular-nums">S/ {caja.saldoFinalDeclarado?.toFixed(2)}</span>
                          </div>

                          <div className="flex flex-col gap-1 p-2 bg-muted/20 rounded-lg">
                            <span className="text-xs text-muted-foreground">Efectivo Sistema</span>
                            <span className="font-medium text-base tabular-nums">S/ {saldoSistema.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-2 bg-muted/30 rounded-lg border border-border/30">
                          <span className="text-sm font-medium text-muted-foreground">Diferencia</span>
                          <span className={cn(
                            "font-bold text-lg tabular-nums",
                            diferencia < 0 ? "text-red-600" : diferencia > 0 ? "text-emerald-600" : "text-muted-foreground"
                          )}>
                            {diferencia > 0 ? "+" : ""}S/ {diferencia.toFixed(2)}
                          </span>
                        </div>

                        {diferencia !== 0 && (
                          <div className="scale-95 origin-left">
                            <DiferenciaCierreCard diferencia={diferencia} />
                          </div>
                        )}

                        {caja.observaciones && (
                          <div className="mt-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20">
                            <span className="font-bold block mb-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Observaciones:
                            </span>
                            {caja.observaciones}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2 bg-muted/10 rounded-lg border border-dashed border-border/50">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse">
                          <Calendar className="h-5 w-5 text-emerald-500" />
                        </div>
                        <span className="text-sm font-medium">Caja actualmente abierta</span>
                      </div>
                    )}
                  </div>

                  {/* Movimientos */}
                  <div className="space-y-3 bg-background/50 p-4 rounded-xl border border-border/40 shadow-sm flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Search className="h-4 w-4" /> Últimos Movimientos
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[200px] scrollbar-thin scrollbar-thumb-border/40">
                      {caja.movimientos.length > 0 ? (
                        caja.movimientos.map((mov) => (
                          <div key={mov.id} className="flex justify-between items-center text-xs p-2 rounded hover:bg-muted/50 transition-colors border border-transparent hover:border-border/30">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium truncate max-w-[150px]" title={mov.descripcion}>
                                {mov.descripcion}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(mov.fecha), "HH:mm")}
                              </span>
                            </div>
                            <span className={cn(
                              "font-mono font-medium px-1.5 py-0.5 rounded",
                              (mov.tipo || "").toUpperCase() === "INGRESO"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-red-500/10 text-red-600"
                            )}>
                              {(mov.tipo || "").toUpperCase() === "INGRESO" ? "+" : "-"} {mov.monto.toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-xs italic">
                          No hay movimientos registrados
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        </TableCell>
      </TableRow>
    </>
  )
}
