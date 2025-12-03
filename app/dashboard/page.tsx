"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ShoppingBag,
  DollarSign,
  Users,
  RefreshCcw,
  LayoutDashboard,
  ChevronRight,
  Activity,
  Sparkles
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Spinner from "@/components/ui/Spinner"
import SalesChart from "@/components/sales-chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import {
  KpiCard,
  CajaCard,
  RecentSalesCard,
  TopProductsCard,
  CriticalStockCard,
  ExpiringProductsCard,
  PedidosCard,
  ProveedoresCard,
  type VentasDia,
  type VentasMes,
  type SaldoCaja,
  type ClientesAtendidos,
  type VentaReciente,
  type ProductoMasVendido,
  type ProductoCritico,
  type ProductoVencimiento,
  type Pedidos,
  type Proveedores
} from "./components"

type VentasPorHora = { hora: string; total: number }

// Format money helper
function formatMoney(v?: number) {
  if (typeof v !== "number" || isNaN(v)) return "0.00"
  return v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = (user?.rol || "").toLowerCase() === "administrador"

  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<"resumen" | "ventas" | "inventario" | "proveedores">("resumen")
  
  // Data states
  const [ventasDia, setVentasDia] = useState<VentasDia>({ monto: 0, variacion: 0 })
  const [ventasMes, setVentasMes] = useState<VentasMes>({ monto: 0, variacion: 0 })
  const [saldoCaja, setSaldoCaja] = useState<SaldoCaja>({ total: 0, efectivo: 0, yape: 0 })
  const [clientesAtendidos, setClientesAtendidos] = useState<ClientesAtendidos>({ cantidad: 0, variacion: 0 })
  const [ultimasVentas, setUltimasVentas] = useState<VentaReciente[]>([])
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([])
  const [productosCriticos, setProductosCriticos] = useState<ProductoCritico[]>([])
  const [productosVencimiento, setProductosVencimiento] = useState<ProductoVencimiento[]>([])
  const [pedidos, setPedidos] = useState<Pedidos | null>(null)
  const [proveedores, setProveedores] = useState<Proveedores | null>(null)
  const [ventasPorHora, setVentasPorHora] = useState<VentasPorHora[]>([])

  // Redirect non-admin users
  useEffect(() => {
    if (authLoading) return
    if (user && !isAdmin) {
      router.replace("/dashboard/ventas")
    }
  }, [authLoading, user, isAdmin, router])

  // Fetch dashboard data
  const fetchResumen = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await fetchWithAuth(apiUrl("/api/dashboard/resumen"), {}, toast)
      if (data) {
        setVentasDia(data.ventasDia || { monto: 0, variacion: 0 })
        setVentasMes(data.ventasMes || { monto: 0, variacion: 0 })
        setSaldoCaja(data.saldoCaja || { total: 0, efectivo: 0, yape: 0 })
        setClientesAtendidos(data.clientesAtendidos || { cantidad: 0, variacion: 0 })
        setUltimasVentas(data.ultimasVentas || [])
        setProductosMasVendidos(data.productosMasVendidos || [])
        setProductosCriticos(data.productosCriticos || [])
        setProductosVencimiento(data.productosVencimiento || [])
        setPedidos(data.pedidos || null)
        setProveedores(data.proveedores || null)
      }
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [toast])

  // Initial load
  useEffect(() => {
    if (authLoading || !isAdmin) return
    fetchResumen()
  }, [authLoading, isAdmin, fetchResumen])

  // Fetch ventas por hora
  useEffect(() => {
    if (authLoading || !isAdmin) return
    fetchWithAuth(apiUrl("api/dashboard/ventas-por-hora"), {}, toast)
      .then((data) => setVentasPorHora(data ?? []))
      .catch(() => setVentasPorHora([]))
  }, [authLoading, isAdmin, toast])

  // Loading state
  if (authLoading || !user) return <Spinner />
  if (!isAdmin) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Resumen</span>
      </nav>

      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Dashboard
              <Sparkles className="h-5 w-5 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Vista general del rendimiento • {new Date().toLocaleDateString("es-PE", { 
                weekday: "long", 
                day: "numeric", 
                month: "long" 
              })}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResumen}
          disabled={refreshing}
          className="gap-2 border-border/60 hover:bg-muted/50"
        >
          <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ventas del Día"
          value={`S/ ${formatMoney(ventasDia.monto)}`}
          variation={ventasDia.variacion}
          hint="vs. ayer"
          icon={ShoppingBag}
          accent="emerald"
          loading={loading}
        />
        <KpiCard
          title="Ventas del Mes"
          value={`S/ ${formatMoney(ventasMes.monto)}`}
          variation={ventasMes.variacion}
          hint="vs. mes anterior"
          icon={DollarSign}
          accent="blue"
          loading={loading}
        />
        <CajaCard saldo={saldoCaja} loading={loading} />
        <KpiCard
          title="Clientes Atendidos"
          value={clientesAtendidos.cantidad.toString()}
          variation={clientesAtendidos.variacion}
          hint="vs. ayer"
          icon={Users}
          accent="violet"
          loading={loading}
        />
      </section>

      {/* Tabs */}
      <Tabs 
        value={tab} 
        onValueChange={(v) => setTab(v as typeof tab)}
        className="space-y-6"
      >
        <TabsList className={cn(
          "w-full md:w-auto justify-start gap-1 p-1",
          "bg-muted/50 backdrop-blur-sm border border-border/50"
        )}>
          <TabsTrigger 
            value="resumen"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Resumen
          </TabsTrigger>
          <TabsTrigger 
            value="ventas"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Ventas
          </TabsTrigger>
          <TabsTrigger 
            value="inventario"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Inventario
          </TabsTrigger>
          <TabsTrigger 
            value="proveedores"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Proveedores
          </TabsTrigger>
        </TabsList>

        {/* Resumen Tab */}
        <TabsContent value="resumen" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Sales */}
            <div className="lg:col-span-2 space-y-6">
              <RecentSalesCard ventas={ultimasVentas} loading={loading} />
            </div>
            
            {/* Right column - Alerts */}
            <div className="space-y-6">
              <CriticalStockCard productos={productosCriticos} loading={loading} />
              <ExpiringProductsCard productos={productosVencimiento} loading={loading} />
            </div>
          </div>
        </TabsContent>

        {/* Ventas Tab */}
        <TabsContent value="ventas" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Chart */}
            <Card className={cn(
              "lg:col-span-4",
              "border-border/50 bg-card/50 backdrop-blur-sm",
              "transition-all duration-300 hover:shadow-md"
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  Ritmo de Ventas (24h)
                </CardTitle>
                <CardDescription>Comparativo por hora</CardDescription>
              </CardHeader>
              <CardContent>
                {ventasPorHora.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Sin datos de ventas por hora</p>
                  </div>
                ) : (
                  <SalesChart data={ventasPorHora} />
                )}
              </CardContent>
            </Card>

            {/* Recent sales */}
            <div className="lg:col-span-3">
              <RecentSalesCard ventas={ultimasVentas} loading={loading} />
            </div>
          </div>
        </TabsContent>

        {/* Inventario Tab */}
        <TabsContent value="inventario" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Top products */}
            <div className="lg:col-span-4">
              <TopProductsCard productos={productosMasVendidos} loading={loading} />
            </div>

            {/* Alerts column */}
            <div className="lg:col-span-3 space-y-6">
              <CriticalStockCard productos={productosCriticos} loading={loading} />
              <ExpiringProductsCard productos={productosVencimiento} loading={loading} />
            </div>
          </div>
        </TabsContent>

        {/* Proveedores Tab */}
        <TabsContent value="proveedores" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid gap-6 lg:grid-cols-2">
            {pedidos && <PedidosCard pedidos={pedidos} loading={loading} />}
            {proveedores && <ProveedoresCard proveedores={proveedores} loading={loading} />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
