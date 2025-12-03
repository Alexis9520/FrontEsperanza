import Link from "next/link"
import { ArrowLeft, Badge, CheckCircle2 } from "lucide-react"
import { Badge as BadgeUI } from "@/components/ui/badge"

interface SalesHeaderProps {
  cajaAbierta: boolean | null
}

export function SalesHeader({ cajaAbierta }: SalesHeaderProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
      <Link
        href="/dashboard/ventas"
        className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Historial de Ventas
      </Link>
      <div className="flex items-center gap-2">
        {cajaAbierta === null && (
          <BadgeUI variant="outline" className="animate-pulse">
            Verificando caja...
          </BadgeUI>
        )}
        {cajaAbierta === false && (
          <BadgeUI variant="destructive">Caja cerrada</BadgeUI>
        )}
        {cajaAbierta === true && (
          <BadgeUI className="gap-1 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Caja abierta
          </BadgeUI>
        )}
      </div>
    </div>
  )
}
