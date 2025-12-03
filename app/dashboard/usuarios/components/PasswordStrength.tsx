import { useMemo } from "react"
import { cn } from "@/lib/utils"

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0
    if (password.length >= 6) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    if (password.length >= 10) s++
    return s
  }, [password])

  if (!password) return null
  const colors = ["bg-destructive", "bg-orange-500", "bg-amber-500", "bg-green-500", "bg-emerald-600"]
  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"]

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-muted transition-colors",
              i < score && colors[score - 1]
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-[10px] uppercase tracking-wide",
          score <= 2 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {labels[Math.max(0, score - 1)]}
      </p>
    </div>
  )
}
