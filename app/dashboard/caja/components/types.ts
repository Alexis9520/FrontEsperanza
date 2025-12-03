export type Usuario = {
  id?: number
  nombre: string
  dni: string
  rol?: string
}

export type Movimiento = {
  id: number
  fecha: string
  tipo: "INGRESO" | "EGRESO" | string
  descripcion: string
  monto: number
  usuario: {
    nombre: string
  }
}

export type CajaResumen = {
  id?: number
  saldoInicial: number
  saldoActual: number
  totalIngresos: number
  totalEgresos: number
  ingresosPorVentas: number
  otrosIngresos: number
  gastosOperativos: number
  otrosEgresos: number
  ingresosYape?: number
  fechaApertura?: string
  fechaCierre?: string
  usuarioResponsable?: string
  movimientos: Movimiento[]
  cajaAbierta?: boolean
}

export type HistorialCaja = {
  id: number
  fechaApertura: string
  fechaCierre?: string | null
  saldoInicial: number
  saldoFinalDeclarado?: number
  saldoFinalCalculado?: number
  totalIngresos: number
  totalEgresos: number
  ingresosYape?: number
  diferencia?: number
  usuario: {
    nombre: string
    rol?: string
  }
  movimientos: Movimiento[]
  observaciones?: string
}
