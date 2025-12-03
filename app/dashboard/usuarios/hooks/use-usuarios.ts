import { useState, useEffect, useMemo, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { apiUrl } from "@/lib/config"
import { Usuario } from "../types"

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

async function fetchConAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = getToken()
  if (!token) throw new Error("Sesión expirada o no autenticada")
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`
  }
  return fetch(input, { ...init, headers })
}

export function useUsuarios() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [refrescando, setRefrescando] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [debouncedBusqueda, setDebouncedBusqueda] = useState("")

  // Dialog states
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [usuarioIdPasswordDialog, setUsuarioIdPasswordDialog] = useState<number | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusqueda(busqueda.trim()), 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const cargarUsuarios = useCallback(async () => {
    const token = getToken()
    if (!token) {
      toast({
        title: "Sesión expirada",
        description: "Inicia sesión nuevamente",
        variant: "destructive"
      })
      return
    }
    setRefrescando(true)
    try {
      const res = await fetch(apiUrl("/usuarios"), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!res.ok) throw new Error("Error de sesión o autorización")
      const data = await res.json()
      const usuariosAdaptados = data.map((u: any) => ({
        id: u.id,
        nombre_completo: u.nombreCompleto,
        dni: u.dni,
        rol: (u.rol || "").toLowerCase(),
        turno: u.turno,
        horario_entrada: u.horarioEntrada,
        horario_salida: u.horarioSalida
      }))
      setUsuarios(usuariosAdaptados)
    } catch {
      toast({
        title: "Sesión expirada",
        description: "Inicia sesión nuevamente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefrescando(false)
    }
  }, [toast])

  useEffect(() => {
    cargarUsuarios()
  }, [cargarUsuarios])

  const usuariosFiltrados = useMemo(() => {
    if (!debouncedBusqueda) return usuarios
    return usuarios.filter(
      (usuario) =>
        usuario.nombre_completo.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        usuario.dni.includes(debouncedBusqueda) ||
        usuario.rol.toLowerCase().includes(debouncedBusqueda.toLowerCase()) ||
        usuario.turno.toLowerCase().includes(debouncedBusqueda.toLowerCase())
    )
  }, [usuarios, debouncedBusqueda])

  const agregarUsuario = async (nuevoUsuario: any) => {
    try {
      const res = await fetchConAuth(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: nuevoUsuario.dni,
          nombreCompleto: nuevoUsuario.nombre_completo,
          contrasena: nuevoUsuario.password,
          rol: nuevoUsuario.rol,
          turno: nuevoUsuario.turno,
          horarioEntrada: nuevoUsuario.horario_entrada,
          horarioSalida: nuevoUsuario.horario_salida
        })
      })

      if (res.ok) {
        toast({ title: "Usuario agregado", description: "Se creó correctamente" })
        cargarUsuarios()
        return true
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.message || "No se pudo agregar", variant: "destructive" })
        return false
      }
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message || "Error de conexión",
        variant: "destructive"
      })
      return false
    }
  }

  const guardarEdicionUsuario = async (usuarioEditado: Usuario) => {
    try {
      const res = await fetchConAuth(apiUrl(`/usuarios/${usuarioEditado.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombreCompleto: usuarioEditado.nombre_completo,
          dni: usuarioEditado.dni,
          rol: usuarioEditado.rol.toUpperCase(),
          turno: usuarioEditado.turno,
          horarioEntrada: usuarioEditado.horario_entrada,
          horarioSalida: usuarioEditado.horario_salida
        })
      })
      if (res.ok) {
        toast({ title: "Usuario actualizado" })
        setEditandoUsuario(null)
        cargarUsuarios()
        return true
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.message || "No se pudo editar", variant: "destructive" })
        return false
      }
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message || "No se pudo editar",
        variant: "destructive"
      })
      return false
    }
  }

  const totalAdmins = usuarios.filter(u => u.rol === "administrador").length
  const totalTrabajadores = usuarios.filter(u => u.rol === "trabajador").length

  return {
    usuarios,
    loading,
    refrescando,
    busqueda,
    setBusqueda,
    debouncedBusqueda,
    usuariosFiltrados,
    cargarUsuarios,
    agregarUsuario,
    guardarEdicionUsuario,
    editandoUsuario,
    setEditandoUsuario,
    showPasswordDialog,
    setShowPasswordDialog,
    usuarioIdPasswordDialog,
    setUsuarioIdPasswordDialog,
    totalAdmins,
    totalTrabajadores
  }
}
