/**
 * Date calculation utilities
 */

/**
 * Calculate days until a given date
 */
export function calcularDiasParaVencer(fecha: string): number {
  if (!fecha) return 0
  const f = new Date(fecha)
  const h = new Date()
  h.setHours(0, 0, 0, 0)
  f.setHours(0, 0, 0, 0)
  return Math.ceil((f.getTime() - h.getTime()) / 86400000)
}

/**
 * Calculate days until a date (nullable variant)
 */
export function diasHasta(fecha: string | null): number | null {
  if (!fecha) return null
  const f = new Date(fecha)
  if (isNaN(f.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  f.setHours(0, 0, 0, 0)
  return Math.ceil((f.getTime() - hoy.getTime()) / 86400000)
}

/**
 * Get the status of a batch based on expiration date
 */
export function obtenerEstadoLote(fechaVencimiento: string): {
  estado: string
  color: string
  texto: string
  dias: number
} {
  const dias = calcularDiasParaVencer(fechaVencimiento)
  if (dias < 0)
    return { estado: "vencido", color: "destructive", texto: "Vencido", dias }
  if (dias <= 30)
    return { estado: "vence-pronto", color: "secondary", texto: "Pronto", dias }
  return { estado: "vigente", color: "outline", texto: "Vigente", dias }
}

/**
 * Get current date
 */
export function today(): Date {
  return new Date()
}
