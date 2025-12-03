"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  X
} from "lucide-react"
import clsx from "clsx"
import { ProductDTO, NewStockLot } from "@/lib/api"
import { Proveedor } from "../types"
import { PriceComparisonPopover } from "./PriceComparisonPopover"

interface NewOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proveedor: Proveedor | null
  fechaPedido: string
  setFechaPedido: (date: string) => void
  filtroProducto: string
  setFiltroProducto: (filter: string) => void
  loadingProductos: boolean
  productosFiltrados: ProductDTO[]
  lotesPorProducto: Record<number, NewStockLot[]>
  productoExpandido: number | null
  setProductoExpandido: (id: number | null) => void
  agregarLoteAProducto: (id: number) => void
  removerLote: (prodId: number, index: number) => void
  updateLote: (prodId: number, index: number, field: keyof NewStockLot, value: any) => void
  enviarPedido: () => void
  enviandoPedido: boolean
}

export function NewOrderDialog({
  open,
  onOpenChange,
  proveedor,
  fechaPedido,
  setFechaPedido,
  filtroProducto,
  setFiltroProducto,
  loadingProductos,
  productosFiltrados,
  lotesPorProducto,
  productoExpandido,
  setProductoExpandido,
  agregarLoteAProducto,
  removerLote,
  updateLote,
  enviarPedido,
  enviandoPedido
}: NewOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-6 w-6 text-emerald-500" />
            Nuevo Pedido: <span className="text-emerald-600">{proveedor?.razonComercial}</span>
          </DialogTitle>
          <DialogDescription>
            Busca productos de este proveedor y agrega lotes para reabastecer el stock.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6 flex-1 min-h-0">
          {/* Barra Superior: Fecha y Filtro */}
          <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
            <div className="space-y-1.5 w-full sm:w-1/3">
              <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                 <CalendarIcon className="h-3.5 w-3.5" /> Fecha del Pedido
              </Label>
              <Input type="date" value={fechaPedido} onChange={(e) => setFechaPedido(e.target.value)} />
            </div>
            <div className="space-y-1.5 w-full sm:w-2/3 relative">
              <Label className="text-xs text-muted-foreground">Buscar Producto</Label>
              <Search className="absolute left-2.5 top-8 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Nombre o Código de Barras..." 
                className="pl-9" 
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Productos (Scrollable) */}
          <div className="border rounded-lg bg-muted/10 flex-1 overflow-hidden flex flex-col">
            <div className="bg-muted/50 p-2 text-xs font-medium grid grid-cols-12 gap-2 border-b px-4">
              <div className="col-span-6 sm:col-span-5">Producto</div>
              <div className="col-span-4 sm:col-span-3">Código</div>
              <div className="col-span-2 sm:col-span-2 text-center">Stock Actual</div>
              <div className="col-span-2 text-right">Acción</div>
            </div>
            
            <ScrollArea className="flex-1">
              {loadingProductos ? (
                 <div className="flex justify-center items-center h-40"><RefreshCw className="animate-spin h-8 w-8 text-muted-foreground"/></div>
              ) : productosFiltrados.length === 0 ? (
                 <div className="text-center py-10 text-muted-foreground">No hay productos coincidentes.</div>
              ) : (
                <div className="divide-y">
                  {productosFiltrados.map(prod => {
                    const lotesAgregados = lotesPorProducto[prod.id] || [];
                    const isExpanded = productoExpandido === prod.id;
                    const totalAgregado = lotesAgregados.reduce((acc, l) => acc + (Number(l.cantidadUnidades) || 0), 0);

                    // Detalle de lotes incompletos para mostrar en el tooltip junto al nombre del producto
                    const incompleteDetails = lotesAgregados.map((lote, idx) => {
                      const missing: string[] = []
                      if (!(Number(lote.cantidadUnidades) > 0)) missing.push('cantidad')
                      if (!(Number(lote.precioCompra) > 0)) missing.push('precio')
                      if (!lote.fechaVencimiento) missing.push('fecha')
                      if (missing.length) return `Lote ${lote.codigoStock || (idx + 1)}: ${missing.join(', ')}`
                      return null
                    }).filter(Boolean) as string[]

                    return (
                      <div key={prod.id} className={clsx("transition-colors", isExpanded ? "bg-muted/20" : "hover:bg-muted/10")}>
                        {/* Fila Principal del Producto */}
                        <div 
                          className="grid grid-cols-12 gap-2 p-3 px-4 items-center cursor-pointer"
                          onClick={() => setProductoExpandido(isExpanded ? null : prod.id)}
                        >
                          <div className="col-span-6 sm:col-span-5 flex flex-col">
                            <span className="font-semibold text-sm truncate flex items-center">
                              {prod.nombre}
                              {incompleteDetails.length > 0 && (
                                <span title={incompleteDetails.join(' • ')} className="ml-2 inline-flex items-center text-amber-600 text-xs">
                                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-1" aria-hidden="true" />
                                  <span>Faltan campos</span>
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{prod.concentracion} - {prod.presentacion}</span>
                          </div>
                          <div className="col-span-4 sm:col-span-3 text-xs text-muted-foreground font-mono">{prod.codigoBarras}</div>
                          <div className="col-span-2 sm:col-span-2 text-center">
                            <Badge variant="outline" className="tabular-nums">{prod.cantidadGeneral}</Badge>
                            {totalAgregado > 0 && (
                              <Badge variant="default" className="ml-1 bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5">+{totalAgregado}</Badge>
                            )}
                          </div>
                          <div className="col-span-2 text-right flex justify-end items-center gap-1">
                             <PriceComparisonPopover
                               productoId={prod.id}
                               productoNombre={prod.nombre}
                               proveedorActualId={proveedor?.id}
                             />
                             {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground"/> : <ChevronRight className="h-4 w-4 text-muted-foreground"/>}
                          </div>
                        </div>

                        {/* Panel Desplegable para Agregar Lotes */}
                        {isExpanded && (
                          <div className="bg-background/50 p-4 border-t shadow-inner">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Package className="h-3 w-3"/> Lotes a ingresar
                              </h4>
                              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => agregarLoteAProducto(prod.id)}>
                                <Plus className="h-3 w-3"/> Agregar Lote
                              </Button>
                            </div>

                            {lotesAgregados.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic py-2">No has agregado lotes para este pedido.</p>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2 text-[10px] font-medium text-muted-foreground px-1">
                                  <div className="col-span-3">Cód. Lote</div>
                                  <div className="col-span-2">Cant.</div>
                                  <div className="col-span-3">Vencimiento</div>
                                  <div className="col-span-3">P. Compra (Unit)</div>
                                  <div className="col-span-1"></div>
                                </div>
                                {lotesAgregados.map((lote, idx) => (
                                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-3">
                                      <Input 
                                        className="h-8 text-xs" 
                                        placeholder="LOTE-123" 
                                        value={lote.codigoStock}
                                        onChange={(e) => updateLote(prod.id, idx, 'codigoStock', e.target.value)}
                                      />
                                    </div>
                                    <div className="col-span-2">
                                      <Input 
                                        type="number" 
                                        className="h-8 text-xs" 
                                        placeholder="0" 
                                        value={lote.cantidadUnidades || ""}
                                        onChange={(e) => updateLote(prod.id, idx, 'cantidadUnidades', parseInt(e.target.value) || 0)}
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <Input 
                                        type="date" 
                                        className="h-8 text-xs px-2" 
                                        value={lote.fechaVencimiento || ""}
                                        onChange={(e) => updateLote(prod.id, idx, 'fechaVencimiento', e.target.value)}
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <div className="relative">
                                        <span className="absolute left-2 top-2 text-xs text-muted-foreground">$</span>
                                        <Input 
                                          type="number" 
                                          className="h-8 text-xs pl-5" 
                                          placeholder="0.00" 
                                          value={lote.precioCompra || ""}
                                          onChange={(e) => updateLote(prod.id, idx, 'precioCompra', parseFloat(e.target.value) || 0)}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removerLote(prod.id, idx)}
                                      >
                                        <X className="h-3 w-3"/>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
           <div className="flex justify-between w-full items-center">
              <p className="text-xs text-muted-foreground">
                Productos con lotes: <span className="font-medium text-foreground">{Object.values(lotesPorProducto).filter(l => l.length > 0).length}</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enviandoPedido}>
                  Cancelar
                </Button>
                <Button onClick={enviarPedido} disabled={enviandoPedido} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  {enviandoPedido ? (
                    <RefreshCw className="h-4 w-4 animate-spin" /> 
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  {enviandoPedido ? "Procesando..." : "Confirmar Pedido"}
                </Button>
              </div>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
