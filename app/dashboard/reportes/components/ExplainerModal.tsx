import React, { useEffect } from "react"
import {
  WalletMinimal,
  HandCoins,
  Banknote,
  ArrowDownRight,
  FileText,
  Percent,
  ShoppingBag,
  Ticket,
  Package,
  TrendingUp,
  PieChart,
} from "lucide-react"
import { type PaymentMix } from "@/lib/api"

const fmtMoney = (n?: number | null) =>
  typeof n === "number" ? n.toLocaleString("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 2 }) : "—"

function toNumber(v: any): number {
  if (v == null) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function ExplainerModal({
  open,
  onClose,
  data,
}: {
  open: boolean
  onClose: () => void
  data: {
    ventasTotal: number
    tickets: number
    upt: number
    ticketPromedio: number
    ingresosTotales: number
    ingresosManuales: number
    ventasEfectivo: number
    egresos: number
    neto: number
    margenPct: number
    payMix: PaymentMix[]
  }
}) {
  const { ventasTotal, tickets, upt, ticketPromedio, ingresosTotales, ingresosManuales, ventasEfectivo, egresos, neto, margenPct, payMix } = data

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const sumMix = payMix.reduce((acc, it) => acc + toNumber(it.total), 0)
  const colors = ["#10b981", "#60a5fa", "#f472b6", "#f59e0b", "#a78bfa"]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explainer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative z-10 max-w-3xl w-full bg-slate-900 border rounded-lg shadow-lg p-6 text-sm text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="explainer-title" className="text-lg font-semibold">Guía rápida de este reporte</h3>
            <p className="text-xs text-muted-foreground mt-1">Significado de cada dato con números reales del período.</p>
          </div>
          <button aria-label="Cerrar" onClick={onClose} className="text-slate-300 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Izquierda: Caja y Ventas */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Caja</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <WalletMinimal className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <div>
                  <div className="font-medium">Ingresos (total) {fmtMoney(ingresosTotales)}</div>
                  <div className="text-xs text-muted-foreground">Ventas + ingresos manuales del período.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <HandCoins className="w-4 h-4 text-emerald-300 mt-[2px]" />
                <div>
                  <div className="font-medium">Ingresos manuales {fmtMoney(ingresosManuales)}</div>
                  <div className="text-xs text-muted-foreground">Entradas registradas manualmente (aportes, ajustes, etc.).</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Banknote className="w-4 h-4 text-emerald-500 mt-[2px]" />
                <div>
                  <div className="font-medium">Ventas en efectivo {fmtMoney(ventasEfectivo)}</div>
                  <div className="text-xs text-muted-foreground">Parte de las ventas pagadas en efectivo (útil para conciliar caja).</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowDownRight className="w-4 h-4 text-rose-400 mt-[2px]" />
                <div>
                  <div className="font-medium">Egresos {fmtMoney(egresos)}</div>
                  <div className="text-xs text-muted-foreground">Salidas de dinero (pagos, retiros, compras menores, etc.).</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-sky-300 mt-[2px]" />
                <div>
                  <div className="font-medium">Neto {fmtMoney(neto)}</div>
                  <div className="text-xs text-muted-foreground">Ingresos totales menos egresos.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Percent className="w-4 h-4 text-fuchsia-400 mt-[2px]" />
                <div>
                  <div className="font-medium">Margen Neto {margenPct > 0 ? `${margenPct.toFixed(1)}%` : "—"}</div>
                  <div className="text-xs text-muted-foreground">Relación Neto / Ingresos. Mientras más alto, mejor.</div>
                </div>
              </li>
            </ul>

            <h4 className="text-sm font-semibold mt-5">Ventas</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ShoppingBag className="w-4 h-4 text-emerald-400 mt-[2px]" />
                <div>
                  <div className="font-medium">Ventas totales {fmtMoney(ventasTotal)}</div>
                  <div className="text-xs text-muted-foreground">Monto vendido en el período (todas las formas de pago).</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Ticket className="w-4 h-4 text-blue-300 mt-[2px]" />
                <div>
                  <div className="font-medium">Tickets {tickets.toLocaleString("es-PE")}</div>
                  <div className="text-xs text-muted-foreground">Número de boletas/facturas emitidas.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Package className="w-4 h-4 text-indigo-300 mt-[2px]" />
                <div>
                  <div className="font-medium">UPT {Number.isFinite(upt) ? upt.toFixed(2) : "—"}</div>
                  <div className="text-xs text-muted-foreground">Unidades por ticket: unidades vendidas / tickets.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-lime-300 mt-[2px]" />
                <div>
                  <div className="font-medium">Ticket promedio {fmtMoney(ticketPromedio)}</div>
                  <div className="text-xs text-muted-foreground">Promedio monetario por ticket.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Derecha: Canales de pago con breakdown real */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2"><PieChart className="w-4 h-4 text-fuchsia-400" /> Canales de pago</h4>
            <div className="text-xs text-muted-foreground">Cómo se distribuyen tus ventas por método.</div>
            <ul className="space-y-3 text-sm">
              {payMix.length === 0 ? (
                <li className="text-xs text-muted-foreground">Sin datos</li>
              ) : (
                payMix.map((m, i) => {
                  const amount = toNumber(m.total)
                  const pct = sumMix > 0 ? (amount / sumMix) * 100 : 0
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
                })
              )}
            </ul>
            <div className="text-xs text-muted-foreground pt-2">Suma total: <span className="font-medium text-slate-200">{fmtMoney(sumMix)}</span></div>

          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 border rounded text-sm hover:bg-slate-700">
            Entendido
          </button>
        </div>
      </div>

    </div>
  )
}
