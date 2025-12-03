// Dashboard Data Types
export interface VentasDia {
  monto: number
  variacion: number
}

export interface VentasMes {
  monto: number
  variacion: number
}

export interface SaldoCaja {
  total: number
  efectivo: number
  yape: number
}

export interface ClientesAtendidos {
  cantidad: number
  variacion: number
}

export interface VentaReciente {
  boleta: string
  cliente: string
  monto: number
}

export interface ProductoMasVendido {
  nombre: string
  unidades: number
  porcentaje: number
}

export interface ProductoCritico {
  nombre: string
  stock: number
}

export interface ProductoVencimiento {
  nombre: string
  dias: number
}

export interface SeriePedido {
  etiqueta: string
  total: number
}

export interface PedidoReciente {
  pedidoId: number
  proveedor: string
  producto: string
  fechaPedido: string
  unidades: number
  leadTimeDias: number
}

export interface Pedidos {
  totalHoy: number
  totalMes: number
  variacionMes: number
  leadTimePromedioDias: number
  serieUltimosDias: SeriePedido[]
  pedidosRecientes: PedidoReciente[]
}

export interface TopProveedor {
  proveedorId: number
  nombre: string
  pedidos: number
  leadTimePromedioDias: number
}

export interface Proveedores {
  activos: number
  conPedidos30Dias: number
  sinPedidos90Dias: number
  leadTimePromedioDias: number
  topProveedores: TopProveedor[]
}

export interface DashboardResumen {
  ventasDia: VentasDia
  ventasMes: VentasMes
  saldoCaja: SaldoCaja
  clientesAtendidos: ClientesAtendidos
  ultimasVentas: VentaReciente[]
  productosMasVendidos: ProductoMasVendido[]
  productosCriticos: ProductoCritico[]
  productosVencimiento: ProductoVencimiento[]
  pedidos: Pedidos
  proveedores: Proveedores
}

export type AccentColor = "primary" | "emerald" | "amber" | "red" | "violet" | "blue" | "cyan"
