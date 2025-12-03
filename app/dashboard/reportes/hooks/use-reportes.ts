import { useState, useEffect } from "react"
import {
  getSalesSummary,
  getSalesByDay,
  getTopProducts,
  getPaymentMix,
  getCajaSummary,
  type SalesSummary,
  type SalesByDay,
  type TopProduct,
  type PaymentMix,
} from "@/lib/api"

function toNumber(v: any): number {
  if (v == null) return 0
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function useReportes() {
  const [from, setFrom] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [to, setTo] = useState<Date>(() => {
    const d = new Date()
    d.setHours(23, 59, 59, 999)
    return d
  })
  
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<SalesSummary | null>(null)
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [payMix, setPayMix] = useState<PaymentMix[]>([])
  const [caja, setCaja] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [s, byDay, tprod, mix, cash] = await Promise.allSettled([
          getSalesSummary({ from, to }),
          getSalesByDay({ from, to }),
          getTopProducts({ from, to, limit: 10 }),
          getPaymentMix({ from, to }),
          getCajaSummary({ from, to }),
        ])
        if (!mounted) return
        setSummary(s.status === "fulfilled" ? s.value : null)
        setSalesByDay(byDay.status === "fulfilled" ? byDay.value : [])
        setTopProducts(tprod.status === "fulfilled" ? tprod.value : [])
        setPayMix(mix.status === "fulfilled" ? mix.value : [])
        setCaja(cash.status === "fulfilled" ? cash.value : null)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [from, to])

  // Cálculos de Caja
  const ingresosVentas = toNumber(caja?.ingresosVentas ?? caja?.ingresos ?? caja?.ventas ?? 0)
  const ingresosManuales = toNumber(caja?.ingresosManuales ?? caja?.ingresos_manuales ?? 0)
  const ventasEfectivo = toNumber(caja?.ventasEfectivo ?? caja?.ventas_efectivo ?? 0)
  const cajaEgresosRaw = toNumber(caja?.egresos ?? caja?.egreso ?? 0)
  const cajaNetoRaw = toNumber(caja?.neto ?? (ingresosVentas + ingresosManuales - cajaEgresosRaw))

  const cajaEgresos = cajaEgresosRaw < 0 ? Math.abs(cajaEgresosRaw) : cajaEgresosRaw
  const cajaIngresosTotal = ingresosVentas + ingresosManuales
  const cajaTotal = Math.max(0, cajaIngresosTotal + cajaEgresos)
  const cajaIngresosPct = cajaTotal > 0 ? Math.round((cajaIngresosTotal / cajaTotal) * 100) : 0
  const cajaEgresosPct = cajaTotal > 0 ? Math.round((cajaEgresos / cajaTotal) * 100) : 0
  const cajaMarginPct = cajaIngresosTotal > 0 ? ((cajaNetoRaw / cajaIngresosTotal) * 100) : 0

  return {
    from, setFrom,
    to, setTo,
    loading,
    summary,
    salesByDay,
    topProducts,
    payMix,
    caja,
    cajaCalculated: {
      ingresosVentas,
      ingresosManuales,
      ventasEfectivo,
      cajaEgresos,
      cajaNetoRaw,
      cajaIngresosTotal,
      cajaIngresosPct,
      cajaEgresosPct,
      cajaMarginPct
    }
  }
}
