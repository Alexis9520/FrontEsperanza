import React from "react"
import { type PaymentMix } from "@/lib/api"

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }) : "—"

function toNumber(v: any): number {
  if (v == null) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function PaymentDonut({ mix, compact }: { mix: PaymentMix[]; compact?: boolean }) {
  const totals = mix.map(m => toNumber(m.total))
  const sum = totals.reduce((a, b) => a + b, 0)
  const parts = sum > 0 ? totals.map(v => (v / sum) * 100) : [100]
  const colors = ["#10b981", "#60a5fa", "#f472b6", "#f59e0b", "#a78bfa"]
  let acc = 0
  return (
    <div className={`flex ${compact ? "items-center justify-center" : "items-center gap-4"}`}>
      <div className="relative w-full h-full" style={{ width: compact ? 144 : 160, height: compact ? 144 : 160 }}>
        <svg viewBox="0 0 36 36" className="w-full h-full">
          {parts.map((p, i) => {
            const dashArray = `${p} ${100 - p}`
            const rot = (acc / 100) * 360; acc += p
            return (
              <circle key={i} cx="18" cy="18" r="15.9155" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="3"
                strokeDasharray={dashArray} transform={`rotate(${rot} 18 18)`} />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {sum > 0 ? (
            <>
              <div className="text-sm font-medium">Total</div>
              <div className="text-xs font-semibold">{fmtMoney(sum)}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Sin datos</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Legend({ mix }: { mix: PaymentMix[] }) {
  const colors = ["#10b981", "#60a5fa", "#f472b6", "#f59e0b", "#a78bfa"]
  const sum = mix.reduce((acc, it) => acc + toNumber(it.total), 0)
  if (mix.length === 0) return <div className="text-xs text-muted-foreground">Sin datos</div>
  return (
    <ul className="space-y-3 text-sm">
      {mix.map((m, i) => {
        const amount = toNumber(m.total)
        const pct = sum > 0 ? (amount / sum) * 100 : 0
        return (
          <li key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ background: colors[i % colors.length] }} />
              <span className="truncate">{m.metodo_pago}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{fmtMoney(amount)}</div>
              <div className="text-xs text-muted-foreground">{pct.toFixed(1)}%</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
