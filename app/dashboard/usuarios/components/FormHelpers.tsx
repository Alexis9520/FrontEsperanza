import { Label } from "@/components/ui/label"

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shadow shadow-primary/40" />
          {title}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  children,
  optional
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2"
      >
        {label} {optional && <span className="text-[10px] text-muted-foreground/60">(Opcional)</span>}
      </Label>
      {children}
    </div>
  )
}
