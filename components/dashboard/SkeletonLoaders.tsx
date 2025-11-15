import React from "react"
import { TableRow, TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/* -------------------- Skeleton Row -------------------- */
interface SkeletonRowProps {
  cols: number
  compact?: boolean
}

export function SkeletonRow({ cols, compact }: SkeletonRowProps) {
  return (
    <TableRow>
      {Array.from({ length: cols }).map((_, i) => (
        <TableCell key={i} className={cn(compact ? "py-1.5" : "py-3")}>
          <div className="h-4 w-full animate-pulse rounded bg-muted/40" />
        </TableCell>
      ))}
    </TableRow>
  )
}
