import { ShoppingCart, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { GlassPanel, QtyAdjust } from "./SharedUI"
import { ProductoCarrito } from "./types"

interface CartProps {
  items: ProductoCarrito[]
  onUpdateQuantity: (code: string, type: "blister" | "unidad", delta: number) => void
  onRemove: (code: string) => void
  total: number
}

export function Cart({ items, onUpdateQuantity, onRemove, total }: CartProps) {
  return (
    <GlassPanel>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Carrito de Venta
        </CardTitle>
        <CardDescription>Productos seleccionados</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No hay productos en el carrito
          </div>
        ) : (
          <div className="rounded-xl border bg-background/60 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[11px]">
                  <TableHead>Producto</TableHead>
                  <TableHead>Blisters</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.codigoBarras || `car-${idx}`} className="text-[12px]">
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {item.nombre}
                        {(item.descuento ?? 0) > 0 && (
                          <span className="text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                            -{((item.descuento / item.precioVentaUnd) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {item.codigoBarras || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <QtyAdjust
                        value={item.cantidadBlister}
                        onDec={() => onUpdateQuantity(item.id ? `id:${item.id}` : item.codigoBarras, "blister", -1)}
                        onInc={() => onUpdateQuantity(item.id ? `id:${item.id}` : item.codigoBarras, "blister", 1)}
                        disabledDec={item.cantidadBlister === 0}
                        suffix={
                          item.cantidadUnidadesBlister
                            ? `${item.cantidadUnidadesBlister}u/blister`
                            : undefined
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <QtyAdjust
                        value={item.cantidadUnidad}
                        onDec={() => onUpdateQuantity(item.id ? `id:${item.id}` : item.codigoBarras, "unidad", -1)}
                        onInc={() => onUpdateQuantity(item.id ? `id:${item.id}` : item.codigoBarras, "unidad", 1)}
                        disabledDec={item.cantidadUnidad === 0}
                      />
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      S/ {item.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id ? `id:${item.id}` : item.codigoBarras)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="font-bold tabular-nums">
                    S/ {total.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </GlassPanel>
  )
}
