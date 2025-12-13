"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, History, Settings2, Wallet, Activity, Loader2 } from "lucide-react"
import { CajaHeader } from "./components/CajaHeader"
import { CajaStatus } from "./components/CajaStatus"
import { MovimientosList } from "./components/MovimientosList"
import { HistorialCaja } from "./components/HistorialCaja"
import { ResumenDiario } from "./components/ResumenDiario"
import { useCaja } from "./hooks/use-caja"

export default function CajaPage() {
  const {
    usuario,
    cajaAbierta,
    resumen,
    movimientos,
    historial,
    loading,
    historialLoading,
    historialPage,
    historialPageSize,
    historialTotal,
    historialLoadAll,
    setHistorialPage,
    setHistorialPageSize,
    toggleHistorialLoadAll,
    abrirCaja,
    cerrarCaja,
    registrarMovimiento
  } = useCaja()

  const [activeTab, setActiveTab] = useState("gestion")

  if (loading && !resumen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
          <div className="text-center">
            <p className="font-medium">Cargando sistema de caja</p>
            <p className="text-sm text-muted-foreground">Por favor espere...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
      {/* Fondo sutil con gradientes muy suaves que respetan el tema */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
      </div>

      <CajaHeader
        cajaAbierta={cajaAbierta}
        usuario={usuario}
        resumen={resumen}
        onAbrirCaja={() => setActiveTab("gestion")}
        onCerrarCaja={() => setActiveTab("gestion")}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsList className={`grid w-full sm:w-auto sm:max-w-lg ${usuario?.rol === "TRABAJADOR" ? "grid-cols-2" : "grid-cols-3"} bg-background/60`}>
            <TabsTrigger
              value="movimientos"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Movimientos</span>
            </TabsTrigger>
            <TabsTrigger
              value="gestion"
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Gestión</span>
            </TabsTrigger>
            {usuario?.rol !== "TRABAJADOR" && (
              <TabsTrigger
                value="historial"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Historial</span>
                {historial.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-muted">
                    {historial.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="movimientos" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-5 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <MovimientosList
                movimientos={movimientos}
                onNuevoMovimiento={registrarMovimiento}
                cajaAbierta={cajaAbierta}
              />
            </div>
            <div className="lg:col-span-1">
              <ResumenDiario resumen={resumen} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gestion" className="mt-0 focus-visible:outline-none">
          <div className="mx-auto max-w-2xl py-6">
            <CajaStatus
              cajaAbierta={cajaAbierta}
              resumen={resumen}
              onAbrirCaja={abrirCaja}
              onCerrarCaja={cerrarCaja}
            />
          </div>
        </TabsContent>

        {usuario?.rol !== "TRABAJADOR" && (
          <TabsContent value="historial" className="mt-0 focus-visible:outline-none">
            <div className="h-[600px]">
              <HistorialCaja
                historial={historial}
                loading={historialLoading}
                currentPage={historialPage}
                pageSize={historialPageSize}
                totalElements={historialTotal}
                loadAll={historialLoadAll}
                onChangePage={setHistorialPage}
                onChangePageSize={setHistorialPageSize}
                onToggleLoadAll={toggleHistorialLoadAll}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
