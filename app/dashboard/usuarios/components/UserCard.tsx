import { Edit, KeyRound, User, Crown, Clock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Usuario } from "../types"

// Resaltar búsqueda
function highlight(text: string, term: string) {
  if (!term) return text
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig")
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="rounded bg-primary/20 px-0.5 py-[1px] text-primary dark:bg-primary/30"
      >
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function Info({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground/60">{icon}</span>}
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
          {label}
        </span>
        <span className="font-medium text-sm truncate">{value}</span>
      </div>
    </div>
  )
}

export function UserCard({
  usuario,
  index,
  onEdit,
  onChangePassword,
  searchTerm
}: {
  usuario: Usuario
  index: number
  onEdit: () => void
  onChangePassword: () => void
  searchTerm: string
}) {
  const isAdmin = usuario.rol === "administrador"

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 flex flex-col gap-4 overflow-hidden",
        "transition-all duration-300",
        "bg-card/50 backdrop-blur-sm",
        "hover:shadow-md",
        isAdmin
          ? "border-amber-500/30 hover:border-amber-500/50"
          : "border-border/50 hover:border-primary/40"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold",
            isAdmin 
              ? "bg-amber-500/10 text-amber-500" 
              : "bg-primary/10 text-primary"
          )}>
            {usuario.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {highlight(usuario.nombre_completo, searchTerm)}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              DNI: {highlight(usuario.dni, searchTerm)}
            </span>
          </div>
        </div>
        
        {/* Role badge */}
        <Badge
          className={cn(
            "shrink-0 text-[10px] font-semibold uppercase tracking-wide",
            isAdmin
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-primary/10 text-primary border-primary/30"
          )}
        >
          {isAdmin ? (
            <><Crown className="h-3 w-3 mr-1" /> Admin</>
          ) : (
            <><User className="h-3 w-3 mr-1" /> Staff</>
          )}
        </Badge>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 py-2 border-y border-border/40">
        <Info 
          label="Turno" 
          value={highlight(usuario.turno, searchTerm)}
          icon={<Calendar className="h-3.5 w-3.5" />}
        />
        <Info 
          label="ID" 
          value={<span className="font-mono">{usuario.id}</span>}
        />
        <Info 
          label="Entrada" 
          value={<time className="tabular-nums">{usuario.horario_entrada}</time>}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <Info 
          label="Salida" 
          value={<time className="tabular-nums">{usuario.horario_salida}</time>}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className={cn(
            "flex-1 h-8 text-xs",
            isAdmin
              ? "border-amber-500/40 hover:bg-amber-500/10 hover:border-amber-500/60"
              : "hover:bg-primary/10"
          )}
        >
          <Edit className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onChangePassword}
          className={cn(
            "flex-1 h-8 text-xs",
            isAdmin
              ? "text-amber-500 hover:bg-amber-500/10"
              : "hover:bg-primary/10"
          )}
        >
          <KeyRound className="h-3.5 w-3.5 mr-1.5" />
          Contraseña
        </Button>
      </div>
    </div>
  )
}

export function UserCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 p-4 bg-card/50 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 py-2 border-y border-border/40">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <Skeleton className="h-8 flex-1 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
