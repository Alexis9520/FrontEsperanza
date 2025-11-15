import React from "react"

/* -------------------- Empty State -------------------- */
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-3 text-muted-foreground">
      <div className="p-4 rounded-full bg-muted/50">{icon}</div>
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-xs max-w-[240px]">{description}</p>
    </div>
  )
}

/* -------------------- Empty Mini -------------------- */
interface EmptyMiniProps {
  message: string
}

export function EmptyMini({ message }: EmptyMiniProps) {
  return <p className="text-xs text-muted-foreground italic">{message}</p>
}
