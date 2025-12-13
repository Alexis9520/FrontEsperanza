import { ShoppingCart, Trash2, Layers, Pill, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { GlassPanel } from "./SharedUI"
import { ProductoCarrito } from "./types"
import { cn } from "@/lib/utils"

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
          {items.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </span>
          )}
        </CardTitle>
        <CardDescription>Productos seleccionados</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg bg-background/60">
            No hay productos en el carrito
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[400px] overflow-auto">
            {items.map((item, idx) => {
              const itemKey = item.id ? `id:${item.id}` : item.codigoBarras
              const hasDiscount = (item.descuento ?? 0) > 0

              return (
                <div
                  key={item.codigoBarras || `cart-${idx}`}
                  className="rounded-lg border bg-background/80 backdrop-blur-sm px-4 py-3 flex flex-col md:flex-row md:items-center gap-3"
                >
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm line-clamp-1">{item.nombre}</span>
                      {hasDiscount && (
                        <span className="text-[9px] text-green-600 bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-medium shrink-0">
                          -{((item.descuento / item.precioVentaUnd) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground/60">
                      {item.codigoBarras || "—"}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Blisters */}
                    {item.cantidadUnidadesBlister && item.cantidadUnidadesBlister > 0 && (
                      <div className="flex items-center gap-2 bg-blue-50/50 dark:bg-blue-950/30 px-2 py-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                            x{item.cantidadUnidadesBlister}
                          </span>
                        </div>
                        <CartQtyAdjust
                          value={item.cantidadBlister}
                          onDec={() => onUpdateQuantity(itemKey, "blister", -1)}
                          onInc={() => onUpdateQuantity(itemKey, "blister", 1)}
                          disabledDec={item.cantidadBlister === 0}
                        />
                      </div>
                    )}

                    {/* Unidades */}
                    <div className="flex items-center gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 px-2 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50">
                      <Pill className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <CartQtyAdjust
                        value={item.cantidadUnidad}
                        onDec={() => onUpdateQuantity(itemKey, "unidad", -1)}
                        onInc={() => onUpdateQuantity(itemKey, "unidad", 1)}
                        disabledDec={item.cantidadUnidad === 0}
                      />
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="font-bold tabular-nums text-sm shrink-0 min-w-[70px] text-right">
                    S/ {item.subtotal.toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => onRemove(itemKey)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}

            {/* Total Row */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between mt-2">
              <span className="font-medium text-sm">Total</span>
              <span className="font-bold text-lg tabular-nums">S/ {total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </GlassPanel>
  )
}

// Compact quantity adjust for cart
function CartQtyAdjust({
  value,
  onDec,
  onInc,
  disabledDec
}: {
  value: number
  onDec: () => void
  onInc: () => void
  disabledDec?: boolean
}) {
  return (
    <div className="flex items-center bg-background rounded border shadow-sm h-7">
      <button
        type="button"
        onClick={onDec}
        disabled={disabledDec}
        className="h-full w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-colors rounded-l border-r"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center font-bold text-xs tabular-nums">{value}</span>
      <button
        type="button"
        onClick={onInc}
        className="h-full w-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-r border-l"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
