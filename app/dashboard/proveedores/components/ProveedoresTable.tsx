"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShoppingCart
} from "lucide-react"
import { Proveedor } from "../types"

interface ProveedoresTableProps {
  proveedores: Proveedor[]
  loading: boolean
  onEdit: (p: Proveedor) => void
  onDelete: (p: Proveedor) => void
  onNewOrder: (p: Proveedor) => void
}

export function ProveedoresTable({
  proveedores,
  loading,
  onEdit,
  onDelete,
  onNewOrder
}: ProveedoresTableProps) {
  return (
    <div className="rounded-xl border bg-background/70 backdrop-blur-md overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/40 backdrop-blur-md">
          <TableRow className="text-xs">
            <TableHead>RUC</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
            <TableHead className="hidden lg:table-cell">Correo</TableHead>
            <TableHead className="hidden xl:table-cell">Dirección</TableHead>
            <TableHead className="hidden sm:table-cell">Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proveedores.map(p => (
            <TableRow key={p.id} className="group hover:bg-muted/25">
              <TableCell className="font-medium tabular-nums text-xs">
                {p.ruc}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm line-clamp-1">{p.razonComercial}</span>
                  </div>
                  {/* Show phone on small screens since column is hidden */}
                  <div className="md:hidden flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{p.numero1}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col gap-0.5 text-xs">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{p.numero1}</span>
                  </div>
                  {p.numero2 && (
                    <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                      <Phone className="h-2.5 w-2.5" />
                      <span>{p.numero2}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-1 text-xs">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-[150px]">{p.correo}</span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <div className="flex items-center gap-1 text-xs max-w-[180px]">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="truncate">{p.direccion}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge
                  variant={p.activo ? "default" : "secondary"}
                  className="text-[10px] h-5"
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-0.5">
                  {/* Nuevo Pedido - Icon only on small, text on lg+ */}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 lg:w-auto lg:px-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                    onClick={() => onNewOrder(p)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline ml-1 text-xs">Pedido</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(p)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {proveedores.length === 0 && !loading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-muted-foreground"
              >
                No se encontraron proveedores
              </TableCell>
            </TableRow>
          )}
          {loading && (
            <TableRow>
              <TableCell colSpan={7} className="py-10">
                <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                  <div className="h-8 w-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  Cargando...
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
