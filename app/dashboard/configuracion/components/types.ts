import { VentaPreview } from "@/lib/print-utils"

export type ConfGeneral = {
  nombreNegocio: string
  direccion: string
  telefono: string
  email?: string
  ruc?: string
  moneda: string
}

export type ConfBoleta = {
  serieBoleta: string
  mensajePie: string
  mostrarLogo: boolean
  imprimirAutomatico: boolean
  formatoImpresion: "80mm" | "58mm" | "a4"
}

export type ConfNotificaciones = {
  stockBajo: boolean
  proximosVencer: boolean
  ventasAltas: boolean
  cierreCaja: boolean
  nuevosUsuarios: boolean
}

export type { VentaPreview }
