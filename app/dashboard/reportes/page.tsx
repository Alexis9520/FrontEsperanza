"use client"

import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  FileBarChart2,
  Users,
  Boxes,
  Info,
  Truck,
  Package,
  ChevronRight,
  BarChart3,
  HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Hooks
import { useReportes } from "./hooks/use-reportes"

// Components
import { DateRangePicker } from "./components/DateRangePicker"
import { ExplainerModal } from "./components/ExplainerModal"
import { ResumenTab } from "./components/ResumenTab"
import { VentasTab } from "./components/VentasTab"
import { PedidosTab } from "./components/PedidosTab"
import { InventoryTable } from "./components/InventoryTable"
import { ProductsInventoryTable } from "./components/ProductsInventoryTable"
import { LotesTable } from "./components/LotesTable"
import CustomersTable from "./components/CustomersTable"

const tabs = [
  { value: "pedidos", label: "Pedidos", icon: Truck },
  { value: "inventario", label: "Inventario", icon: Boxes },
  // { value: "clientes", label: "Clientes", icon: Users },
]

export default function ReportesPage() {
  const [tab, setTab] = useState("inventario")
  const [helpOpen, setHelpOpen] = useState(false)

  const {
    from, setFrom,
    to, setTo,
    loading,
    summary,
    salesByDay,
    topProducts,
    payMix,
    caja,
    cajaCalculated
  } = useReportes()

  return (
    <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
      {/* Fondo estandarizado */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Reportes y Análisis</h1>
              <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                <FileBarChart2 className="h-3 w-3" />
                Análisis
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Explora, filtra y descarga información clave de tu farmacia
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {tab !== "pedidos" && (
            <DateRangePicker
              from={from}
              to={to}
              onChange={(f, t) => { setFrom(f); setTo(t) }}
            />
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setHelpOpen(true)}
            className="gap-2 text-muted-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Ayuda</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className={cn(
          "h-auto p-1 gap-1 flex-wrap",
          "bg-muted/40 border border-border/50 rounded-xl"
        )}>
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className={cn(
                "gap-2 rounded-lg px-4 py-2",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                "data-[state=active]:border-border/50 data-[state=active]:border",
                "transition-all duration-200"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="resumen">
          {caja && (
            <ResumenTab
              summary={summary}
              loading={loading}
              caja={cajaCalculated}
              payMix={payMix}
            />
          )}
        </TabsContent>

        <TabsContent value="ventas">
          <VentasTab
            salesByDay={salesByDay}
            topProducts={topProducts}
            from={from}
            to={to}
          />
        </TabsContent>

        <TabsContent value="pedidos">
          <PedidosTab isActive={tab === "pedidos"} />
        </TabsContent>

        <TabsContent value="inventario">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Inventario de Productos</CardTitle>
                    <CardDescription className="mt-0.5">
                      Gestiona el inventario, filtra por categoría y genera reportes
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ProductsInventoryTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lotes">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reporte de Lotes</CardTitle>
                  <CardDescription className="mt-0.5">
                    Visualiza los lotes ingresados en el período seleccionado
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LotesTable from={from} to={to} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="clientes">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Reporte de Clientes</CardTitle>
                  <CardDescription className="mt-0.5">
                    Top clientes por ventas, frecuencia y análisis de comportamiento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CustomersTable />
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      {/* Modal de ayuda */}
      {caja && (
        <ExplainerModal
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          data={{
            ventasTotal: summary?.ventas ?? 0,
            tickets: Number(summary?.tickets ?? 0),
            upt: Number(summary?.upt ?? 0),
            ticketPromedio: summary?.ticket_promedio ?? 0,
            ingresosTotales: cajaCalculated.cajaIngresosTotal,
            ingresosManuales: cajaCalculated.ingresosManuales,
            ventasEfectivo: cajaCalculated.ventasEfectivo,
            egresos: cajaCalculated.cajaEgresos,
            neto: cajaCalculated.cajaNetoRaw,
            margenPct: cajaCalculated.cajaMarginPct,
            payMix,
          }}
        />
      )}
    </div>
  )
}
