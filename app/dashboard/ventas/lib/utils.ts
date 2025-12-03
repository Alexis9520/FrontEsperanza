import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Boleta } from "../types"

export function normalizeToDate(fechaString: string) {
  if (!fechaString) return null
  // Backend envía "yyyy-MM-dd HH:mm:ss"; normalizamos a ISO con "T"
  const normalized = fechaString.includes(" ") && !fechaString.includes("T")
    ? fechaString.replace(" ", "T")
    : fechaString
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

export function formatFechaHora(fechaString: string) {
  const fecha = normalizeToDate(fechaString)
  if (!fecha) return fechaString || ""
  return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${fecha.getFullYear()} ${fecha
    .getHours()
    .toString()
    .padStart(2, "0")}:${fecha.getMinutes().toString().padStart(2, "0")}`
}

export function formatFechaDDMM(d: Date) {
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`
}

export function safeTime(f: string) {
  const d = normalizeToDate(f)
  return d ? d.getTime() : 0
}

export function arrayToCSV(rows: string[][]) {
  return rows
    .map(row => row.map(cell => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(","))
    .join("\n")
}

export function downloadCSV(filename: string, rows: string[][]) {
  const BOM = "\uFEFF"
  const csv = arrayToCSV(rows)
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportarBoletasPDF(boletasFiltradas: Boleta[]) {
  const doc = new jsPDF()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(16)
  doc.text("Listado de Boletas", 14, 16)
  autoTable(doc, {
    startY: 24,
    styles: { fontSize: 10, cellPadding: 2 },
    head: [["Número", "Fecha", "Cliente", "Método", "Total Compra", "Vuelto", "Usuario"]],
    body: boletasFiltradas.map(b => [
      b.numero,
      formatFechaHora(b.fecha),
      b.cliente,
      b.metodoPago ?? "",
      (b.totalCompra ?? b.total ?? "").toString(),
      (b.vuelto ?? "").toString(),
      b.usuario ?? ""
    ]),
    theme: "grid",
    headStyles: { fillColor: [32, 110, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] }
  })
  doc.save("boletas.pdf")
}

export function metodoBadgeVariant(met?: string | null) {
  const m = (met || "").toLowerCase()
  if (m === "efectivo") return "default"
  if (["yape", "plin", "tarjeta", "pos", "mixto"].includes(m)) return "secondary"
  return "outline"
}
