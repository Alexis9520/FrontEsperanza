import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`relative border-border/60 bg-background/60 backdrop-blur-xl ${className || ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(circle_at_90%_80%,hsl(var(--secondary)/0.18),transparent_60%)] opacity-40" />
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border/40 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.6),transparent)]" />
    </Card>
  )
}

export function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,hsl(var(--primary)/0.16),transparent_60%),radial-gradient(circle_at_85%_75%,hsl(var(--secondary)/0.16),transparent_60%)]" />
      <div className="absolute -top-48 -right-40 h-[560px] w-[560px] rounded-full bg-primary/15 blur-3xl opacity-40 animate-pulse" />
      <div className="absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full bg-secondary/25 blur-3xl opacity-30 animate-pulse" />
    </div>
  )
}

export function QtyAdjust({
  value,
  onDec,
  onInc,
  disabledDec,
  suffix
}: {
  value: number
  onDec: () => void
  onInc: () => void
  disabledDec?: boolean
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onDec}
          disabled={disabledDec}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center text-sm tabular-nums">{value}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onInc}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {suffix && (
        <span className="text-[10px] text-muted-foreground self-end">
          {suffix}
        </span>
      )}
    </div>
  )
}
