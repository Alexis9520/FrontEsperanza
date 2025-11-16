"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { apiUrl } from "@/lib/config"
import { fetchWithAuth } from "@/lib/api"

type Proveedor = {
  id: number
  ruc: string
  razonComercial: string
  activo: boolean
}

interface ComboBoxProveedorProps {
  value?: number | null
  onChange: (value: number | null) => void
}

export function ComboBoxProveedor({ value, onChange }: ComboBoxProveedorProps) {
  const [open, setOpen] = React.useState(false)
  const [proveedores, setProveedores] = React.useState<Proveedor[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const loadProveedores = async () => {
      try {
        setLoading(true)
        const data = await fetchWithAuth(apiUrl("/proveedores"))
        setProveedores(Array.isArray(data) ? data.filter((p: Proveedor) => p.activo) : [])
      } catch (error) {
        console.error("Error cargando proveedores:", error)
        setProveedores([])
      } finally {
        setLoading(false)
      }
    }

    loadProveedores()
  }, [])

  const selectedProveedor = proveedores.find(p => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedProveedor ? (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{selectedProveedor.razonComercial}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Seleccionar proveedor...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Buscar proveedor..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Cargando proveedores..." : "No se encontraron proveedores"}
            </CommandEmpty>
            <CommandGroup>
              {proveedores.map((proveedor) => (
                <CommandItem
                  key={proveedor.id}
                  value={`${proveedor.razonComercial} ${proveedor.ruc}`}
                  onSelect={() => {
                    onChange(proveedor.id === value ? null : proveedor.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === proveedor.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{proveedor.razonComercial}</span>
                    <span className="text-xs text-muted-foreground">RUC: {proveedor.ruc}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
