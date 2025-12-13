export interface Producto {
  id?: number
  codigoBarras: string
  nombre: string
  precioVentaUnd: number
  precioVentaBlister?: number
  cantidadUnidadesBlister?: number
  cantidadGeneral: number
  descuento: number
  concentracion?: string
  laboratorio?: string
  tipoMedicamento?: "GENÉRICO" | "MARCA" | string
  presentacion?: string
  nroRegistroSanitario?: string | null
}

export interface ProductoCarrito {
  id?: number
  codigoBarras: string
  nombre: string
  precioVentaUnd: number
  precioVentaBlister?: number
  cantidadUnidadesBlister?: number
  descuento: number
  cantidadBlister: number
  cantidadUnidad: number
  subtotal: number
  stockDisponible: number
}

export interface UsuarioSesion {
  dni: string
  nombreCompleto: string
  rol: string
}

export type SortField = "nombre" | "precio" | "stock" | "laboratorio" | "tipo" | "concentracion"
export type MetodoPago = "efectivo" | "yape" | "mixto"

export interface VentaPreview {
  numero: string
  fecha: string
  cliente: string
  dni?: string
  vendedor: string
  items: {
    nombre: string
    cantidad: number
    precio: number
    subtotal: number
  }[]
  total: number
  metodo: {
    nombre: string
    efectivo?: number
    digital?: number
    vuelto?: number
  }
}
