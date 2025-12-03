import type { VentaItem, BoletaDTO } from "@/lib/api"

export type ProductoVendido = VentaItem
export type Boleta = BoletaDTO
export type Rango = { from: Date | undefined; to: Date | undefined }
