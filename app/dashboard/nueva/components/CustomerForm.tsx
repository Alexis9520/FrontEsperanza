import { User2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { GlassPanel } from "./SharedUI"

interface CustomerFormProps {
  dni: string
  onDniChange: (val: string) => void
  nombre: string
  onNombreChange: (val: string) => void
  vendedor: string
}

export function CustomerForm({ dni, onDniChange, nombre, onNombreChange, vendedor }: CustomerFormProps) {
  return (
    <GlassPanel>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <User2 className="h-5 w-5 text-primary" />
          Datos del Cliente
        </CardTitle>
        <CardDescription>DNI opcional</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dni-cliente">DNI</Label>
            <Input
              id="dni-cliente"
              value={dni}
              onChange={e => onDniChange(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={8}
              placeholder="Opcional"
              inputMode="numeric"
            />
          </div>
          <div>
            <Label htmlFor="vendedor">Vendedor</Label>
            <Input
              id="vendedor"
              value={vendedor}
              readOnly
              disabled
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="nombre-cliente">
              Nombre Cliente <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="nombre-cliente"
              value={nombre}
              onChange={e => onNombreChange(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>
        </div>
      </CardContent>
    </GlassPanel>
  )
}
