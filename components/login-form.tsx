"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
// framer-motion removed for this page to improve performance (animations disabled)
import { login } from "@/lib/auth"
import { useToast } from "@/lib/use-toast"
import { Pill, Eye, EyeOff, Loader2, Shield, Lock } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

/* ---------------- VALIDACIÓN ---------------- */
const formSchema = z.object({
  dni: z.string().trim().length(8, { message: "Debe tener 8 dígitos" }).regex(/^\d+$/, { message: "Solo números" }),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" })
})
type FormValues = z.infer<typeof formSchema>

const MAX_ATTEMPTS = 5
const LOCK_SECONDS = 45

/* Animaciones deshabilitadas en este componente para mejorar rendimiento. */

/* =============== COMPONENTE PRINCIPAL =============== */
export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockCountdown, setLockCountdown] = useState<number | null>(null)
  const [capsLock, setCapsLock] = useState(false)
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { dni: "", password: "" },
    mode: "onChange"
  })

  /* Manejo de bloqueos */
  useEffect(() => {
    if (failedAttempts >= MAX_ATTEMPTS) {
      setLockCountdown(LOCK_SECONDS)
      lockTimerRef.current && clearInterval(lockTimerRef.current)
      lockTimerRef.current = setInterval(() => {
        setLockCountdown(prev => {
          if (prev === null) return null
          if (prev <= 1) {
            clearInterval(lockTimerRef.current as NodeJS.Timeout)
            return null
          }
            return prev - 1
        })
      }, 1000)
      toast({
        variant: "destructive",
        title: "Demasiados intentos",
        description: `Espera ${LOCK_SECONDS} segundos`
      })
    }
  }, [failedAttempts, toast])

  useEffect(() => {
    return () => {
      lockTimerRef.current && clearInterval(lockTimerRef.current)
    }
  }, [])

  async function onSubmit(values: FormValues) {
    if (lockCountdown !== null) {
      toast({
        variant: "destructive",
        title: "Bloqueado",
        description: `Quedan ${lockCountdown}s`
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await login(values.dni, values.password)
      if (result.ok) {
        setFailedAttempts(0)
        toast({ title: "Bienvenido", description: "Sesión iniciada" })
        router.push("/dashboard")
        router.refresh()
      } else {
        setFailedAttempts(p => p + 1)
        toast({
          variant: "destructive",
          title: "Credenciales inválidas",
          description: result.error || "Revisa tu DNI o contraseña."
        })
      }
    } catch {
      setFailedAttempts(p => p + 1)
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Intenta nuevamente."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.("CapsLock"))
  }

  const isLocked = lockCountdown !== null

  return (
    <div className="no-animations fixed inset-0 overflow-hidden bg-[#130B2A] text-slate-100">
      <BackgroundBlobs />

      {/* CONTENEDOR CENTRADO RESPONSIVO */}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-[1650px] flex-col items-center justify-center">
          {/* En móvil: primero el logo + bienvenida (centrado), luego form.
              En >=lg: grid 2 columnas (bienvenida izquierda / form derecha) */}
          <div className="flex w-full flex-col gap-10 md:gap-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-24">
            {/* IZQUIERDA (o arriba en móvil) */}
            <section className="relative flex flex-col items-start justify-center lg:items-start">
              {/* Eliminado el swirl rectangular: nuevo fondo radial con máscara para evitar borde/shadow visible */}
              <AmbientWelcomeBackground />

              <div className="relative z-10 w-full max-w-xl">
                <BrandHeaderLeft compactOnMobile />
                <h1 className="mt-10 text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] xl:text-[4.5rem]">
                  <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                    Bienvenido
                  </span>
                </h1>
                <p className="mt-5 max-w-md text-[13.5px] leading-relaxed text-slate-400 sm:text-sm md:text-[15px]">
                  
                </p>
                <div className="mt-6">
                  
                </div>
              </div>
            </section>

            {/* DERECHA FORM */}
            <section className="relative flex w-full items-start justify-center lg:items-center">
              <div className="w-full max-w-sm md:max-w-md lg:max-w-sm">
                <FormCard
                  form={form}
                  onSubmit={onSubmit}
                  isLoading={isLoading}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  isLocked={isLocked}
                  lockCountdown={lockCountdown}
                  capsLock={capsLock}
                  handleKeyEvent={handleKeyEvent}
                  failedAttempts={failedAttempts}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Reset body para tema oscuro consistente */}
      <style jsx global>{`
        html, body, #__next {
          height: 100%;
          width: 100%;
        }
        body {
          margin: 0;
          padding: 0;
          background: #0f172a;
          overscroll-behavior: none;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  )
}

/* =============== SUBCOMPONENTES UI =============== */

/* Fondo general - diseño sutil y elegante */
function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-20">
      {/* Base gradient - muy sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Blob primario - esquina superior izquierda */}
      <div className="absolute -left-32 -top-32 h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_60%)] blur-[120px]" />
      
      {/* Blob secundario - esquina inferior derecha */}
      <div className="absolute -bottom-32 -right-32 h-[45vmax] w-[45vmax] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_60%)] blur-[120px]" />
      
      {/* Acento sutil central */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40vmax] w-[60vmax] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_50%)] blur-[100px]" />

      {/* Grid sutil */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50" />
      
      {/* Overlay de ruido sutil */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
    </div>
  )
}

/* Fondo sutil para la sección de bienvenida */
function AmbientWelcomeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-visible">
      {/* Glow sutil detrás del contenido */}
      <div className="absolute left-1/4 top-1/3 h-[30vmax] w-[30vmax] rounded-full blur-[80px] opacity-40 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),transparent_60%)]" />
      <div className="absolute right-1/4 bottom-1/3 h-[25vmax] w-[25vmax] rounded-full blur-[70px] opacity-35 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_60%)]" />
    </div>
  )
}

function BrandHeaderLeft({ compactOnMobile }: { compactOnMobile?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${compactOnMobile ? "sm:gap-4" : ""}`}>
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] shadow-lg shadow-black/20">
        <img src="/icono-sidebar.png" alt="Icono Sidebar" className="h-10 w-10" />
      </div>
      <div className="leading-tight">
        <p className="text-lg sm:text-xl font-semibold text-white">Botica Nueva Esperanza</p>
        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
          Salud & Economía
        </p>
      </div>
    </div>
  )
}

interface SharedProps {
  form: ReturnType<typeof useForm<FormValues>>
  onSubmit: (v: FormValues) => void
  isLoading: boolean
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  isLocked: boolean
  lockCountdown: number | null
  capsLock: boolean
  handleKeyEvent: (e: React.KeyboardEvent<HTMLInputElement>) => void
  failedAttempts: number
}

function FormCard(props: SharedProps) {
  const {
    form,
    onSubmit,
    isLoading,
    showPassword,
    setShowPassword,
    isLocked,
    lockCountdown,
    capsLock,
    handleKeyEvent,
    failedAttempts
  } = props

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/60 backdrop-blur-2xl shadow-2xl shadow-black/20">
      {/* Borde superior luminoso sutil */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Reflejo interno sutil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-transparent" />
      
      <CardHeader className="space-y-1.5 pb-4 text-center">
        <CardTitle className="text-xl font-semibold tracking-tight text-white">
          Iniciar sesión
        </CardTitle>
        <CardDescription className="text-[13px] text-slate-400">
          Accede a tu panel de control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <DNIField form={form} />
            <PasswordField
              form={form}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              capsLock={capsLock}
              handleKeyEvent={handleKeyEvent}
            />
            <SubmitArea
              form={form}
              isLoading={isLoading}
              isLocked={isLocked}
              lockCountdown={lockCountdown}
              failedAttempts={failedAttempts}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pb-6 pt-2">
        <p className="text-center text-[10px] font-medium tracking-wide text-slate-500">
          
        </p>
      </CardFooter>
    </Card>
  )
}

/* ---------- Campos ---------- */
function DNIField({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <FormField
      control={form.control}
      name="dni"
      render={({ field }) => (
        <FormItem>
          <div className="mb-1.5 flex items-center justify-between">
            <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              DNI
            </FormLabel>
            {form.formState.errors.dni && (
              <span className="text-[10px] font-medium text-rose-400">
                {form.formState.errors.dni.message}
              </span>
            )}
          </div>
          <FormControl>
            <div className="group relative">
              <Input
                inputMode="numeric"
                autoComplete="username"
                maxLength={8}
                placeholder="00000000"
                {...field}
                onKeyUp={(e) => {
                  const clean = e.currentTarget.value.replace(/\D/g, "")
                  field.onChange(clean)
                }}
                className="peer h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 pr-11 font-medium tracking-wider text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 transition-colors duration-200 peer-focus:text-indigo-400">
                <Shield className="h-4 w-4" />
              </span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function PasswordField({
  form,
  showPassword,
  setShowPassword,
  capsLock,
  handleKeyEvent
}: {
  form: ReturnType<typeof useForm<FormValues>>
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  capsLock: boolean
  handleKeyEvent: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <div className="mb-1.5 flex items-center justify-between">
            <FormLabel className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Contraseña
            </FormLabel>
            {capsLock && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                <Lock className="h-3.5 w-3.5" /> Caps
              </span>
            )}
          </div>
          <FormControl>
            <div className="group relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...field}
                onKeyDown={handleKeyEvent}
                onKeyUp={handleKeyEvent}
                className="peer h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 pr-11 font-medium tracking-wide text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 hover:border-white/15 hover:bg-white/[0.06] focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-2 flex items-center rounded-lg p-1.5 text-slate-500 transition-colors duration-200 hover:text-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SubmitArea({
  form,
  isLoading,
  isLocked,
  lockCountdown,
  failedAttempts
}: {
  form: ReturnType<typeof useForm<FormValues>>
  isLoading: boolean
  isLocked: boolean
  lockCountdown: number | null
  failedAttempts: number
}) {
  return (
    <div className="flex flex-col gap-3 pt-1" aria-live="polite">
      <Button
        type="submit"
        disabled={isLoading || isLocked || !form.formState.isValid}
        className="group relative h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold tracking-wide text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
      >
        {/* Shimmer effect on hover */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        
        <span className="relative flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLocked ? `Bloqueado (${lockCountdown}s)` : isLoading ? "Verificando..." : "Entrar"}
        </span>
      </Button>
      
      {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
        <p className="text-center text-[11px] font-medium text-amber-400/90">
          Intentos fallidos: {failedAttempts}/{MAX_ATTEMPTS}
        </p>
      )}
      
      {isLocked && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-center text-[11px] font-medium text-rose-300 backdrop-blur-sm">
          Bloqueo temporal. Reintenta en {lockCountdown}s.
        </div>
      )}
    </div>
  )
}