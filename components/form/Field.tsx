import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

/* -------------------- Field Component -------------------- */
interface FieldProps {
  label: string
  value: any
  onChange: (v: string) => void
  type?: string
  step?: string
  placeholder?: string
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder
}: FieldProps) {
  const auto =
    placeholder || `Ingresa ${label.replace("*", "").toLowerCase()}`.trim()
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Input
        value={value}
        type={type}
        step={step}
        placeholder={auto}
        onChange={e => onChange(e.target.value)}
        className="focus-visible:ring-1 focus-visible:ring-cyan-400/50"
      />
    </div>
  )
}
