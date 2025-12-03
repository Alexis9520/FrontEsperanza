"use client"

import { addDays, endOfDay, startOfDay, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: Date
  to: Date
  onChange: (from: Date, to: Date) => void
}) {
  const [fromStr, setFromStr] = useState(() => formatToInput(from))
  const [toStr, setToStr] = useState(() => formatToInput(to))

  useEffect(() => setFromStr(formatToInput(from)), [from])
  useEffect(() => setToStr(formatToInput(to)), [to])

  const setQuick = (days: number) => {
    const now = new Date()
    const f = startOfDay(addDays(now, -(days - 1)))
    const t = endOfDay(now)
    onChange(f, t)
  }

  function commitFrom(value: string) {
    if (!value) return
    const d = new Date(value)
    if (!isValid(d)) return
    onChange(startOfDay(d), to)
  }

  function commitTo(value: string) {
    if (!value) return
    const d = new Date(value)
    if (!isValid(d)) return
    onChange(from, endOfDay(d))
  }

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 p-2 rounded-xl",
      "bg-muted/40 border border-border/50"
    )}>
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          className={cn(
            "h-8 px-2 rounded-lg text-sm",
            "bg-background/80 border border-border/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "transition-all duration-200"
          )}
          value={fromStr}
          onChange={(e) => setFromStr(e.target.value)}
          onBlur={(e) => commitFrom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commitFrom((e.target as HTMLInputElement).value) }}
        />
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="date"
          className={cn(
            "h-8 px-2 rounded-lg text-sm",
            "bg-background/80 border border-border/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
            "transition-all duration-200"
          )}
          value={toStr}
          onChange={(e) => setToStr(e.target.value)}
          onBlur={(e) => commitTo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") commitTo((e.target as HTMLInputElement).value) }}
        />
      </div>
      <div className="hidden md:flex items-center gap-1 border-l border-border/50 pl-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setQuick(1)}
          className="h-7 px-2 text-xs hover:bg-background"
        >
          Hoy
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setQuick(7)}
          className="h-7 px-2 text-xs hover:bg-background"
        >
          7 días
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => setQuick(30)}
          className="h-7 px-2 text-xs hover:bg-background"
        >
          30 días
        </Button>
      </div>
    </div>
  )
}

function formatToInput(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}