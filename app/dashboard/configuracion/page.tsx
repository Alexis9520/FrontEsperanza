"use client"

import { motion } from "framer-motion"
import { RotateCcw, Settings, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RoleGuard } from "@/components/RoleGuard"
import { useConfiguracion } from "./hooks/use-configuracion"
import { GeneralConfig } from "./components/GeneralConfig"
import { BoletaConfig } from "./components/BoletaConfig"
import { NotificationsConfig } from "./components/NotificationsConfig"
import { AppearanceConfig } from "./components/AppearanceConfig"
import { TicketPreview } from "./components/TicketPreview"
import { cn } from "@/lib/utils"

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

export default function ConfiguracionPage() {
  const {
    theme,
    setTheme,
    configuracionGeneral,
    configuracionBoleta,
    configuracionNotificaciones,
    setConfiguracionNotificaciones,
    ventaParaPreview,
    moneda,
    changedGeneral,
    changedBoleta,
    autoSavedGeneralAt,
    autoSavedBoletaAt,
    updateGeneral,
    updateBoleta,
    guardarConfiguracionGeneral,
    guardarConfiguracionBoleta,
    guardarConfiguracionNotificaciones,
    resetearConfiguracion,
    vistaPreviaTicket,
    reenviarJob,
    ENABLE_AUTOSAVE
  } = useConfiguracion()

  return (
    <RoleGuard allowedRoles={["administrador"]}>
      <TooltipProvider delayDuration={120}>
        <div className="min-h-screen w-full p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <motion.div 
              variants={fadeIn} 
              initial="hidden" 
              animate="visible" 
              className="flex flex-col gap-4"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">Configuración</span>
              </div>

              {/* Title row */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Personaliza el sistema según tu flujo operativo
                    </p>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetearConfiguracion}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restablecer
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Restaurar valores por defecto</TooltipContent>
                </Tooltip>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className={cn(
                  "w-full flex flex-wrap h-auto p-1 gap-1",
                  "bg-muted/40 border border-border/50 rounded-xl"
                )}>
                  {[
                    { value: "general", label: "General" },
                    { value: "boletas", label: "Boletas" },
                    { value: "notificaciones", label: "Notificaciones" },
                    { value: "apariencia", label: "Apariencia" },
                    { value: "preview", label: "Preview" },
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      className={cn(
                        "flex-1 min-w-[100px] rounded-lg py-2 px-3",
                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                        "data-[state=active]:border-border/50 data-[state=active]:border",
                        "transition-all duration-200"
                      )}
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="general">
                  <motion.div variants={fadeIn}>
                    <GeneralConfig
                      config={configuracionGeneral}
                      onUpdate={updateGeneral}
                      onSave={guardarConfiguracionGeneral}
                      changed={changedGeneral}
                      autoSavedAt={autoSavedGeneralAt}
                      enableAutosave={ENABLE_AUTOSAVE}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="boletas">
                  <motion.div variants={fadeIn}>
                    <BoletaConfig
                      config={configuracionBoleta}
                      onUpdate={updateBoleta}
                      onSave={guardarConfiguracionBoleta}
                      onPreview={vistaPreviaTicket}
                      onRefreshPreview={reenviarJob}
                      changed={changedBoleta}
                      autoSavedAt={autoSavedBoletaAt}
                      enableAutosave={ENABLE_AUTOSAVE}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="notificaciones">
                  <motion.div variants={fadeIn}>
                    <NotificationsConfig
                      config={configuracionNotificaciones}
                      onUpdate={(patch) => setConfiguracionNotificaciones(prev => ({ ...prev, ...patch }))}
                      onSave={guardarConfiguracionNotificaciones}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="apariencia">
                  <motion.div variants={fadeIn}>
                    <AppearanceConfig
                      theme={theme}
                      setTheme={setTheme}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="preview">
                  <motion.div variants={fadeIn}>
                    <TicketPreview
                      venta={ventaParaPreview}
                      confGen={configuracionGeneral}
                      confBol={configuracionBoleta}
                      moneda={moneda}
                      onPreview={vistaPreviaTicket}
                      onRefresh={reenviarJob}
                    />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    </RoleGuard>
  )
}
