import React, { useMemo } from "react"
import { ShoppingBag, Download, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "./DataTable"
import { exportSalesByDay, exportSalesByProduct, type SalesByDay, type TopProduct } from "@/lib/api"
import { cn } from "@/lib/utils"

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }) : "—"

interface VentasTabProps {
  salesByDay: SalesByDay[]
  topProducts: TopProduct[]
  from: Date
  to: Date
}

export function VentasTab({ salesByDay, topProducts, from, to }: VentasTabProps) {
  const salesByDayCols = useMemo<Column<SalesByDay>[]>(() => [
    { key: "fecha", header: "Fecha" },
    { key: "tickets", header: "Tickets", align: "right" },
    { key: "unidades", header: "Unidades", align: "right" },
    { key: "ventas", header: "Ventas", align: "right", render: (r) => fmtMoney(r.ventas) },
    { key: "ticket_promedio", header: "Ticket Prom.", align: "right", render: (r) => fmtMoney(r.ticket_promedio) },
    { key: "upt", header: "UPT", align: "right" },
  ], [])

  const topProdCols = useMemo<Column<TopProduct>[]>(() => [
    { key: "codigo_barras", header: "Código" },
    { key: "nombre", header: "Producto", grow: true },
    { key: "categoria", header: "Categoría" },
    { key: "unidades", header: "Unidades", align: "right" },
    { key: "ventas", header: "Ventas", align: "right", render: (r) => fmtMoney(r.ventas) },
  ], [])

  return (
    <div className="space-y-6">
      <Card className={cn(
        "transition-all duration-300",
        "border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:shadow-md"
      )}>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
              </div>
              Ventas por Día
            </CardTitle>
            <CardDescription className="mt-1">Desglose diario del período seleccionado</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => exportSalesByDay({ from, to })}
            className="border-border/60 hover:bg-muted/50"
          >
            <Download className="w-4 h-4 mr-1.5" /> Descargar
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={salesByDayCols} data={salesByDay} />
        </CardContent>
      </Card>

      <Card className={cn(
        "transition-all duration-300",
        "border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:shadow-md"
      )}>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
              Top Productos
            </CardTitle>
            <CardDescription className="mt-1">Productos con mayor cantidad de ventas</CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => exportSalesByProduct({ from, to })}
            className="border-border/60 hover:bg-muted/50"
          >
            <Download className="w-4 h-4 mr-1.5" /> Descargar
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={topProdCols} data={topProducts} />
        </CardContent>
      </Card>
    </div>
  )
}
