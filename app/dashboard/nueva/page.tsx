"use client"

import { Loader2, CheckCircle2, Printer, AlertCircle } from "lucide-react"
import { useSales } from "./hooks/use-sales"
import { SalesHeader } from "./components/SalesHeader"
import { ProductSearch } from "./components/ProductSearch"
import { Cart } from "./components/Cart"
import { CustomerForm } from "./components/CustomerForm"
import { PaymentMethod } from "./components/PaymentMethod"
import { SalesSummary } from "./components/SalesSummary"
import { BackgroundFX } from "./components/SharedUI"

export default function NuevaVentaPage() {
  const {
    busqueda,
    setBusqueda,
    mostrarResultados,
    setMostrarResultados,
    resultados,
    sortField,
    sortDir,
    toggleSort,
    blisterUnidadSeleccion,
    setBlisterUnidadSeleccion,
    agregarAlCarrito,
    carrito,
    cambiarCantidadCarrito,
    eliminarDelCarrito,
    total,
    dniCliente,
    setDniCliente,
    nombreCliente,
    setNombreCliente,
    usuarioSesion,
    metodoPago,
    setMetodoPago,
    montoEfectivo,
    setMontoEfectivo,
    montoYape,
    setMontoYape,
    faltante,
    vuelto,
    procesarVenta,
    ventaStatus,
    cajaAbierta,
    cargandoCaja,
    procesarVentaDisabled
  } = useSales()

  return (
    <div className="relative flex flex-col gap-8">
      {ventaStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
          <div className="flex flex-col items-center gap-6 p-10 rounded-2xl bg-card border shadow-2xl animate-in fade-in zoom-in duration-300 max-w-sm w-full text-center">
            {ventaStatus === "procesando" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Procesando Venta</h3>
                  <p className="text-muted-foreground">Registrando transacción...</p>
                </div>
              </>
            )}
            {ventaStatus === "exito" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                  <CheckCircle2 className="h-16 w-16 text-green-500 relative z-10 animate-in zoom-in duration-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400">¡Venta Exitosa!</h3>
                  <p className="text-muted-foreground">Transacción guardada correctamente</p>
                </div>
              </>
            )}
            {ventaStatus === "generando_boleta" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                  <Printer className="h-16 w-16 text-blue-500 relative z-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Generando Boleta</h3>
                  <p className="text-muted-foreground">Preparando documento de impresión...</p>
                </div>
              </>
            )}
            {ventaStatus === "error" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                  <AlertCircle className="h-16 w-16 text-red-500 relative z-10 animate-in shake" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Error</h3>
                  <p className="text-muted-foreground">No se pudo completar la venta</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <BackgroundFX />

      <SalesHeader cajaAbierta={cajaAbierta} />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <ProductSearch
            busqueda={busqueda}
            onSearchChange={setBusqueda}
            mostrarResultados={mostrarResultados}
            onToggleResultados={setMostrarResultados}
            resultados={resultados}
            sortField={sortField}
            sortDir={sortDir}
            onSort={toggleSort}
            blisterUnidadSeleccion={blisterUnidadSeleccion}
            setBlisterUnidadSeleccion={setBlisterUnidadSeleccion}
            onAddToCart={agregarAlCarrito}
          />

          <Cart
            items={carrito}
            onUpdateQuantity={cambiarCantidadCarrito}
            onRemove={eliminarDelCarrito}
            total={total}
          />
        </div>

        <div className="space-y-8">
          <CustomerForm
            dni={dniCliente}
            onDniChange={setDniCliente}
            nombre={nombreCliente}
            onNombreChange={setNombreCliente}
            vendedor={usuarioSesion?.nombreCompleto || ""}
          />

          <PaymentMethod
            metodo={metodoPago}
            onMetodoChange={setMetodoPago}
            montoEfectivo={montoEfectivo}
            onMontoEfectivoChange={setMontoEfectivo}
            montoYape={montoYape}
            onMontoYapeChange={setMontoYape}
            faltante={faltante}
          />

          <SalesSummary
            total={total}
            vuelto={vuelto}
            onProcess={procesarVenta}
            isDisabled={procesarVentaDisabled}
            cajaAbierta={cajaAbierta}
            cajaLoading={cargandoCaja}
          />
        </div>
      </div>
    </div>
  )
}
