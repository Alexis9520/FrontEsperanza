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
    <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
      {/* Fondo estandarizado - igual a Caja/Stock */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
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
