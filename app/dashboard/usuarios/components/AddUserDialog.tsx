import { useState, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/lib/use-toast"
import { cn } from "@/lib/utils"
import { Section, Field } from "./FormHelpers"
import { PasswordStrengthIndicator } from "./PasswordStrength"
import { Usuario } from "../types"

export function AddUserDialog({
  onAdd,
  usuarios
}: {
  onAdd: (usuario: any) => Promise<boolean>
  usuarios: Usuario[]
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isEnviando, setIsEnviando] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre_completo: "",
    dni: "",
    rol: "",
    turno: "",
    horario_entrada: "",
    horario_salida: "",
    password: "",
    confirmPassword: ""
  })

  const nombreCompletoRef = useRef<HTMLInputElement>(null)
  const dniRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (
      !nuevoUsuario.nombre_completo ||
      !nuevoUsuario.dni ||
      !nuevoUsuario.rol ||
      !nuevoUsuario.turno ||
      !nuevoUsuario.horario_entrada ||
      !nuevoUsuario.horario_salida ||
      !nuevoUsuario.password ||
      !nuevoUsuario.confirmPassword
    ) {
      toast({ title: "Error", description: "Completa todos los campos obligatorios", variant: "destructive" })
      nombreCompletoRef.current?.focus()
      return
    }

    if (nuevoUsuario.dni.length !== 8) {
      toast({ title: "Error", description: "El DNI debe tener 8 dígitos", variant: "destructive" })
      dniRef.current?.focus()
      return
    }

    if (usuarios.some((u) => u.dni === nuevoUsuario.dni)) {
      toast({ title: "Error", description: "Ya existe un usuario con este DNI", variant: "destructive" })
      dniRef.current?.focus()
      return
    }

    if (nuevoUsuario.password !== nuevoUsuario.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" })
      passwordRef.current?.focus()
      return
    }

    if (nuevoUsuario.password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" })
      passwordRef.current?.focus()
      return
    }

    setIsEnviando(true)
    const success = await onAdd(nuevoUsuario)
    setIsEnviando(false)

    if (success) {
      setOpen(false)
      setNuevoUsuario({
        nombre_completo: "",
        dni: "",
        rol: "",
        turno: "",
        horario_entrada: "",
        horario_salida: "",
        password: "",
        confirmPassword: ""
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="group relative overflow-hidden">
          <span className="absolute inset-0 bg-[conic-gradient(at_50%_50%,hsl(var(--primary)/.2),transparent_55%)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl border border-primary/20 shadow-lg shadow-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
            Crear nuevo usuario
          </DialogTitle>
          <DialogDescription>
            Completa los datos para registrar un nuevo perfil
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="grid gap-6 py-2">
            <Section title="Identidad">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Nombre completo *" htmlFor="nombre_completo">
                  <Input
                    id="nombre_completo"
                    placeholder="Ej: María Lozano"
                    value={nuevoUsuario.nombre_completo}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        nombre_completo: e.target.value.slice(0, 120)
                      })
                    }
                    ref={nombreCompletoRef}
                  />
                </Field>
                <Field label="DNI *" htmlFor="dni">
                  <Input
                    id="dni"
                    placeholder="12345678"
                    maxLength={8}
                    inputMode="numeric"
                    value={nuevoUsuario.dni}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        dni: e.target.value.replace(/\D/g, "").slice(0, 8)
                      })
                    }
                    ref={dniRef}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Asignación">
              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Rol *" htmlFor="rol">
                  <Select
                    value={nuevoUsuario.rol}
                    onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="trabajador">Trabajador</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Turno *" htmlFor="turno">
                  <Select
                    value={nuevoUsuario.turno}
                    onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, turno: value })}
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
                <Field label="" htmlFor="rol">
                  <div className="flex gap-2">
                    {nuevoUsuario.rol === "administrador" ? (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow ring-1 ring-yellow-500/50">
                        Administrador
                      </Badge>
                    ) : nuevoUsuario.rol ? (
                      <Badge variant="secondary" className="capitalize">
                        {nuevoUsuario.rol}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin rol</Badge>
                    )}
                  </div>
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Horario entrada *" htmlFor="horario_entrada">
                  <Input
                    id="horario_entrada"
                    type="time"
                    value={nuevoUsuario.horario_entrada}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, horario_entrada: e.target.value })
                    }
                  />
                </Field>
                <Field label="Horario salida *" htmlFor="horario_salida">
                  <Input
                    id="horario_salida"
                    type="time"
                    value={nuevoUsuario.horario_salida}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, horario_salida: e.target.value })
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section title="Seguridad">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Contraseña *" htmlFor="password">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevoUsuario.password}
                    onChange={(e) =>
                      setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
                    }
                    ref={passwordRef}
                  />
                  <PasswordStrengthIndicator password={nuevoUsuario.password} />
                </Field>
                <Field label="Confirmar contraseña *" htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={nuevoUsuario.confirmPassword}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        confirmPassword: e.target.value
                      })
                    }
                  />
                  {nuevoUsuario.confirmPassword && (
                    <p
                      className={cn(
                        "text-xs mt-1",
                        nuevoUsuario.confirmPassword === nuevoUsuario.password
                          ? "text-green-600"
                          : "text-destructive"
                      )}
                    >
                      {nuevoUsuario.confirmPassword === nuevoUsuario.password
                        ? "Coincide ✔"
                        : "No coincide"}
                    </p>
                  )}
                </Field>
              </div>
            </Section>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleSubmit}
            disabled={isEnviando}
            className="w-full md:w-auto bg-gradient-to-r from-primary via-primary/80 to-primary/60 hover:from-primary/90 hover:via-primary/70 hover:to-primary/50"
          >
            {isEnviando ? "Creando..." : "Crear Usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
