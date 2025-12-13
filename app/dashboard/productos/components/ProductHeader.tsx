"use client"

import { RefreshCw, Plus, Sparkles, Maximize2, Minimize2, Package, Activity } from "lucide-react"
import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import ProductoForm from "./ProductoForm"

interface ProductHeaderProps {
  loading: boolean
  onRefresh: () => void
  densityCompact: boolean
  onToggleDensity: () => void
  nuevoProducto: any
  setNuevoProducto: (val: any) => void
  diccionarioProveedores: Record<number, string>
  onGuardar: () => void
}

export function ProductHeader({
  loading,
  onRefresh,
  densityCompact,
  onToggleDensity,
  nuevoProducto,
  setNuevoProducto,
  diccionarioProveedores,
  onGuardar
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Gestión de Productos</h1>
            <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
              <Activity className="h-3 w-3" />
              Catálogo
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">
            Administra el catálogo y lotes de inventario
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onRefresh}
        >
          <RefreshCw
            className={clsx(
              "h-4 w-4",
              loading && "animate-spin"
            )}
          />
          Refrescar
        </Button>

        <div className="flex items-center rounded-full border bg-background/60 backdrop-blur px-1">
          <Button
            size="icon"
            variant={!densityCompact ? "secondary" : "ghost"}
            className="h-8 w-8 rounded-full"
            onClick={() => densityCompact && onToggleDensity()}
            aria-label="Vista normal"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={densityCompact ? "secondary" : "ghost"}
            className="h-8 w-8 rounded-full"
            onClick={() => !densityCompact && onToggleDensity()}
            aria-label="Vista compacta"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                Nuevo Producto
              </DialogTitle>
              <DialogDescription>
                Registra un producto y lotes iniciales
              </DialogDescription>
            </DialogHeader>

            <ProductoForm
              datos={nuevoProducto}
              setDatos={setNuevoProducto}
              diccionarioProveedores={diccionarioProveedores}
              modoEdicion={false}
            />

            <DialogFooter className="pt-2">
              <Button onClick={onGuardar}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
