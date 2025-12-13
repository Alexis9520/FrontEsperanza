import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Search, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Movimiento } from "@/app/dashboard/caja/components/types"
import { GlassPanel } from "./SharedUI"

interface MovimientosListProps {
  movimientos: Movimiento[]
  onNuevoMovimiento: (tipo: "INGRESO" | "EGRESO", monto: number, descripcion: string) => Promise<void>
  cajaAbierta: boolean
}

export function MovimientosList({ movimientos, onNuevoMovimiento, cajaAbierta }: MovimientosListProps) {
  const [filtro, setFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<"TODOS" | "INGRESO" | "EGRESO">("TODOS")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [nuevoMovimiento, setNuevoMovimiento] = useState<{
    tipo: "INGRESO" | "EGRESO"
    monto: string
    descripcion: string
  }>({
    tipo: "INGRESO",
    monto: "",
    descripcion: "",
  })

  const movimientosFiltrados = movimientos.filter((m) => {
    const cumpleTexto =
      m.descripcion.toLowerCase().includes(filtro.toLowerCase()) ||
      m.usuario.nombre.toLowerCase().includes(filtro.toLowerCase())
    const cumpleTipo = tipoFiltro === "TODOS" || (m.tipo || "").toUpperCase() === tipoFiltro
    return cumpleTexto && cumpleTipo
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMovimiento.monto || !nuevoMovimiento.descripcion) return

    await onNuevoMovimiento(
      nuevoMovimiento.tipo,
      parseFloat(nuevoMovimiento.monto),
      nuevoMovimiento.descripcion
    )
    setIsDialogOpen(false)
    setNuevoMovimiento({ tipo: "INGRESO", monto: "", descripcion: "" })
  }

  return (
    <GlassPanel className="flex flex-col min-h-[400px]">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Movimientos del Día</h2>
          <Badge variant="secondary" className="bg-muted text-muted-foreground border border-border/50">
            {movimientosFiltrados.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {cajaAbierta && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Movimiento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Registrar Movimiento</DialogTitle>
                  <DialogDescription>
                    Ingresa los detalles del movimiento de caja.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Movimiento</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={nuevoMovimiento.tipo === "INGRESO" ? "default" : "outline"}
                        className={nuevoMovimiento.tipo === "INGRESO" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        onClick={() => setNuevoMovimiento({ ...nuevoMovimiento, tipo: "INGRESO" })}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Ingreso
                      </Button>
                      <Button
                        type="button"
                        variant={nuevoMovimiento.tipo === "EGRESO" ? "default" : "outline"}
                        className={nuevoMovimiento.tipo === "EGRESO" ? "bg-red-600 hover:bg-red-700" : ""}
                        onClick={() => setNuevoMovimiento({ ...nuevoMovimiento, tipo: "EGRESO" })}
                      >
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Egreso
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto (S/)</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={nuevoMovimiento.monto}
                      onChange={(e) => setNuevoMovimiento({ ...nuevoMovimiento, monto: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      placeholder="Ej: Pago de servicios, Venta manual..."
                      value={nuevoMovimiento.descripcion}
                      onChange={(e) =>
                        setNuevoMovimiento({ ...nuevoMovimiento, descripcion: e.target.value })
                      }
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Guardar Movimiento</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción o usuario..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9 bg-background/60 border-border/50 focus:bg-background transition-colors"
          />
        </div>
        <Select
          value={tipoFiltro}
          onValueChange={(value: "TODOS" | "INGRESO" | "EGRESO") => setTipoFiltro(value)}
        >
          <SelectTrigger className="w-[160px] bg-background/60 border-border/50">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            <SelectItem value="INGRESO">Ingresos</SelectItem>
            <SelectItem value="EGRESO">Egresos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto min-h-[300px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/30 backdrop-blur z-10">
            <TableRow className="border-b border-border/50 hover:bg-muted/30">
              <TableHead className="w-[100px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Hora</TableHead>
              <TableHead className="w-[100px] font-semibold text-xs uppercase tracking-wider text-muted-foreground">Tipo</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Descripción</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Usuario</TableHead>
              <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimientosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No se encontraron movimientos</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              movimientosFiltrados.map((mov, index) => (
                <TableRow
                  key={mov.id}
                  className={`transition-colors border-b border-border/30 ${index % 2 === 0 ? "bg-transparent hover:bg-muted/30" : "bg-muted/10 hover:bg-muted/30"
                    }`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                    {format(new Date(mov.fecha), "HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        (mov.tipo || "").toUpperCase() === "INGRESO"
                          ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"
                          : "border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-500"
                      }
                    >
                      {(mov.tipo || "").toUpperCase() === "INGRESO" ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownLeft className="mr-1 h-3 w-3" />
                      )}
                      {mov.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{mov.descripcion}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {mov.usuario.nombre}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium tabular-nums">
                    <span
                      className={
                        (mov.tipo || "").toUpperCase() === "INGRESO"
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }
                    >
                      {(mov.tipo || "").toUpperCase() === "INGRESO" ? "+" : "-"} S/ {mov.monto.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </GlassPanel>
  )
}
