"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { UserCircle, ChevronRight } from "lucide-react"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { ProfileCard, PersonalInfoCard, QuickInfoCard } from "./components"

interface DatosPersonales {
  nombre_completo: string
  horario_entrada: string
  horario_salida: string
  turno: string
  rol: string
}

export default function PerfilPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [datosPersonales, setDatosPersonales] = useState<DatosPersonales>({
    nombre_completo: user?.nombreCompleto || "",
    horario_entrada: "",
    horario_salida: "",
    turno: "",
    rol: user?.rol || "",
  })

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const data = await fetchWithAuth(apiUrl("/usuarios/me"))
        setDatosPersonales({
          nombre_completo: data.nombreCompleto ?? "",
          horario_entrada: data.horarioEntrada ?? "",
          horario_salida: data.horarioSalida ?? "",
          turno: data.turno ?? "",
          rol: data.rol ?? "",
        })
      } catch (error: any) {
        if (error.message.includes("401")) {
          toast({ title: "Sesión expirada", description: "Debes volver a iniciar sesión", variant: "destructive" })
        } else {
          toast({ title: "Error", description: "No se pudo cargar el perfil", variant: "destructive" })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.dni])

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Perfil</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <UserCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Consulta tu información de usuario registrada en el sistema
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card - Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <ProfileCard
            nombreCompleto={datosPersonales.nombre_completo}
            dni={user?.dni}
            rol={datosPersonales.rol}
            turno={datosPersonales.turno}
            loading={loading}
          />
          
          <QuickInfoCard />
        </div>

        {/* Personal Info - Main Content */}
        <div className="md:col-span-2">
          <PersonalInfoCard
            nombreCompleto={datosPersonales.nombre_completo}
            horarioEntrada={datosPersonales.horario_entrada}
            horarioSalida={datosPersonales.horario_salida}
            turno={datosPersonales.turno}
            rol={datosPersonales.rol}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}