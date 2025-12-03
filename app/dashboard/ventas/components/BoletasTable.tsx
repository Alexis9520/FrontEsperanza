import React, { useState } from "react"
import {
  Receipt,
  ChevronDown,
  ChevronRight,
  User2,
  Users,
  Loader2,
  Printer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Boleta } from "../types"
import { formatFechaHora, metodoBadgeVariant } from "../lib/utils"
import { getBoletaById } from "@/lib/api"
import { buildTicketHTML, VentaPreview } from "@/lib/print-utils"
import { useToast } from "@/lib/use-toast"

interface BoletasTableProps {
  boletas: Boleta[]
  loading: boolean
  compactas: boolean
  boletaExpandida: number | null
  onToggleExpand: (b: Boleta) => void
}

export function BoletasTable({
  boletas,
  loading,
  compactas,
  boletaExpandida,
  onToggleExpand
}: BoletasTableProps) {
  const { toast } = useToast()
  const [reprintingId, setReprintingId] = useState<number | null>(null)
  const [reprintStatus, setReprintStatus] = useState<"idle" | "cargando" | "imprimiendo">("idle")

  const handleReprint = async (e: React.MouseEvent, b: Boleta) => {
    e.stopPropagation()
    if (reprintingId) return
    setReprintingId(b.id)
    setReprintStatus("cargando")

    try {
      let productos = b.productos
      let fullBoleta = b

      // Si no tiene productos, intentar cargar detalle completo
      if (!productos || productos.length === 0) {
        try {
           const full = await getBoletaById(b.id)
           if (full) {
             fullBoleta = full
             productos = full.productos
           }
        } catch (err) {
          console.error("Error cargando detalle boleta", err)
          toast({ title: "Error", description: "No se pudo cargar el detalle de la boleta", variant: "destructive" })
          setReprintingId(null)
          return
        }
      }

      if (!productos || productos.length === 0) {
        toast({ title: "Error", description: "La boleta no tiene productos", variant: "destructive" })
        setReprintingId(null)
        return
      }

      // Leer configuración
      const configGenStr = localStorage.getItem("configuracionGeneral")
      const configBolStr = localStorage.getItem("configuracionBoleta")
      
      const configGen = configGenStr ? JSON.parse(configGenStr) : {
        nombreNegocio: "Nueva Esperanza",
        direccion: "Av. La Esperanza 403 - El Tambo",
        telefono: "+51 961 668 320",
        ruc: "1234567890",
        moneda: "S/"
      }
      
      const configBol = configBolStr ? JSON.parse(configBolStr) : {
        mensajePie: "",
        mostrarLogo: true,
        formatoImpresion: "80mm"
      }

      // Construir preview
      const preview: VentaPreview = {
        numero: fullBoleta.numero,
        fecha: fullBoleta.fecha,
        cliente: fullBoleta.cliente || "Cliente General",
        items: productos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
          subtotal: p.cantidad * p.precio
        })),
        total: fullBoleta.totalCompra ?? fullBoleta.total ?? 0,
        metodo: {
          nombre: fullBoleta.metodoPago || "Efectivo",
          vuelto: fullBoleta.vuelto ?? 0
        },
        vendedor: fullBoleta.usuario || undefined
      }

      const html = buildTicketHTML(preview, configGen, {
        mensajePie: configBol.mensajePie,
        mostrarLogo: configBol.mostrarLogo,
        formatoImpresion: configBol.formatoImpresion
      })

      // Guardar job y abrir
      localStorage.setItem("ticket_preview_job", JSON.stringify({
        html,
        formato: configBol.formatoImpresion,
        auto: true // Auto imprimir al abrir
      }))

      const win = window.open("/print", "ticketPreview", "width=800,height=900")
      if (!win) {
        toast({ title: "Bloqueado", description: "Permite popups para imprimir", variant: "destructive" })
        setReprintStatus("idle")
        setReprintingId(null)
        return
      }

      // Cambiar a estado imprimiendo y monitorear cierre de ventana
      setReprintStatus("imprimiendo")
      
      const checkClosed = setInterval(() => {
        if (win.closed) {
          clearInterval(checkClosed)
          setReprintStatus("idle")
          setReprintingId(null)
        }
      }, 500)

    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Falló la reimpresión", variant: "destructive" })
      setReprintStatus("idle")
      setReprintingId(null)
    }
  }

  return (
    <>
      {/* Overlay de reimpresión */}
      {reprintStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-6 p-10 rounded-2xl bg-card border shadow-2xl animate-in fade-in zoom-in duration-300 max-w-sm w-full text-center">
            {reprintStatus === "cargando" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Cargando Boleta</h3>
                  <p className="text-muted-foreground">Preparando datos para reimpresión...</p>
                </div>
              </>
            )}
            {reprintStatus === "imprimiendo" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                  <Printer className="h-16 w-16 text-blue-500 relative z-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Imprimiendo Ticket</h3>
                  <p className="text-muted-foreground">
                    La ventana de impresión está abierta.
                    <br />
                    <span className="text-xs">Ciérrala para continuar usando el sistema.</span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-background/60 backdrop-blur-sm overflow-x-auto shadow-inner relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                Cargando boletas...
              </span>
            </div>
          </div>
        )}
        <Table className={cn(compactas && "[&_td]:py-1.5 [&_th]:py-2 text-sm")}>
          <TableHeader>
            <TableRow className="bg-muted/40">
            <TableHead className="whitespace-nowrap">#</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="hidden md:table-cell">Vuelto</TableHead>
            <TableHead className="hidden md:table-cell">Usuario</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading && boletas.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                <Receipt className="inline h-5 w-5 opacity-60 mr-2" />
                No se encontraron boletas
              </TableCell>
            </TableRow>
          )}
          {boletas.map((b) => {
            const expandida = boletaExpandida === b.id
            return (
              <React.Fragment key={b.id}>
                <TableRow
                  className={cn(
                    "group cursor-pointer transition-colors",
                    expandida && "bg-primary/5"
                  )}
                  onDoubleClick={() => onToggleExpand(b)}
                >
                  <TableCell className="font-semibold text-primary/80">
                    {b.numero}
                  </TableCell>
                  <TableCell className="text-xs md:text-sm">
                    {formatFechaHora(b.fecha)}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <User2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[140px]">
                        {b.cliente || "-"}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={metodoBadgeVariant(b.metodoPago)}>
                      {b.metodoPago || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {b.totalCompra ?? b.total ?? "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell tabular-nums">
                    {b.vuelto || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="flex items-center gap-1 text-xs">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {b.usuario || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={(e) => handleReprint(e, b)}
                        title="Reimprimir ticket"
                        disabled={reprintingId === b.id}
                      >
                        {reprintingId === b.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Printer className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => {
                          e.stopPropagation()
                          onToggleExpand(b)
                        }}
                        title={expandida ? "Cerrar detalles" : "Ver detalles"}
                      >
                        {expandida ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandida && (
                  <TableRow className="bg-primary/3">
                    <TableCell colSpan={8} className="p-0">
                      <BoletaExpandedDetails boleta={b} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}

          {loading && boletas.length === 0 && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} cols={8} compact={compactas} />
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </div>
    </>
  )
}

function BoletaExpandedDetails({ boleta }: { boleta: Boleta }) {
  return (
    <div className="p-4 border-t bg-gradient-to-br from-background/70 to-background/30">
      <p className="text-sm font-semibold flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        Productos vendidos
      </p>
      <div className="rounded-lg border overflow-x-auto bg-background/60">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cant.</TableHead>
              <TableHead>Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(boleta.productos ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-muted-foreground text-center">
                  Sin productos en esta boleta
                </TableCell>
              </TableRow>
            )}
            {boleta.productos?.map((p, idx) => (
              <TableRow key={`${p.codBarras}-${idx}`}>
                <TableCell className="tabular-nums">
                  {p.codBarras}
                </TableCell>
                <TableCell>{p.nombre}</TableCell>
                <TableCell className="tabular-nums">
                  {p.cantidad}
                </TableCell>
                <TableCell className="tabular-nums">
                  {p.precio}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-right font-semibold"
              >
                Total
              </TableCell>
              <TableCell className="font-semibold tabular-nums">
                {boleta.totalCompra ?? boleta.total ?? "—"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-right font-semibold"
              >
                Vuelto
              </TableCell>
              <TableCell className="font-semibold tabular-nums">
                {boleta.vuelto ?? "—"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SkeletonRow({ cols, compact }: { cols: number; compact?: boolean }) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className={cn(compact ? "py-1.5" : "py-3")}>
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
        </TableCell>
      ))}
    </TableRow>
  )
}
