export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_85%_70%,hsl(var(--secondary)/0.12),transparent_55%)]" />
      <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl opacity-50 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-secondary/25 to-transparent blur-3xl opacity-40 animate-pulse" />
    </div>
  )
}

export function CardGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border/40 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.65),rgba(255,255,255,0.1))]" />
  )
}
