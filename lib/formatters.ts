/**
 * Formatting utilities for money, dates, and numbers
 */

/**
 * Format a number as money in Peruvian Soles (S/)
 */
export function formatMoney(v?: number): string {
  if (typeof v !== "number" || isNaN(v)) return "0.00"
  return v.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Normalize date string from backend format to Date object
 */
export function normalizeToDate(fechaString: string): Date | null {
  if (!fechaString) return null
  // Backend envía "yyyy-MM-dd HH:mm:ss"; normalizamos a ISO con "T"
  const normalized =
    fechaString.includes(" ") && !fechaString.includes("T")
      ? fechaString.replace(" ", "T")
      : fechaString
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Format date and time for display
 */
export function formatFechaHora(fechaString: string): string {
  const fecha = normalizeToDate(fechaString)
  if (!fecha) return fechaString || ""
  return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${fecha.getFullYear()} ${fecha
    .getHours()
    .toString()
    .padStart(2, "0")}:${fecha.getMinutes().toString().padStart(2, "0")}`
}

/**
 * Format date as DD/MM
 */
export function formatFechaDDMM(d: Date): string {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`
}

/**
 * Get safe timestamp from date string
 */
export function safeTime(fechaString: string): number {
  const d = normalizeToDate(fechaString)
  return d ? d.getTime() : 0
}
