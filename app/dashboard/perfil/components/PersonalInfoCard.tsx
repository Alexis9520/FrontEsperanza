"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Clock, CalendarClock, Shield, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface PersonalInfoCardProps {
  nombreCompleto: string
  horarioEntrada: string
  horarioSalida: string
  turno: string
  rol: string
  loading?: boolean
}

interface InfoFieldProps {
  label: string
  value: string
  icon?: React.ElementType
  accent?: "primary" | "amber" | "emerald" | "violet" | "blue"
}

const accentStyles = {
  primary: "text-primary",
  amber: "text-amber-500",
  emerald: "text-emerald-500",
  violet: "text-violet-500",
  blue: "text-blue-500"
}

function InfoField({ label, value, icon: Icon, accent = "primary" }: InfoFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={cn("h-3.5 w-3.5", accentStyles[accent])} />}
        <span className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          accentStyles[accent]
        )}>
          {label}
        </span>
      </div>
      <div className={cn(
        "p-3 rounded-lg text-sm font-medium",
        "bg-muted/40 border border-border/50",
        "transition-colors hover:bg-muted/60"
      )}>
        {value || "—"}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-10 bg-muted rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-10 bg-muted rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-muted rounded" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    </div>
  )
}

export function PersonalInfoCard({ 
  nombreCompleto, 
  horarioEntrada, 
  horarioSalida, 
  turno, 
  rol, 
  loading 
}: PersonalInfoCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "hover:shadow-lg"
    )}>
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-violet-500/40 to-emerald-500/40" />
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          Información Personal
        </CardTitle>
        <CardDescription>
          Datos registrados en el sistema
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-4">
            <InfoField 
              label="Nombre completo" 
              value={nombreCompleto} 
              icon={User}
              accent="primary" 
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField 
                label="Horario de entrada" 
                value={horarioEntrada}
                icon={Clock}
                accent="emerald"
              />
              <InfoField 
                label="Horario de salida" 
                value={horarioSalida}
                icon={CalendarClock}
                accent="amber"
              />
            </div>
            
            <InfoField 
              label="Turno" 
              value={turno}
              icon={Briefcase}
              accent="violet"
            />
            
            <InfoField 
              label="Rol en el sistema" 
              value={rol}
              icon={Shield}
              accent="blue"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
