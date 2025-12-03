import { BadgeDollarSign, ClipboardCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GlassPanel } from "./SharedUI"

interface SalesSummaryProps {
  total: number
  vuelto: number
  onProcess: () => void
  isDisabled: boolean
  cajaAbierta: boolean | null
  cajaLoading: boolean
}

export function SalesSummary({
  total,
  vuelto,
  onProcess,
  isDisabled,
  cajaAbierta,
  cajaLoading
}: SalesSummaryProps) {
  return (
    <GlassPanel>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BadgeDollarSign className="h-5 w-5 text-primary" />
          Resumen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">
              S/ {total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-1 border-t">
            <span>Total</span>
            <span className="tabular-nums">S/ {total.toFixed(2)}</span>
          </div>
          {vuelto > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Vuelto</span>
              <span className="tabular-nums">S/ {vuelto.toFixed(2)}</span>
            </div>
          )}
        </div>
        <Separator />
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={onProcess}
          disabled={isDisabled}
        >
          {cajaLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!cajaLoading && (
            <ClipboardCheck className="h-4 w-4" />
          )}
          {cajaLoading
            ? "Verificando caja..."
            : cajaAbierta
            ? "Procesar Venta"
            : "Abrir caja para vender"}
        </Button>
      </CardContent>
    </GlassPanel>
  )
}
