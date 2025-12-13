"use client"

import { RefreshCw, Users, Crown, User, Shield, UserPlus, Activity } from "lucide-react"

import { RoleGuard } from "@/components/RoleGuard"
import ChangePasswordDialog from "@/components/ChangePasswordDialog"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

import { useUsuarios } from "./hooks/use-usuarios"
import { MetricCard } from "./components/UserMetrics"
import { UserCard, UserCardsSkeleton } from "./components/UserCard"
import { UserSearch } from "./components/UserSearch"
import { AddUserDialog } from "./components/AddUserDialog"
import { EditUserDialog } from "./components/EditUserDialog"

export default function UsuariosPage() {
  const {
    usuarios,
    loading,
    refrescando,
    busqueda,
    setBusqueda,
    debouncedBusqueda,
    usuariosFiltrados,
    cargarUsuarios,
    agregarUsuario,
    guardarEdicionUsuario,
    editandoUsuario,
    setEditandoUsuario,
    showPasswordDialog,
    setShowPasswordDialog,
    usuarioIdPasswordDialog,
    setUsuarioIdPasswordDialog,
    totalAdmins,
    totalTrabajadores
  } = useUsuarios()

  return (
    <RoleGuard allowedRoles={["administrador"]}>
      <div className="flex flex-col gap-6 relative p-4 md:p-6 min-h-screen">
        {/* Fondo estandarizado */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-muted/40 rounded-full blur-3xl" />
        </div>

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
                <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/30">
                  <Activity className="h-3 w-3" />
                  Equipo
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                Control de identidades, roles y permisos del sistema
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={cargarUsuarios}
              disabled={refrescando}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", refrescando && "animate-spin")} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>

            <AddUserDialog onAdd={agregarUsuario} usuarios={usuarios} />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Usuarios"
            subtitle="Registrados en el sistema"
            value={usuarios.length}
            icon={<Users className="h-5 w-5" />}
            accent="primary"
          />
          <MetricCard
            title="Administradores"
            subtitle="Acceso completo"
            value={totalAdmins}
            icon={<Crown className="h-5 w-5" />}
            accent="amber"
          />
          <MetricCard
            title="Trabajadores"
            subtitle="Operativos activos"
            value={totalTrabajadores}
            icon={<User className="h-5 w-5" />}
            accent="emerald"
          />
        </div>

        {/* Buscador */}
        <UserSearch
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          count={usuariosFiltrados.length}
        />

        {/* Lista de usuarios en tarjetas */}
        <section>
          {loading ? (
            <UserCardsSkeleton />
          ) : usuariosFiltrados.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-card/50">
              <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-lg">No se encontraron usuarios</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Intenta cambiar el término de búsqueda o crea un nuevo usuario con el botón superior.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 mt-2">
                  <UserPlus className="h-4 w-4" />
                  Crear usuario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {usuariosFiltrados.map((u, i) => (
                <UserCard
                  key={u.id}
                  usuario={u}
                  index={i}
                  onEdit={() => setEditandoUsuario(u)}
                  onChangePassword={() => {
                    setUsuarioIdPasswordDialog(u.id)
                    setShowPasswordDialog(true)
                  }}
                  searchTerm={debouncedBusqueda}
                />
              ))}
            </div>
          )}
        </section>

        {/* Dialog Editar */}
        <EditUserDialog
          usuario={editandoUsuario}
          onClose={() => setEditandoUsuario(null)}
          onSave={guardarEdicionUsuario}
        />

        {/* Dialog cambiar contraseña */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/60">
            <DialogHeader>
              <DialogTitle>Cambiar contraseña</DialogTitle>
              <DialogDescription>
                Establece una nueva contraseña segura para este usuario.
              </DialogDescription>
            </DialogHeader>
            {usuarioIdPasswordDialog && (
              <ChangePasswordDialog
                userId={usuarioIdPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
                isAdmin={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  )
}
