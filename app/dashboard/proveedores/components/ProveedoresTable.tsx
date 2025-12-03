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
          <TableRow>
            <TableHead>RUC</TableHead>
            <TableHead>Razón Comercial</TableHead>
            <TableHead>Teléfonos</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proveedores.map(p => (
            <TableRow key={p.id} className="group hover:bg-muted/25">
              <TableCell className="font-medium tabular-nums">
                {p.ruc}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{p.razonComercial}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{p.numero1}</span>
                  </div>
                  {p.numero2 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{p.numero2}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{p.correo}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm max-w-xs truncate">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{p.direccion}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={p.activo ? "default" : "secondary"}>
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {/* Botón NUEVO PEDIDO */}
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 text-xs gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 mr-2"
                    onClick={() => onNewOrder(p)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Nuevo Pedido
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onEdit(p)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 className="h-4 w-4" />
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
