import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, User, Calendar, DollarSign, TrendingUp, TrendingDown, Wallet, Activity } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CajaResumen, Usuario } from "@/app/dashboard/caja/components/types"
import { GlassPanel, MetricCard } from "./SharedUI"

interface CajaHeaderProps {
  cajaAbierta: boolean
  usuario: Usuario | null
  resumen: CajaResumen | null
  onAbrirCaja: () => void
  onCerrarCaja: () => void
}

export function CajaHeader({
  cajaAbierta,
  usuario,
  resumen,
  onAbrirCaja,
  onCerrarCaja
}: CajaHeaderProps) {
  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Control de Caja</h1>
                <Badge
                  variant={cajaAbierta ? "default" : "secondary"}
                  className={cajaAbierta 
                    ? "text-xs px-2 py-0.5 uppercase tracking-wider font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20" 
                    : "text-xs px-2 py-0.5 uppercase tracking-wider font-medium bg-muted text-muted-foreground"
                  }
                >
                  {cajaAbierta ? (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> En vivo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Cerrada
                    </span>
                  )}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="font-medium text-foreground/80">
                    {usuario?.nombre || "Usuario"}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">
                    {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!cajaAbierta ? (
              <Button
                size="lg"
                onClick={onAbrirCaja}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Unlock className="h-5 w-5" />
                Abrir Caja
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={onCerrarCaja}
                className="gap-2 border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Lock className="h-5 w-5" />
                Cerrar Caja
              </Button>
            )}
          </div>
        </div>
      </GlassPanel>

      {cajaAbierta && resumen && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Saldo Inicial"
            value={resumen.saldoInicial}
            icon={<DollarSign className="h-5 w-5" />}
            suffix="S/"
            accent="blue"
          />
          <MetricCard
            title="Ingresos"
            value={resumen.totalIngresos}
            icon={<TrendingUp className="h-5 w-5" />}
            suffix="S/"
            positive
            accent="emerald"
          />
          <MetricCard
            title="Egresos"
            value={resumen.totalEgresos}
            icon={<TrendingDown className="h-5 w-5" />}
            suffix="S/"
            negative
            accent="red"
          />
        </div>
      )}
    </div>
  )
}
