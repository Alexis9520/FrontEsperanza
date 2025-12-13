"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Shield, IdCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  nombreCompleto: string
  dni?: string
  rol: string
  turno: string
  loading?: boolean
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  accent = "primary" 
}: { 
  icon: React.ElementType
  label: string
  value: string
  accent?: "primary" | "amber" | "emerald" | "violet"
}) {
  const accentStyles = {
    primary: "text-primary bg-primary/10",
    amber: "text-amber-500 bg-amber-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    violet: "text-violet-500 bg-violet-500/10"
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", accentStyles[accent])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
        <span className="text-sm font-medium">{value || "—"}</span>
      </div>
    </div>
  )
}

export function ProfileCard({ nombreCompleto, dni, rol, turno, loading }: ProfileCardProps) {
  const userInitials = nombreCompleto
    ? (() => {
        const parts = nombreCompleto.split(" ")
        return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase()
      })()
    : "US"

  const isAdmin = rol?.toLowerCase() === "administrador"

  if (loading) {
    return (
      <Card className={cn(
        "relative overflow-hidden",
        "border-border/50 bg-card/50 backdrop-blur-sm"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="w-full space-y-3 mt-4">
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
              <div className="h-10 bg-muted rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "hover:shadow-lg"
    )}>
      {/* Subtle accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      
      <CardHeader className="text-center pb-2 relative">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className={cn(
              "h-24 w-24 ring-4 ring-background shadow-lg",
              "border-2",
              isAdmin ? "border-primary/30" : "border-muted"
            )}>
              <AvatarFallback className={cn(
                "text-2xl font-bold",
                isAdmin 
                  ? "bg-gradient-to-br from-primary/20 to-violet-500/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
        </div>
        
        <CardTitle className="flex flex-col items-center gap-2">
          <span className="text-lg font-bold">{nombreCompleto}</span>
          <Badge
            variant={isAdmin ? "default" : "secondary"}
            className={cn(
              "uppercase px-3 py-0.5 text-[10px] tracking-wider font-semibold",
              isAdmin && "bg-primary/90 hover:bg-primary"
            )}
          >
            {isAdmin ? "Administrador" : "Trabajador"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-1">
          <InfoItem icon={IdCard} label="DNI" value={dni || ""} accent="primary" />
          <InfoItem icon={Calendar} label="Turno" value={turno} accent="amber" />
          <InfoItem icon={Shield} label="Rol" value={rol} accent="emerald" />
        </div>
      </CardContent>
    </Card>
  )
}
