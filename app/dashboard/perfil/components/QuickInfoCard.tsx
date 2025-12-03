"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Info, ShieldCheck, Bell, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickInfoItem {
  icon: React.ElementType
  title: string
  description: string
  accent: "primary" | "amber" | "emerald" | "violet"
}

const quickInfoItems: QuickInfoItem[] = [
  {
    icon: ShieldCheck,
    title: "Seguridad",
    description: "Tu cuenta está protegida con autenticación segura",
    accent: "emerald"
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Configura tus preferencias en Ajustes",
    accent: "amber"
  },
  {
    icon: HelpCircle,
    title: "Soporte",
    description: "Contacta a un administrador si necesitas ayuda",
    accent: "violet"
  }
]

const accentStyles = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20"
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20"
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20"
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/20"
  }
}

export function QuickInfoCard() {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      "border-border/50 bg-card/50 backdrop-blur-sm",
      "hover:shadow-lg"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Info className="h-4 w-4 text-violet-500" />
          </div>
          Información Rápida
        </CardTitle>
        <CardDescription>
          Datos útiles sobre tu cuenta
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {quickInfoItems.map((item, index) => {
          const styles = accentStyles[item.accent]
          return (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "border transition-all duration-200",
                "hover:bg-muted/30",
                styles.border,
                `bg-${item.accent}-500/[0.02]`
              )}
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", styles.bg)}>
                <item.icon className={cn("h-4 w-4", styles.text)} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
