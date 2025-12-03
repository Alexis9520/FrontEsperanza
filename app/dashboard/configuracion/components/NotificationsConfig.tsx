import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Bell, Save, Wrench, AlertTriangle, Package, Clock, TrendingDown } from "lucide-react"
import { ConfNotificaciones } from "./types"
import { GlassPanel, ToggleSwitch, SectionHeader } from "@/app/dashboard/configuracion/components/SharedUI"
import { cn } from "@/lib/utils"

interface NotificationsConfigProps {
  config: ConfNotificaciones
  onUpdate: (patch: Partial<ConfNotificaciones>) => void
  onSave: () => void
}

const notificationLabels: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  stockBajo: { 
    label: "Stock Bajo", 
    description: "Alertar cuando un producto tenga poco inventario",
    icon: <TrendingDown className="h-4 w-4" />
  },
  vencimientoProximo: { 
    label: "Vencimiento Próximo", 
    description: "Productos por vencer en los próximos días",
    icon: <Clock className="h-4 w-4" />
  },
  nuevaVenta: { 
    label: "Nueva Venta", 
    description: "Notificar cada vez que se registre una venta",
    icon: <Package className="h-4 w-4" />
  },
  alertasCriticas: { 
    label: "Alertas Críticas", 
    description: "Problemas importantes del sistema",
    icon: <AlertTriangle className="h-4 w-4" />
  },
}

export function NotificationsConfig({
  config,
  onUpdate,
  onSave
}: NotificationsConfigProps) {
  return (
    <GlassPanel>
      <CardContent className="p-6 space-y-6">
        <SectionHeader 
          icon={<Bell className="h-5 w-5" />}
          title="Notificaciones"
          description="Configura qué alertas deseas recibir"
        />

        <Alert className="border-amber-500/20 bg-amber-500/5">
          <Wrench className="h-5 w-5 text-amber-500" />
          <AlertTitle className="text-amber-600 dark:text-amber-400 font-medium">En desarrollo</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Esta sección se ampliará con reglas dinámicas, canales de notificación y alertas contextuales inteligentes.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(config).map(([key, value]) => {
            const info = notificationLabels[key] || { 
              label: key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase()),
              description: "",
              icon: <Bell className="h-4 w-4" />
            }
            return (
              <ToggleSwitch
                key={key}
                id={`notif-${key}`}
                label={info.label}
                description={info.description}
                checked={value}
                onChange={(checked) => onUpdate({ [key as keyof ConfNotificaciones]: checked })}
              />
            )
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-border/50">
          <Button onClick={onSave} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar preferencias
          </Button>
        </div>
      </CardContent>
    </GlassPanel>
  )
}
