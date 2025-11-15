import React from "react"

/* -------------------- Background FX -------------------- */
export function BackgroundFX() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,#f0abfc22,transparent_60%),radial-gradient(circle_at_80%_70%,#38bdf822,transparent_55%)]" />
      <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-primary/15 to-fuchsia-500/15 blur-3xl opacity-50 animate-pulse" />
      <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-fuchsia-400/15 to-blue-500/15 blur-3xl opacity-40 animate-pulse" />
    </div>
  )
}

/* -------------------- Card Aura -------------------- */
export function CardAura() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.2),rgba(0,0,0,.8))]">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-white/5 via-white/0 to-fuchsia-500/10 opacity-70" />
    </div>
  )
}

/* -------------------- Glow Lines -------------------- */
export function GlowLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-fuchsia-400/40 to-transparent animate-[pulse_5s_linear_infinite]" />
      <div className="absolute -left-10 top-0 h-[140%] w-[140%] animate-[spin_30s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#f0abfc22,transparent_55%)]" />
    </div>
  )
}

/* -------------------- Dots Pattern -------------------- */
export function DotsPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,#f472b650_1.5px,transparent_0)] [background-size:18px_18px]" />
    </div>
  )
}

/* -------------------- Corner Gradient -------------------- */
export function CornerGradient({ color }: { color: "red" | "amber" }) {
  const map: Record<string, string> = {
    red: "from-red-500/40 to-fuchsia-500/0",
    amber: "from-amber-400/50 to-fuchsia-300/0"
  }
  return (
    <div
      className={`pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-tl ${map[color]} blur-2xl`}
    />
  )
}

/* -------------------- Card Glow -------------------- */
export function CardGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-border/40 [mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.65),rgba(255,255,255,0.1))]" />
  )
}
