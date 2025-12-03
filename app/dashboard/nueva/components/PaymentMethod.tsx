import { CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GlassPanel } from "./SharedUI"
import { MetodoPago } from "./types"

interface PaymentMethodProps {
  metodo: MetodoPago
  onMetodoChange: (m: MetodoPago) => void
  montoEfectivo: string
  onMontoEfectivoChange: (val: string) => void
  montoYape: string
  onMontoYapeChange: (val: string) => void
  faltante: number
}

function clampDecimalInput(input: string, maxDecimals = 1) {
  if (!input) return ""
  let v = input.replace(/,/g, '.')
  // keep only digits and dot
  v = v.replace(/[^0-9.]/g, '')
  // if multiple dots, keep first and join the rest
  const parts = v.split('.')
  if (parts.length > 2) {
    v = parts[0] + '.' + parts.slice(1).join('')
  }
  if (v === '.') return '0.'
  const dotIndex = v.indexOf('.')
  if (dotIndex === -1) return v
  const intPart = v.slice(0, dotIndex) || '0'
  const frac = v.slice(dotIndex + 1).slice(0, maxDecimals)
  return frac.length > 0 ? `${intPart}.${frac}` : `${intPart}.`
}

export function PaymentMethod({
  metodo,
  onMetodoChange,
  montoEfectivo,
  onMontoEfectivoChange,
  montoYape,
  onMontoYapeChange,
  faltante
}: PaymentMethodProps) {
  return (
    <GlassPanel>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5 text-primary" />
          Método de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <RadioGroup
          value={metodo}
          onValueChange={v => onMetodoChange(v as MetodoPago)}
          className="grid gap-2 text-sm"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="efectivo" id="p-efectivo" />
            <Label htmlFor="p-efectivo">Efectivo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yape" id="p-yape" />
            <Label htmlFor="p-yape">Yape</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mixto" id="p-mixto" />
            <Label htmlFor="p-mixto">Mixto</Label>
          </div>
        </RadioGroup>

        {metodo === "efectivo" && (
          <div className="space-y-2">
            <Label htmlFor="monto-efectivo">Monto efectivo</Label>
            <Input
              id="monto-efectivo"
              type="number"
              step="0.1"
              value={montoEfectivo}
              onChange={e => onMontoEfectivoChange(clampDecimalInput(e.target.value, 1))}
              placeholder="0.0"
            />
            {faltante > 0 && (
              <div className="text-xs text-red-600">
                Faltan S/ {faltante.toFixed(2)}
              </div>
            )}
          </div>
        )}
        {metodo === "yape" && (
          <div className="space-y-2">
            <Label htmlFor="monto-yape">Monto Yape</Label>
            <Input
              id="monto-yape"
              type="number"
              step="0.1"
              value={montoYape}
              onChange={e => onMontoYapeChange(clampDecimalInput(e.target.value, 1))}
              placeholder="0.0"
            />
            {faltante > 0 && (
              <div className="text-xs text-red-600">
                Faltan S/ {faltante.toFixed(2)}
              </div>
            )}
          </div>
        )}
        {metodo === "mixto" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monto-efectivo-mixto">Efectivo</Label>
              <Input
                id="monto-efectivo-mixto"
                type="number"
                step="0.1"
                value={montoEfectivo}
                onChange={e => onMontoEfectivoChange(clampDecimalInput(e.target.value, 1))}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto-yape-mixto">Yape</Label>
              <Input
                id="monto-yape-mixto"
                type="number"
                step="0.1"
                value={montoYape}
                onChange={e => onMontoYapeChange(clampDecimalInput(e.target.value, 1))}
                placeholder="0.0"
              />
            </div>
            {faltante > 0 && (
              <div className="md:col-span-2 text-xs text-red-600">
                Faltan S/ {faltante.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </GlassPanel>
  )
}
