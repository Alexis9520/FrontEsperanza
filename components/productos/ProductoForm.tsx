"use client"

import React from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ComboBoxCategoria } from "@/components/ComboBoxCategoria" // Asegúrate que la ruta sea correcta
import { ComboBoxProveedor } from "@/components/ComboBoxProveedor" // Asegúrate que la ruta sea correcta
import clsx from "clsx"

// Definimos qué datos necesita este componente para funcionar
interface ProductoFormProps {
  datos: any // Podrías importar el tipo ProductoFormState si quieres ser estricto
  setDatos: React.Dispatch<React.SetStateAction<any>>
  diccionarioProveedores: Record<number, string>
  modoEdicion?: boolean
}

export default function ProductoForm({
  datos,
  setDatos,
  diccionarioProveedores,
  modoEdicion = false
}: ProductoFormProps) {

  // Helper interno para actualizar el estado del padre
  const update = (key: string, val: any) => {
    setDatos((prev: any) => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-4 py-2">
      {/* GRUPO 1: IDENTIDAD */}
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-8 sm:col-span-9">
          <Field
            label="Nombre del Producto *"
            value={datos.nombre}
            onChange={(v: string) => update("nombre", v)}
            placeholder="Ej. Paracetamol 500mg"
          />
        </div>
        <div className="col-span-4 sm:col-span-3">
          <Field
            label="Cód. Barras"
            value={datos.codigo_barras}
            onChange={(v: string) => update("codigo_barras", v)}
            placeholder="Escanea..."
          />
        </div>
      </div>

      {/* GRUPO 2: CLASIFICACIÓN */}
      <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
        <SectionTitle title="Clasificación y Detalles" small />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
              Categoría
            </Label>
            <ComboBoxCategoria
              value={datos.categoria}
              onChange={(v) => update("categoria", v)}
            />
          </div>
          <Field
            label="Laboratorio"
            value={datos.laboratorio}
            onChange={(v: string) => update("laboratorio", v)}
            placeholder="Ej. Bagó"
          />

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
              Tipo
            </Label>
            <Select
              value={datos.tipoMedicamento}
              onValueChange={(v) => update("tipoMedicamento", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENÉRICO">Genérico</SelectItem>
                <SelectItem value="MARCA">Marca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Field
            label="Principio Activo"
            value={datos.principioActivo}
            onChange={(v: string) => update("principioActivo", v)}
          />
          <Field
            label="Concentración"
            value={datos.concentracion}
            onChange={(v: string) => update("concentracion", v)}
          />
          <Field
            label="Presentación"
            value={datos.presentacion}
            onChange={(v: string) => update("presentacion", v)}
            placeholder="Ej. Caja x 10"
          />
        </div>
      </div>

      {/* GRUPO 3: PROVEEDORES */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold">Proveedores Asignados</Label>
          <ComboBoxProveedor
            value={null}
            onChange={(id) => {
              if (id && !datos.proveedorIds.includes(id)) {
                update("proveedorIds", [...datos.proveedorIds, id])
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded border border-dashed bg-background/50">
          {datos.proveedorIds.length === 0 && (
            <span className="text-[10px] text-muted-foreground italic">
              Ninguno seleccionado
            </span>
          )}
          {datos.proveedorIds.map((id: number) => (
            <Badge key={id} variant="secondary" className="h-6 gap-1 pr-1">
              {diccionarioProveedores[id] || `ID ${id}`}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() =>
                  update(
                    "proveedorIds",
                    datos.proveedorIds.filter((pid: number) => pid !== id)
                  )
                }
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* GRUPO 4: ECONOMÍA */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Columna Izq */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-3">
          <SectionTitle title="Venta Unitaria & Stock" small />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Precio Venta (S/)"
              type="number"
              step="0.01"
              value={datos.precio_venta_und}
              onChange={(v: string) => update("precio_venta_und", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-cyan-500/20">
            <Field
              label="Stock Mínimo"
              type="number"
              value={datos.cantidad_minima}
              onChange={(v: string) => update("cantidad_minima", v)}
            />
          </div>
        </div>

        {/* Columna Der */}
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
          <SectionTitle title="Configuración Blister" small />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Unidades x Blister"
              type="number"
              value={datos.cantidad_unidades_blister}
              onChange={(v: string) => update("cantidad_unidades_blister", v)}
            />
            <Field
              label="Precio Blister (S/)"
              type="number"
              step="0.01"
              value={datos.precio_venta_blister}
              onChange={(v: string) => update("precio_venta_blister", v)}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 italic">
            * Opcional para ventas fraccionadas.
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Componentes auxiliares locales ---
function SectionTitle({ title, small = false }: { title: string; small?: boolean }) {
  return (
    <h3
      className={clsx(
        "font-semibold tracking-tight flex items-center gap-2",
        small ? "text-xs uppercase text-muted-foreground" : "text-sm text-slate-100"
      )}
    >
      {title}
    </h3>
  )
}

function Field({ label, value, onChange, type = "text", step, placeholder }: any) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
        {label}
      </Label>
      <Input
        value={value}
        type={type}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm bg-background/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50"
      />
    </div>
  )
}