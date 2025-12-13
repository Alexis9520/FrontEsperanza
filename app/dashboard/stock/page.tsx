"use client"

import React, { useState, useEffect } from "react"
import { RefreshCcw, Package, AlertTriangle, TrendingDown, Boxes, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { clsx } from "clsx"

import { useStock } from "./hooks/use-stock-new"
import { useExpiringStock } from "./hooks/use-expiring-stock"
import { useLowStock } from "./hooks/use-low-stock"
import { StockFilters } from "./components/StockFiltersNew"
import { StockTable } from "./components/StockTableNew"
import { StockPagination } from "./components/StockPaginationNew"
import { ExpiringStockTable } from "./components/ExpiringStockTable"
import { LowStockTable } from "./components/LowStockTable"

interface Usuario {
  rol?: string
  nombre?: string
}

export default function StockPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("usuario")
    if (stored) {
      try {
        setUsuario(JSON.parse(stored))
      } catch { }
    }
  }, [])

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("general")

  // Redirigir a 'expiring' si es trabajador y está en 'general'
  useEffect(() => {
    if (usuario?.rol === "TRABAJADOR" && activeTab === "general") {
      setActiveTab("expiring")
    }
  }, [usuario])

  const isTrabajador = usuario?.rol === "TRABAJADOR"

  // Hook para inventario general
  const {
    stock,
    totalElements,
    totalPages,
    loading,
    page,
    setPage,
    size,
    setSize,
    filters,
    updateFilter,
    refresh
  } = useStock()

  // Hook para vencimientos
  const {
    expiringStock,
    loading: expiringLoading,
    withinDays,
    setWithinDays,
    refresh: refreshExpiring
  } = useExpiringStock()

  // Hook para bajo stock
  const {
    lowStockProducts,
    loading: lowStockLoading,
    threshold,
    setThreshold,
    page: lowStockPage,
    setPage: setLowStockPage,
    size: lowStockSize,
    setSize: setLowStockSize,
    totalElements: lowStockTotalElements,
    totalPages: lowStockTotalPages,
    refresh: refreshLowStock
  } = useLowStock()

  return (
    <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
      {/* Fondo sutil con gradientes muy suaves que respetan el tema */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* Gradiente base muy sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        {/* Acento primario muy difuso en esquina superior */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        {/* Acento secundario en esquina inferior */}
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
      </div>

      {/* Header con diseño más limpio */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Gestión de Stock</h1>
              <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                <Activity className="h-3 w-3" />
                En vivo
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Consulta y gestión del inventario en tiempo real
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        {/* Tabs mejorados con mejor contraste */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-1 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50">
          <TabsList className={`grid w-full sm:w-auto sm:max-w-lg ${isTrabajador ? "grid-cols-2" : "grid-cols-3"} bg-background/60`}>
            {!isTrabajador && (
              <TabsTrigger
                value="general"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Inventario</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="expiring"
              className="gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Por Vencer</span>
              {expiringStock.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  {expiringStock.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="lowstock"
              className="gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white transition-all"
            >
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Bajo Stock</span>
              {lowStockTotalElements > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  {lowStockTotalElements}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {!isTrabajador && (
          <TabsContent value="general" className="space-y-5 mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <StockFilters filters={filters} onFilterChange={updateFilter} />
              <Button
                size="sm"
                variant="outline"
                onClick={refresh}
                disabled={loading}
                className="gap-2 shrink-0 bg-background/60 backdrop-blur-sm hover:bg-background"
              >
                <RefreshCcw className={clsx("h-4 w-4", loading && "animate-spin")} />
                {loading ? "Actualizando..." : "Refrescar"}
              </Button>
            </div>

            <div className="space-y-4">
              <StockTable data={stock} loading={loading} />

              <StockPagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                size={size}
                onPageChange={setPage}
                onSizeChange={setSize}
                loading={loading}
              />
            </div>
          </TabsContent>
        )}

        <TabsContent value="expiring" className="mt-0">
          <ExpiringStockTable
            data={expiringStock}
            loading={expiringLoading}
            withinDays={withinDays}
            setWithinDays={setWithinDays}
            refresh={refreshExpiring}
          />
        </TabsContent>

        <TabsContent value="lowstock" className="mt-0">
          <LowStockTable
            data={lowStockProducts}
            loading={lowStockLoading}
            threshold={threshold}
            setThreshold={setThreshold}
            refresh={refreshLowStock}
            page={lowStockPage}
            setPage={setLowStockPage}
            size={lowStockSize}
            setSize={setLowStockSize}
            totalElements={lowStockTotalElements}
            totalPages={lowStockTotalPages}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
