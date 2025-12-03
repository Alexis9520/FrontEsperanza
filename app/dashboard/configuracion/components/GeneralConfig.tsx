import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Sparkles, Save, Building2, Phone, Mail, FileText, Loader2, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfGeneral } from "./types"
import { GlassPanel, Field, SectionHeader } from "@/app/dashboard/configuracion/components/SharedUI"
import { cn } from "@/lib/utils"

interface GeneralConfigProps {
  config: ConfGeneral
  onUpdate: (patch: Partial<ConfGeneral>) => void
  onSave: () => void
  changed: boolean
  autoSavedAt: number | null
  enableAutosave: boolean
}

export function GeneralConfig({
  config,
  onUpdate,
  onSave,
  changed,
  autoSavedAt,
  enableAutosave
}: GeneralConfigProps) {
  return (
    <GlassPanel>
      <CardContent className="p-6 space-y-6">
        <SectionHeader 
          icon={<Sparkles className="h-5 w-5" />}
          title="Configuración General"
          description="Información base del negocio que aparece en documentos"
        />

        <div className="grid gap-6">
          {/* Nombre y RUC - Datos principales */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Field 
                value={config.nombreNegocio} 
                label="Nombre del negocio" 
                placeholder="Ej: Farmacia Nueva Esperanza"
                onChange={(v) => onUpdate({ nombreNegocio: v })} 
              />
              <Building2 className="absolute right-3 top-9 h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="relative">
              <Field 
                value={config.ruc || ""} 
                label="RUC" 
                placeholder="20XXXXXXXXX"
                onChange={(v) => onUpdate({ ruc: v })} 
              />
              <FileText className="absolute right-3 top-9 h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>

          {/* Dirección */}
          <Field 
            value={config.direccion} 
            label="Dirección" 
            placeholder="Av. Principal 123, Lima"
            onChange={(v) => onUpdate({ direccion: v })} 
          />

          {/* Contacto */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Field 
                value={config.telefono} 
                label="Teléfono" 
                placeholder="999 999 999"
                onChange={(v) => onUpdate({ telefono: v })} 
              />
              <Phone className="absolute right-3 top-9 h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="relative">
              <Field 
                value={config.email || ""} 
                label="Email" 
                type="email" 
                placeholder="contacto@negocio.com"
                onChange={(v) => onUpdate({ email: v })} 
              />
              <Mail className="absolute right-3 top-9 h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
          <AnimatePresence mode="wait">
            {autoSavedAt ? (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Guardado {new Date(autoSavedAt).toLocaleTimeString()}</span>
              </motion.div>
            ) : changed ? (
              <motion.div
                key="unsaved"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
              >
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Cambios sin guardar</span>
              </motion.div>
            ) : (
              <div />
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {!enableAutosave && (
              <Button 
                onClick={onSave} 
                disabled={!changed}
                className={cn(
                  "gap-2 transition-all",
                  changed && "shadow-md shadow-primary/20"
                )}
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onSave}>
              Sincronizar
            </Button>
          </div>
        </div>
      </CardContent>
    </GlassPanel>
  )
}
