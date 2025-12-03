"use client"

import React, { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export type Column<T> = {
  key: keyof T | string
  header: string
  align?: "left" | "right" | "center"
  grow?: boolean
  render?: (row: T) => React.ReactNode
  className?: string
  fontMono?: boolean
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "Sin datos",
  dense = false,
  enableSelection = false,
  selectedKeys = [],
  onSelectionChange,
  keyExtractor,
}: {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: ReactNode
  dense?: boolean
  enableSelection?: boolean
  selectedKeys?: (string | number)[]
  onSelectionChange?: (keys: (string | number)[]) => void
  keyExtractor?: (item: T) => string | number
}) {
  const allSelected = data.length > 0 && data.every((item, idx) => {
    const key = keyExtractor ? keyExtractor(item) : (item.id ?? idx)
    return selectedKeys.includes(key)
  })

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      const allKeys = data.map((item, idx) => keyExtractor ? keyExtractor(item) : (item.id ?? idx))
      onSelectionChange(allKeys)
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectRow = (key: string | number, checked: boolean) => {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedKeys, key])
    } else {
      onSelectionChange(selectedKeys.filter((k) => k !== key))
    }
  }

  return (
    <div className="overflow-x-auto border border-border/50 rounded-lg bg-card/30">
      <table className={cn("w-full text-sm", dense && "text-[12.5px]")}>
        <thead>
          <tr className="bg-muted/30 border-b border-border/50">
            {enableSelection && (
              <th className="px-3 py-2.5 w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={String(c.key)}
                className={cn(
                  "px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                  alignClass(c.align),
                  c.className
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {data?.length ? (
            data.map((row, idx) => {
              const key = keyExtractor ? keyExtractor(row) : (row.id ?? idx)
              const isSelected = selectedKeys.includes(key)
              return (
                <tr 
                  key={key} 
                  className={cn(
                    "transition-colors duration-150",
                    "hover:bg-muted/30",
                    isSelected && "bg-primary/5",
                    idx % 2 === 1 && "bg-muted/10"
                  )}
                >
                  {enableSelection && (
                    <td className="px-3 py-2.5 w-[40px]">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(key, !!checked)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td 
                      key={String(c.key)} 
                      className={cn(
                        "px-3 py-2.5 whitespace-nowrap",
                        alignClass(c.align),
                        c.grow && "w-full",
                        c.fontMono && "font-mono text-xs",
                        c.className
                      )}
                    >
                      {c.render ? c.render(row) : String(row[c.key as keyof T] ?? "—")}
                    </td>
                  ))}
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (enableSelection ? 1 : 0)} className="px-3 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function alignClass(a?: "left" | "right" | "center") {
  if (a === "right") return "text-right"
  if (a === "center") return "text-center"
  return "text-left"
}