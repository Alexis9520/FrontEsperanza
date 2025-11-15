import React from "react"
import clsx from "clsx"

/* -------------------- Section Title Component -------------------- */
interface SectionTitleProps {
  title: string
  small?: boolean
}

export function SectionTitle({ title, small = false }: SectionTitleProps) {
  return (
    <h3
      className={clsx(
        "font-semibold tracking-tight flex items-center gap-2",
        small
          ? "text-xs uppercase text-muted-foreground"
          : "text-sm text-slate-100"
      )}
    >
      {title}
    </h3>
  )
}
