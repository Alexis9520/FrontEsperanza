import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ConfGeneral, ConfBoleta, VentaPreview } from "./types"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn(
      "relative overflow-hidden",
      "bg-card/50 backdrop-blur-sm",
      "border border-border/50 shadow-sm",
      "transition-all duration-300 hover:shadow-md hover:border-border/70",
      className
    )}>
      <div className="relative z-10">{children}</div>
    </Card>
  )
}

export function BackgroundFX() {
  // Retorna null para evitar competir con el sistema de colores
  return null
}

export function Field({ value, label, onChange, type = "text", placeholder, description }: {
  value: string
  label: string
  type?: string
  placeholder?: string
  description?: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "bg-background/80 border-border/60",
          "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50",
          "transition-all duration-200"
        )}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export function ToggleSwitch({ id, label, checked, onChange, description }: {
  id: string
  label: string
  checked: boolean
  description?: string
  onChange: (c: boolean) => void
}) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-3 rounded-xl",
      "bg-muted/30 border border-border/40",
      "hover:bg-muted/50 hover:border-border/60",
      "transition-all duration-200 group"
    )}>
      <div className="flex-1 min-w-0">
        <Label 
          htmlFor={id} 
          className="cursor-pointer font-medium text-sm group-hover:text-foreground transition-colors"
        >
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
}

export function ThemeCard({ active, icon, label, onClick, description }:{
  active: boolean
  icon: React.ReactNode
  label: string
  description?: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "relative h-auto min-h-[100px] flex flex-col gap-2 items-center justify-center p-4",
        "border-2 transition-all duration-300",
        active
          ? "border-primary bg-primary/5 text-foreground shadow-lg shadow-primary/10 scale-[1.02]"
          : "border-border/50 bg-card/30 hover:bg-muted/40 hover:border-border hover:scale-[1.01]"
      )}
    >
      <span className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
        active 
          ? "bg-primary/10 text-primary" 
          : "bg-muted/50 text-muted-foreground group-hover:text-foreground"
      )}>
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="text-[10px] text-muted-foreground">{description}</span>
      )}
      {active && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
    </Button>
  )
}

export function SectionHeader({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export function EmbeddedTicket({
  venta,
  confGen,
  confBol,
  moneda
}:{
  venta: VentaPreview
  confGen: ConfGeneral
  confBol: ConfBoleta
  moneda: string
}) {
  return (
    <div className="space-y-1 text-[11px] font-mono leading-tight">
      <div className="text-center font-bold uppercase tracking-wider">
        {confGen.nombreNegocio}
      </div>
      <div className="text-center text-muted-foreground">{confGen.direccion}</div>
      <div className="text-center text-muted-foreground">{confGen.telefono}</div>
      
      <div className="my-2 border-t border-dashed border-border" />
      
      <div className="flex justify-between">
        <span className="font-semibold">Serie:</span>
        <span>{venta.numero}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Fecha:</span>
        <span>{venta.fecha}</span>
      </div>
      
      <div className="my-2 border-t border-dashed border-border" />
      
      <div className="space-y-1">
        {venta.items.map((it, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span className="truncate flex-1">{it.nombre} <span className="text-muted-foreground">x{it.cantidad}</span></span>
            <span className="tabular-nums">{moneda} {it.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="my-2 border-t border-dashed border-border" />
      
      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span>{moneda} {venta.total.toFixed(2)}</span>
      </div>
      
      {confBol.mensajePie && (
        <>
          <div className="my-2 border-t border-dashed border-border" />
          <div className="pt-1 text-center italic text-muted-foreground text-[10px]">
            {confBol.mensajePie}
          </div>
        </>
      )}
    </div>
  )
}
