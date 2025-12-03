import React, { useMemo } from "react"
import { Truck, FileText, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable, Column } from "./DataTable"
import { usePedidosReport } from "../hooks/use-pedidos-report"
import { type PedidoReportDTO } from "@/lib/api"
import { cn } from "@/lib/utils"

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }) : "—"

export function PedidosTab({ isActive }: { isActive: boolean }) {
  const {
    proveedores,
    selectedProvider, setSelectedProvider,
    fechaPedido, setFechaPedido,
    pedidosData,
    loadingPedidos,
    selectedKeys, setSelectedKeys,
    generarPDFPedido,
    navigateToPedidosView
  } = usePedidosReport(isActive)

  const pedidosCols = useMemo<Column<PedidoReportDTO>[]>(() => [
    { key: "codigoBarras", header: "Cód. Barras" },
    {
      key: "producto", header: "Producto", grow: true, render: (r) => (
        <div>
          <div className="font-medium">{r.producto}</div>
          <div className="text-xs text-muted-foreground">{r.concentracion} {r.presentacion}</div>
        </div>
      )
    },
    { key: "codigoStock", header: "Lote (Stock)", fontMono: true },
    { key: "cantUnidades", header: "Cant. Actual", align: "right" },
    { key: "cantInicial", header: "Cant. Inicial", align: "right", className: "text-muted-foreground" },
    { key: "precioCompra", header: "P. Compra", align: "right", render: (r) => fmtMoney(r.precioCompra) },
    { key: "fvencimiento", header: "Vencimiento", className: "whitespace-nowrap" },
    { key: "fcreacion", header: "Fecha Ingreso", className: "text-xs text-muted-foreground whitespace-nowrap", render: (r) => r.fcreacion ? new Date(r.fcreacion).toLocaleString() : "-" },
  ], [])

  return (
    <Card className={cn(
      "transition-all duration-300",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "border-emerald-500/20 bg-emerald-500/[0.02]",
      "hover:shadow-md"
    )}>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Truck className="w-4 h-4 text-emerald-500" />
              </div>
              Reporte de Pedidos
            </CardTitle>
            <CardDescription className="mt-1">
              Consulta los productos ingresados filtrando por proveedor y fecha de pedido.
            </CardDescription>
          </div>

          {/* Filtros y Botón Exportar */}
          <div className="flex flex-col xl:flex-row gap-3 items-end">
            <div className="flex flex-col gap-1.5 w-full sm:w-40">
              <Label htmlFor="fechaPedido" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha de Pedido</Label>
              <Input
                id="fechaPedido"
                type="date"
                value={fechaPedido}
                onChange={(e) => setFechaPedido(e.target.value)}
                className={cn(
                  "h-9 bg-background/80 border-border/60",
                  "focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-64">
              <Label htmlFor="proveedorSelect" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Proveedor</Label>
              <select
                id="proveedorSelect"
                className={cn(
                  "flex h-9 w-full rounded-md border border-border/60 bg-background/80 px-3 py-1 text-sm shadow-sm",
                  "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/50",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="">-- Todos / Sin filtro --</option>
                {proveedores.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.razonComercial} ({prov.ruc})
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÓN PDF */}
            <Button
              variant="outline"
              className="gap-2 border-red-500/40 hover:bg-red-500/10 text-red-600 dark:text-red-400 hover:text-red-700"
              onClick={generarPDFPedido}
              disabled={pedidosData.length === 0}
            >
              <FileText className="w-4 h-4" />
              Exportar PDF {selectedKeys.length > 0 && `(${selectedKeys.length})`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="ml-2 hover:bg-muted/50"
              onClick={navigateToPedidosView}
              disabled={pedidosData.length === 0}
            >
              Más acciones
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingPedidos ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
            <p className="text-sm">Cargando reporte de pedidos...</p>
          </div>
        ) : (
          <DataTable
            columns={pedidosCols}
            data={pedidosData}
            enableSelection={true}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            keyExtractor={(item) => item.codigoStock}
            emptyMessage={
              <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-sm">No se encontraron registros para la fecha {fechaPedido} {selectedProvider ? "y el proveedor seleccionado" : ""}.</p>
              </div>
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
