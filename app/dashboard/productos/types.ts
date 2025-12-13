export type StockLote = {
  id: number
  codigoStock?: string
  cantidadUnidades: number
  fechaVencimiento: string
  precioCompra: number
}

export type Proveedor = {
  id: number
  razonComercial: string
  ruc: string
}

export type Producto = {
  id: number
  codigoBarras: string
  nombre: string
  concentracion: string
  cantidadGeneral: number
  cantidadMinima?: number
  precioVentaUnd: number
  descuento: number
  laboratorio: string
  categoria: string
  cantidadUnidadesBlister?: number
  precioVentaBlister?: number
  principioActivo?: string
  tipoMedicamento?: string
  presentacion?: string
  proveedores?: Proveedor[]
  proveedorIds?: number[]
  fechaCreacion?: string
  stocks?: StockLote[]
  nroRegistroSanitario?: string | null
}

export type FriendlyErrorInfo = { title: string; description: string }

// Tipos para comparación de precios de proveedores
export type ProveedorComparacion = {
  proveedorId: number
  proveedorNombre: string
  proveedorRuc: string
  ultimoPrecio: number
  fechaUltimoPedido: string
  precioPromedio: number
  totalPedidos: number
}

export type ComparacionPreciosResponse = {
  productoId: number
  nombreProducto: string
  codigoBarras: string
  proveedores: ProveedorComparacion[]
}
