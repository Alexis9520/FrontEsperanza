export interface StockItem {
  id: number
  codigoStock: string
  idProducto: number
  nombre: string
  concentracion: string
  cantidadUnidades: number
  cantidadMinima: number
  precioCompra: number
  precioVenta: number
  fechaVencimiento: string
  laboratorio: string | null
  categoria: string | null
}

export interface StockResponse {
  content: StockItem[]
  totalElements: number
  page: number
  size: number
  totalPages: number
}

export interface StockFilters {
  q: string
  lab: string
  cat: string
  codigo: string
}

export interface LowStockProduct {
  id: number
  codigoBarras: string | null
  nombre: string
  concentracion: string | null
  cantidadGeneral: number
  cantidadMinima: number
  precioVentaUnd: number
  laboratorio: string | null
  categoria: string | null
  proveedorNombre: string | null
  stocks: {
    id: number
    codigoStock: string
    cantidadUnidades: number
    fechaVencimiento: string
    precioCompra: number
  }[]
}
