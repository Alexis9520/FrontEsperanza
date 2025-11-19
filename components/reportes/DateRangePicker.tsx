"use client"

import { addDays, endOfDay, startOfDay, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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
    <div className="flex items-center gap-2">
      <input
        type="date"
        className="border rounded px-2 py-1 text-sm bg-background"
        value={fromStr}
        onChange={(e) => setFromStr(e.target.value)}
        onBlur={(e) => commitFrom(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commitFrom((e.target as HTMLInputElement).value) }}
      />
      <span className="text-muted-foreground text-sm">a</span>
      <input
        type="date"
        className="border rounded px-2 py-1 text-sm bg-background"
        value={toStr}
        onChange={(e) => setToStr(e.target.value)}
        onBlur={(e) => commitTo(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commitTo((e.target as HTMLInputElement).value) }}
      />
      <div className="hidden md:flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={() => setQuick(1)}>Hoy</Button>
        <Button size="sm" variant="outline" onClick={() => setQuick(7)}>7d</Button>
        <Button size="sm" variant="outline" onClick={() => setQuick(30)}>30d</Button>
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