"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  Search,
  Package,
  Plus,
  Calendar,
  DollarSign,
  Hash,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import clsx from "clsx"

import { apiUrl } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api"
import { useToast } from "@/lib/use-toast"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"

/* =========================================================
   TIPOS
========================================================= */
type Producto = {
  id: number
  codigoBarras: string
  nombre: string
  concentracion?: string
  cantidadGeneral: number
  categoria?: string
  laboratorio?: string
}

/* =========================================================
   COMPONENTE PRINCIPAL
======================================================== */
export default function AgregarStockPage() {
  const { toast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(false)

  // Producto seleccionado para agregar stock
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [nuevoStock, setNuevoStock] = useState({
    codigoStock: "",
    cantidadUnidades: "",
    fechaVencimiento: "",
    precioCompra: ""
  })
  const [agregandoStock, setAgregandoStock] = useState(false)

  /* ------------ BÚSQUEDA DE PRODUCTOS ------------- */
  const buscarProductos = useCallback(async () => {
    if (!busqueda.trim()) {
      setProductos([])
      return
    }

    try {
      setLoading(true)
      const data = await fetchWithAuth(
        apiUrl(`/productos?page=0&size=20&q=${encodeURIComponent(busqueda.trim())}`)
      )
      setProductos(data.content || [])
    } catch (err) {
      console.error("Error buscarProductos:", err)
      toast({
        title: "Error",
        description: "No se pudo buscar productos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [busqueda, toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.trim()) {
        buscarProductos()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda, buscarProductos])

  /* ------------ AGREGAR STOCK ------------- */
  function seleccionarProducto(producto: Producto) {
    setProductoSeleccionado(producto)
    setNuevoStock({
      codigoStock: "",
      cantidadUnidades: "",
      fechaVencimiento: "",
      precioCompra: ""
    })
  }

  async function agregarStock() {
    if (!productoSeleccionado) return

    if (!nuevoStock.cantidadUnidades || !nuevoStock.fechaVencimiento || !nuevoStock.precioCompra) {
      toast({
        title: "Campos obligatorios",
        description: "Cantidad, Fecha de Vencimiento y Precio de Compra son obligatorios",
        variant: "destructive"
      })
      return
    }

    const body = {
      codigoStock: nuevoStock.codigoStock.trim() || null,
      productoId: productoSeleccionado.id,
      codigoBarras: productoSeleccionado.codigoBarras,
      cantidadUnidades: Number(nuevoStock.cantidadUnidades),
      fechaVencimiento: nuevoStock.fechaVencimiento,
      precioCompra: Number(nuevoStock.precioCompra)
    }

    try {
      setAgregandoStock(true)
      await fetchWithAuth(apiUrl("/productos/agregar-stock"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      toast({
        title: "Stock agregado",
        description: `Se agregaron ${body.cantidadUnidades} unidades al producto ${productoSeleccionado.nombre}`
      })
      setProductoSeleccionado(null)
      setNuevoStock({
        codigoStock: "",
        cantidadUnidades: "",
        fechaVencimiento: "",
        precioCompra: ""
      })
      // Refrescar búsqueda
      buscarProductos()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "No se pudo agregar el stock",
        variant: "destructive"
      })
    } finally {
      setAgregandoStock(false)
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="relative flex flex-col gap-8 pb-20">
      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.10),transparent_65%),linear-gradient(140deg,rgba(255,255,255,0.03),transparent_40%,rgba(255,255,255,0.02)_70%,transparent)]" />
        <div className="absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.10)_0_2px,transparent_2px_10px)]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-cyan-100">
            Agregar Stock
          </h1>
          <p className="text-sm text-muted-foreground">
            Busca un producto y agrega stock con su información de lote
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <Card className="relative overflow-hidden border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-cyan-400" />
            Buscar Producto
          </CardTitle>
          <CardDescription className="text-xs">
            Ingresa el código de barras o nombre del producto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código de barras o nombre..."
              className="pl-9 bg-background/60 backdrop-blur-sm"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {busqueda && (
        <Card className="relative overflow-hidden border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-cyan-400" />
              Resultados ({productos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-background/70 backdrop-blur-md overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40 backdrop-blur-md">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map(p => (
                    <TableRow key={p.id} className="group hover:bg-muted/25">
                      <TableCell className="font-medium tabular-nums">
                        {p.codigoBarras}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.nombre}</span>
                          {p.concentracion && (
                            <span className="text-xs text-muted-foreground">
                              {p.concentracion}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {p.categoria || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {p.cantidadGeneral} unidades
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => seleccionarProducto(p)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {productos.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10">
                        <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                          <div className="h-8 w-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                          Buscando...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DIALOG AGREGAR STOCK */}
      <Dialog
        open={!!productoSeleccionado}
        onOpenChange={() => setProductoSeleccionado(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              <span className="flex items-center gap-2">
                Agregar Stock
                {/* Indicador rojo si faltan campos obligatorios */}
                {(
                  !nuevoStock.cantidadUnidades || !nuevoStock.fechaVencimiento || !nuevoStock.precioCompra
                ) && (
                  <span className="inline-flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-1" aria-hidden="true" />
                    <span className="sr-only">Faltan campos obligatorios</span>
                  </span>
                )}
              </span>
            </DialogTitle>
            <DialogDescription>
              {productoSeleccionado && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{productoSeleccionado.nombre}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Código: {productoSeleccionado.codigoBarras} • Stock actual: {productoSeleccionado.cantidadGeneral} unidades
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Código de Stock (opcional)
              </Label>
              <Input
                value={nuevoStock.codigoStock}
                onChange={e => setNuevoStock(s => ({ ...s, codigoStock: e.target.value }))}
                placeholder="Código del lote (se generará automáticamente si está vacío)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  Cantidad de Unidades *
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={nuevoStock.cantidadUnidades}
                  onChange={e => setNuevoStock(s => ({ ...s, cantidadUnidades: e.target.value }))}
                  placeholder="Cantidad"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fecha de Vencimiento *
                </Label>
                <Input
                  type="date"
                  value={nuevoStock.fechaVencimiento}
                  onChange={e => setNuevoStock(s => ({ ...s, fechaVencimiento: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Precio de Compra (S/) *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={nuevoStock.precioCompra}
                onChange={e => setNuevoStock(s => ({ ...s, precioCompra: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Nota:</strong> El stock se agregará al producto existente. 
                La cantidad general se actualizará automáticamente.
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductoSeleccionado(null)}
              disabled={agregandoStock}
            >
              Cancelar
            </Button>
            <Button onClick={agregarStock} disabled={agregandoStock}>
              {agregandoStock ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-background border-t-foreground animate-spin mr-2" />
                  Agregando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Agregar Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
