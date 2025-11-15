/**
 * Export utilities for CSV and other file formats
 */

/**
 * Convert array of string arrays to CSV format
 */
export function arrayToCSV(rows: string[][]): string {
  return rows
    .map(row =>
      row.map(cell => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
    .join("\n")
}

/**
 * Download CSV file with BOM for proper UTF-8 encoding
 */
export function downloadCSV(filename: string, rows: string[][]): void {
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
