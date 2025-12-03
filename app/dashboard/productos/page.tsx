"use client"

import { useProductos } from "./hooks/use-productos"
import { ProductHeader } from "./components/ProductHeader"
import { ProductMetrics } from "./components/ProductMetrics"
import { ProductFilters } from "./components/ProductFilters"
import { ProductTable } from "./components/ProductTable"
import { ProductDialogs } from "./components/ProductDialogs"

export default function ProductosPage() {
  const {
    // State
    productos,
    busqueda,
    setBusqueda,
    expandedRows,
    densityCompact,
    setDensityCompact,
    loading,
    diccionarioProveedores,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    nuevoProducto,
    setNuevoProducto,
    editandoProducto,
    setEditandoProducto,
    productoAEliminar,
    setProductoAEliminar,
    eliminando,
    lotesModalProducto,
    setLotesModalProducto,
    editingStock,
    setEditingStock,
    stockToDelete,
    setStockToDelete,
    deletingStock,
    creatingStockFor,
    setCreatingStockFor,
    priceCompareProduct,
    setPriceCompareProduct,
    metricas,
    globalMetricasLoading,
    
    // Actions
    cargarProductos,
    setRefreshTick,
    agregarProducto,
    iniciarEdicion,
    guardarEdicion,
    eliminarProductoPorId,
    eliminarStock,
    toggleExpand
  } = useProductos()

  const startIndex = (page - 1) * pageSize + 1
  const endIndex = startIndex + productos.length - 1

  return (
    <div className="relative flex flex-col gap-8 pb-20">
      {/* Fondo simplificado */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_65%),linear-gradient(140deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.10)_0_2px,transparent_2px_10px)]" />
      </div>

      <ProductHeader
        loading={loading}
        onRefresh={() => {
          cargarProductos()
          setRefreshTick(t => t + 1)
        }}
        densityCompact={densityCompact}
        onToggleDensity={() => setDensityCompact(d => !d)}
        nuevoProducto={nuevoProducto}
        setNuevoProducto={setNuevoProducto}
        diccionarioProveedores={diccionarioProveedores}
        onGuardar={agregarProducto}
      />

      <ProductMetrics
        metricas={metricas}
        loading={globalMetricasLoading}
      />

      <ProductFilters
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        loading={loading}
        totalElements={totalElements}
        pageSize={pageSize}
        setPageSize={setPageSize}
        setPage={setPage}
        startIndex={startIndex}
        endIndex={endIndex}
      />

      <ProductTable
        productos={productos}
        loading={loading}
        expandedRows={expandedRows}
        toggleExpand={toggleExpand}
        densityCompact={densityCompact}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        onEdit={iniciarEdicion}
        onDelete={setProductoAEliminar}
        onSetCreatingStockFor={setCreatingStockFor}
        onSetLotesModalProducto={setLotesModalProducto}
        onComparePrice={setPriceCompareProduct}
      />

      <ProductDialogs
        lotesModalProducto={lotesModalProducto}
        setLotesModalProducto={setLotesModalProducto}
        editingStock={editingStock}
        setEditingStock={setEditingStock}
        creatingStockFor={creatingStockFor}
        setCreatingStockFor={setCreatingStockFor}
        productoAEliminar={productoAEliminar}
        setProductoAEliminar={setProductoAEliminar}
        eliminando={eliminando}
        onEliminarProducto={async () => {
          if (productoAEliminar) {
            await eliminarProductoPorId(productoAEliminar.id)
            setProductoAEliminar(null)
          }
        }}
        stockToDelete={stockToDelete}
        setStockToDelete={setStockToDelete}
        deletingStock={deletingStock}
        onEliminarStock={eliminarStock}
        editandoProducto={editandoProducto}
        setEditandoProducto={setEditandoProducto}
        diccionarioProveedores={diccionarioProveedores}
        onGuardarEdicion={guardarEdicion}
        onRefresh={() => {
          setRefreshTick(t => t + 1)
          cargarProductos()
        }}
        priceCompareProduct={priceCompareProduct}
        setPriceCompareProduct={setPriceCompareProduct}
      />
    </div>
  )
}
