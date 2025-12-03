import { LoteRaw, ProductSummary } from "./types"

export function diasHasta(fecha: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha)
  if (isNaN(f.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  f.setHours(0, 0, 0, 0)
  return Math.ceil((f.getTime() - hoy.getTime()) / 86400000)
}

export function buildSummaries(lotes: LoteRaw[]): ProductSummary[] {
  const group: Record<string, LoteRaw[]> = {}
  lotes.forEach(l => {
    if (!group[l.codigoBarras]) group[l.codigoBarras] = []
    group[l.codigoBarras].push(l)
  })

  const summaries: ProductSummary[] = Object.values(group).map(productLotes => {
    const base = productLotes[0]
    const cantidadGeneral = productLotes.reduce((s, l) => s + l.cantidadUnidades, 0)
    const costoTotal = productLotes.reduce((s, l) => s + l.cantidadUnidades * l.precioCompra, 0)
    const costoPromedioUnit = cantidadGeneral > 0 ? costoTotal / cantidadGeneral : 0
    const precioVentaUnd = base.precioVenta || 0
    const margenUnit = precioVentaUnd - costoPromedioUnit
    const margenPct = costoPromedioUnit > 0 ? (margenUnit / costoPromedioUnit) * 100 : 0
    const valorVentaTeorico = cantidadGeneral * precioVentaUnd

    let unidadesVencidas = 0
    let unidadesRiesgo30d = 0
    let minDias: number | null = null

    productLotes.forEach(l => {
      const d = diasHasta(l.fechaVencimiento)
      if (d === null) return
      if (minDias === null || d < minDias) minDias = d
      if (d <= 0) unidadesVencidas += l.cantidadUnidades
      else if (d <= 30) unidadesRiesgo30d += l.cantidadUnidades
    })

    const unidadesVigentes = cantidadGeneral - unidadesVencidas - unidadesRiesgo30d
    const porcentajeEnRiesgo = cantidadGeneral > 0
      ? ((unidadesVencidas + unidadesRiesgo30d) / cantidadGeneral) * 100
      : 0

    return {
      codigoBarras: base.codigoBarras,
      nombre: base.nombre,
      concentracion: base.concentracion,
      laboratorio: base.laboratorio,
      categoria: base.categoria,
      cantidadMinima: base.cantidadMinima,
      cantidadGeneral,
      unidadesVencidas,
      unidadesRiesgo30d,
      unidadesVigentes,
      diasHastaPrimerVencimiento: minDias,
      numeroLotes: productLotes.length,
      costoTotal,
      costoPromedioUnit,
      precioVentaUnd,
      margenUnit,
      margenPct,
      valorVentaTeorico,
      porcentajeEnRiesgo,
      lotes: productLotes
    }
  })

  return summaries.sort((a, b) => a.nombre.localeCompare(b.nombre))
}

export function formatMoney(n: number) {
  return "S/ " + n.toFixed(2)
}
