import { VentaPreview, ProductoCarrito, MetodoPago } from "./types"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  if (!token) {
    window.location.href = "/login"
    throw new Error("No token")
  }
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    const errorText = await res.text()
    throw new Error(errorText || `Error en la petición: ${res.status}`)
  }
  const contentLength = res.headers.get("content-length")
  if (res.status === 204 || contentLength === "0") return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function buildVentaPreviewFromState(params: {
  numero: string
  fecha: string
  carrito: ProductoCarrito[]
  total: number
  metodoPago: MetodoPago
  montoEfectivo: number
  montoYape: number
  nombreCliente: string
  dniCliente: string
  nombreVendedor?: string
}): VentaPreview {
  const {
    numero,
    fecha,
    carrito,
    total,
    metodoPago,
    montoEfectivo,
    montoYape,
    nombreCliente,
    dniCliente,
    nombreVendedor
  } = params
  const items: VentaPreview["items"] = []
  carrito.forEach(p => {
    const pu = Math.max(0, p.precioVentaUnd - (p.descuento ?? 0))
    if (p.cantidadBlister > 0 && p.precioVentaBlister) {
      const nombre = p.cantidadUnidadesBlister
        ? `${p.nombre} [Blister x${p.cantidadUnidadesBlister}]`
        : `${p.nombre} [Blister]`
      items.push({
        nombre,
        cantidad: p.cantidadBlister,
        precio: p.precioVentaBlister,
        subtotal: p.precioVentaBlister * p.cantidadBlister
      })
    }
    if (p.cantidadUnidad > 0) {
      items.push({
        nombre: `${p.nombre} [Unidad]`,
        cantidad: p.cantidadUnidad,
        precio: pu,
        subtotal: pu * p.cantidadUnidad
      })
    }
  })

  let nombreMetodo = "EFECTIVO"
  if (metodoPago === "yape") nombreMetodo = "YAPE"
  if (metodoPago === "mixto") nombreMetodo = "MIXTO"

  const pagado =
    (metodoPago === "efectivo" ? montoEfectivo : 0) +
    (metodoPago === "yape" ? montoYape : 0) +
    (metodoPago === "mixto" ? montoEfectivo + montoYape : 0)
  const vuelto = Math.max(0, pagado - total)

  return {
    numero,
    fecha,
    cliente: nombreCliente,
    dni: dniCliente || undefined,
    vendedor: nombreVendedor || "",
    items,
    total,
    metodo: {
      nombre: nombreMetodo,
      efectivo:
        metodoPago === "efectivo" || metodoPago === "mixto"
          ? (montoEfectivo || undefined)
          : undefined,
      digital:
        metodoPago === "yape" || metodoPago === "mixto"
          ? (montoYape || undefined)
          : undefined,
      vuelto: vuelto || undefined
    }
  }
}
