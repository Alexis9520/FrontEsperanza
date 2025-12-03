export type LoteRaw = {
  id: number
  codigoStock?: string
  codigoBarras: string
  nombre: string
  concentracion: string
  cantidadUnidades: number
  cantidadMinima: number
  precioCompra: number
  precioVenta: number
  fechaVencimiento: string | null
  laboratorio: string
  categoria: string
}

export type ProductSummary = {
  codigoBarras: string
  nombre: string
  concentracion: string
  laboratorio: string
  categoria: string
  cantidadMinima: number
  cantidadGeneral: number
  unidadesVencidas: number
  unidadesRiesgo30d: number
  unidadesVigentes: number
  diasHastaPrimerVencimiento: number | null
  numeroLotes: number
  costoTotal: number
  costoPromedioUnit: number
  precioVentaUnd: number
  margenUnit: number
  margenPct: number
  valorVentaTeorico: number
  porcentajeEnRiesgo: number
  lotes: LoteRaw[]
}
