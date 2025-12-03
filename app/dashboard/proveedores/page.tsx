"use client"

import React, { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

import { useProveedores } from "./hooks/use-proveedores"
import { ProveedoresHeader } from "./components/ProveedoresHeader"
import { ProveedoresTable } from "./components/ProveedoresTable"
import { ProveedoresDialogs } from "./components/ProveedoresDialogs"
import { NewOrderDialog } from "./components/NewOrderDialog"
import PedidosTablex from "./components/PedidosTablex"

/* =========================================================
   COMPONENTE PRINCIPAL
======================================================== */
export default function ProveedoresPage() {
  const {
    activeView,
    setActiveView,
    proveedoresFiltrados,
    busqueda,
    setBusqueda,
    loading,
    cargarProveedores,
    
    nuevoProveedor,
    setNuevoProveedor,
    showNuevoDialog,
    setShowNuevoDialog,
    agregarProveedor,

    editandoProveedor,
    setEditandoProveedor,
    iniciarEdicion,
    guardarEdicion,
    cerrarEdicion,

    proveedorAEliminar,
    setProveedorAEliminar,
    eliminando,
    eliminarProveedorPorId,

    // Pedidos
    showPedidoDialog,
    setShowPedidoDialog,
    proveedorPedido,
    loadingProductos,
    filtroProducto,
    setFiltroProducto,
    fechaPedido,
    setFechaPedido,
    lotesPorProducto,
    productoExpandido,
    setProductoExpandido,
    enviandoPedido,
    abrirDialogoPedido,
    agregarLoteAProducto,
    removerLote,
    updateLote,
    enviarPedido,
    productosFiltrados
  } = useProveedores()

  /* =========================================================
     RENDER HELPERS
  ========================================================= */
  function PedidosWrapper() {
    // Client-only wrapper to safely call useSearchParams inside Suspense
    const sp = useSearchParams()
    return (
      <PedidosTablex
        initialProviderId={sp?.get('proveedor') ?? undefined}
        initialFecha={sp?.get('fecha') ?? undefined}
      />
    )
  }

  function SearchParamsListener({ onChange }: { onChange: (sp: URLSearchParams | null) => void }) {
    const sp = useSearchParams()
    useEffect(() => {
      onChange(sp)
    }, [sp, onChange])
    return null
  }

  return (
    <div className="relative flex flex-col gap-8 pb-20">
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_65%),linear-gradient(140deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.10)_0_2px,transparent_2px_10px)]" />
      </div>

      {/* Header */}
      <ProveedoresHeader
        activeView={activeView}
        setActiveView={setActiveView}
        loading={loading}
        onRefresh={cargarProveedores}
        showNuevoDialog={showNuevoDialog}
        setShowNuevoDialog={setShowNuevoDialog}
        nuevoProveedor={nuevoProveedor}
        setNuevoProveedor={setNuevoProveedor}
        onAgregar={agregarProveedor}
      />

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por RUC, razón comercial o correo..."
          className="pl-9 bg-background/60 backdrop-blur-sm"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Listen to search params in a Suspense-wrapped client component */}
      <React.Suspense fallback={null}>
        <SearchParamsListener onChange={(sp) => {
          if (!sp) return
          const v = sp.get('view')
          if (v === 'pedidos') setActiveView('pedidos')
        }} />
      </React.Suspense>

      {activeView === 'proveedores' ? (
      <Card className="relative overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-cyan-400" />
            Proveedores ({proveedoresFiltrados.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Lista de proveedores registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProveedoresTable
            proveedores={proveedoresFiltrados}
            loading={loading}
            onEdit={iniciarEdicion}
            onDelete={setProveedorAEliminar}
            onNewOrder={abrirDialogoPedido}
          />
        </CardContent>
      </Card>
      ) : (
        <React.Suspense fallback={<div className="py-6 text-center text-muted-foreground">Cargando pedidos...</div>}>
          <PedidosWrapper />
        </React.Suspense>
      )}

      {/* DIALOG: NUEVO PEDIDO (STOCK) */}
      <NewOrderDialog
        open={showPedidoDialog}
        onOpenChange={setShowPedidoDialog}
        proveedor={proveedorPedido}
        fechaPedido={fechaPedido}
        setFechaPedido={setFechaPedido}
        filtroProducto={filtroProducto}
        setFiltroProducto={setFiltroProducto}
        loadingProductos={loadingProductos}
        productosFiltrados={productosFiltrados}
        lotesPorProducto={lotesPorProducto}
        productoExpandido={productoExpandido}
        setProductoExpandido={setProductoExpandido}
        agregarLoteAProducto={agregarLoteAProducto}
        removerLote={removerLote}
        updateLote={updateLote}
        enviarPedido={enviarPedido}
        enviandoPedido={enviandoPedido}
      />

      {/* DIALOGS: EDITAR Y ELIMINAR */}
      <ProveedoresDialogs
        editandoProveedor={editandoProveedor}
        setEditandoProveedor={setEditandoProveedor}
        cerrarEdicion={cerrarEdicion}
        guardarEdicion={guardarEdicion}
        proveedorAEliminar={proveedorAEliminar}
        setProveedorAEliminar={setProveedorAEliminar}
        eliminando={eliminando}
        eliminarProveedorPorId={eliminarProveedorPorId}
      />
    </div>
  )
}