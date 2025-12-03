import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Printer, Save, RefreshCw, Eye, FileText, MessageSquare, CheckCircle2, Lightbulb } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ConfBoleta } from "./types"
import { GlassPanel, Field, ToggleSwitch, SectionHeader } from "@/app/dashboard/configuracion/components/SharedUI"
import { cn } from "@/lib/utils"

interface BoletaConfigProps {
  config: ConfBoleta
  onUpdate: (patch: Partial<ConfBoleta>) => void
  onSave: () => void
  onPreview: () => void
  onRefreshPreview: () => void
  changed: boolean
  autoSavedAt: number | null
  enableAutosave: boolean
}

export function BoletaConfig({
  config,
  onUpdate,
  onSave,
  onPreview,
  onRefreshPreview,
  changed,
  autoSavedAt,
  enableAutosave
}: BoletaConfigProps) {
  return (
    <GlassPanel>
      <CardContent className="p-6 space-y-6">
        <SectionHeader 
          icon={<Printer className="h-5 w-5" />}
          title="Configuración de Boletas"
          description="Personaliza el formato y contenido de tus comprobantes"
        />

        {/* Configuración principal */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Field 
              value={config.serieBoleta} 
              label="Serie de boleta" 
              placeholder="B001"
              onChange={(v) => onUpdate({ serieBoleta: v })} 
            />
            <FileText className="absolute right-3 top-9 h-4 w-4 text-muted-foreground/50" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Formato de impresión</Label>
            <Select
              value={config.formatoImpresion}
              onValueChange={(value) => onUpdate({ formatoImpresion: value as "80mm" | "58mm" | "a4" })}
            >
              <SelectTrigger className="bg-background/80 border-border/60">
                <SelectValue placeholder="Selecciona formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80mm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ticket 80mm (Recomendado)
                  </span>
                </SelectItem>
                <SelectItem value="58mm">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Ticket 58mm
                  </span>
                </SelectItem>
                <SelectItem value="a4">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    Hoja A4
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mensaje de pie */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Mensaje de pie de ticket
          </Label>
          <Textarea
            value={config.mensajePie}
            onChange={(e) => onUpdate({ mensajePie: e.target.value })}
            className="bg-background/80 border-border/60 resize-none min-h-[80px]"
            placeholder="Ej: ¡Gracias por su compra! Vuelva pronto 😊"
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Este mensaje aparecerá al final de cada ticket. Puedes usar emojis.
          </p>
        </div>

        {/* Opciones avanzadas */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="impresion" className="border border-border/50 rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Printer className="h-4 w-4 text-muted-foreground" />
                Opciones de Impresión
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <ToggleSwitch
                id="mostrar-logo"
                label="Mostrar logo"
                description="Incluir el logo del negocio en el ticket"
                checked={config.mostrarLogo}
                onChange={(c) => onUpdate({ mostrarLogo: c })}
              />
              <ToggleSwitch
                id="imprimir-auto"
                label="Imprimir automáticamente"
                description="Enviar a impresora al completar la venta"
                checked={config.imprimirAutomatico}
                onChange={(c) => onUpdate({ imprimirAutomatico: c })}
              />
              
              <Alert className="border-primary/20 bg-primary/5 mt-4">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary text-sm font-medium">Consejo</AlertTitle>
                <AlertDescription className="text-muted-foreground text-xs">
                  Cambia el formato y usa "Actualizar vista" para ver los cambios sin cerrar la ventana de preview.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Vista previa
            </Button>
            <Button variant="ghost" size="sm" onClick={onRefreshPreview} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
              {autoSavedAt && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Guardado {new Date(autoSavedAt).toLocaleTimeString()}</span>
                </motion.div>
              )}
            </AnimatePresence>
            
            {!enableAutosave && (
              <Button 
                onClick={onSave} 
                disabled={!changed}
                className={cn(
                  "gap-2",
                  changed && "shadow-md shadow-primary/20"
                )}
              >
                <Save className="h-4 w-4" />
                Guardar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </GlassPanel>
  )
}
