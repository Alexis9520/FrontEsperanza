import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Unlock, Loader2, DollarSign } from "lucide-react"
import { CajaResumen } from "@/app/dashboard/caja/components/types"
import { GlassPanel } from "./SharedUI"

interface CajaStatusProps {
  cajaAbierta: boolean
  resumen: CajaResumen | null
  onAbrirCaja: (montoInicial: number) => Promise<void>
  onCerrarCaja: (montoFinal: number, observaciones: string) => Promise<void>
}

export function CajaStatus({
  cajaAbierta,
  resumen,
  onAbrirCaja,
  onCerrarCaja
}: CajaStatusProps) {
  const [monto, setMonto] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monto) return

    setIsSubmitting(true)
    try {
      if (cajaAbierta) {
        await onCerrarCaja(parseFloat(monto), observaciones)
      } else {
        await onAbrirCaja(parseFloat(monto))
      }
      setMonto("")
      setObservaciones("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <GlassPanel className="h-full flex flex-col justify-center p-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-6">
        <div className={`inline-flex items-center justify-center p-4 rounded-xl mb-4 ${
          cajaAbierta 
            ? "bg-red-500/10 border border-red-500/20" 
            : "bg-primary/10 border border-primary/20"
        }`}>
          {cajaAbierta ? (
            <Lock className="h-8 w-8 text-red-600 dark:text-red-500" />
          ) : (
            <Unlock className="h-8 w-8 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {cajaAbierta ? "Cerrar Caja" : "Apertura de Caja"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {cajaAbierta
            ? "Finaliza el turno y registra el saldo final."
            : "Inicia un nuevo turno registrando el saldo inicial."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto" className="text-sm font-medium">
              {cajaAbierta ? "Saldo Final en Efectivo" : "Monto Inicial en Caja"}
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 h-5 w-5 rounded bg-muted/50 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
              </div>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-11 text-lg font-mono bg-background/60 border-border/50 focus:bg-background transition-colors"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {cajaAbierta && (
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="text-sm font-medium">Observaciones (Opcional)</Label>
              <Textarea
                id="observaciones"
                placeholder="Notas sobre diferencias, billetes falsos, etc."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="resize-none bg-background/60 border-border/50 focus:bg-background transition-colors"
                rows={3}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className={`w-full gap-2 ${
            cajaAbierta 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-primary hover:bg-primary/90"
          }`}
          size="lg"
          disabled={isSubmitting || !monto}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : cajaAbierta ? (
            <>
              <Lock className="h-4 w-4" />
              Confirmar Cierre de Caja
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              Abrir Caja
            </>
          )}
        </Button>
      </form>
    </GlassPanel>
  )
}
