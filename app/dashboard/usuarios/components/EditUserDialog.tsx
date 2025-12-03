import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/use-toast"
import { Field } from "./FormHelpers"
import { Usuario } from "../types"

export function EditUserDialog({
  usuario,
  onClose,
  onSave
}: {
  usuario: Usuario | null
  onClose: () => void
  onSave: (usuario: Usuario) => Promise<boolean>
}) {
  const { toast } = useToast()
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null)

  useEffect(() => {
    setEditandoUsuario(usuario)
  }, [usuario])

  const handleSave = async () => {
    if (!editandoUsuario) return
    if (
      !editandoUsuario.nombre_completo ||
      !editandoUsuario.dni ||
      !editandoUsuario.rol ||
      !editandoUsuario.turno ||
      !editandoUsuario.horario_entrada ||
      !editandoUsuario.horario_salida
    ) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" })
      return
    }

    const success = await onSave(editandoUsuario)
    // If success, the parent will close the dialog (or we can close it here if we want)
    // The parent sets usuario to null, which closes the dialog.
  }

  return (
    <Dialog open={!!usuario} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            Editar usuario
          </DialogTitle>
          <DialogDescription>
            Ajusta la información del usuario seleccionado
          </DialogDescription>
        </DialogHeader>
        {editandoUsuario && (
          <div className="grid gap-6 py-2">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nombre completo *" htmlFor="edit-nombre_completo">
                <Input
                  id="edit-nombre_completo"
                  value={editandoUsuario.nombre_completo}
                  onChange={(e) =>
                    setEditandoUsuario({
                      ...editandoUsuario,
                      nombre_completo: e.target.value
                    })
                  }
                />
              </Field>
              <Field label="DNI *" htmlFor="edit-dni">
                <Input
                  id="edit-dni"
                  maxLength={8}
                  value={editandoUsuario.dni}
                  onChange={(e) =>
                    setEditandoUsuario({
                      ...editandoUsuario,
                      dni: e.target.value.replace(/\D/g, "").slice(0, 8)
                    })
                  }
                />
              </Field>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Rol *" htmlFor="edit-rol">
                <Select
                  value={editandoUsuario.rol}
                  onValueChange={(value) =>
                    setEditandoUsuario({ ...editandoUsuario, rol: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    <SelectItem value="trabajador">Trabajador</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Turno *" htmlFor="edit-turno">
                <Select
                  value={editandoUsuario.turno}
                  onValueChange={(value) =>
                    setEditandoUsuario({ ...editandoUsuario, turno: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mañana">Mañana</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noche">Noche</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Entrada *" htmlFor="edit-horario_entrada">
                <Input
                  id="edit-horario_entrada"
                  type="time"
                  value={editandoUsuario.horario_entrada}
                  onChange={(e) =>
                    setEditandoUsuario({
                      ...editandoUsuario,
                      horario_entrada: e.target.value
                    })
                  }
                />
              </Field>
              <Field label="Salida *" htmlFor="edit-horario_salida">
                <Input
                  id="edit-horario_salida"
                  type="time"
                  value={editandoUsuario.horario_salida}
                  onChange={(e) =>
                    setEditandoUsuario({
                      ...editandoUsuario,
                      horario_salida: e.target.value
                    })
                  }
                />
              </Field>
            </div>
          </div>
        )}
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary/90 hover:bg-primary">
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
