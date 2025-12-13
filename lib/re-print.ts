"use client"

/**
 * Re-print utilities for reprinting boletas using enriched data from the backend.
 * This is separate from the initial print (during sale) which uses cart data.
 * 
 * The backend returns DetallesEnriquecidos with:
 * - tipoVenta: "UNIDAD" | "BLISTER"
 * - cantidad: total units
 * - cantidadBlisters: number of blisters sold
 * - unidadesPorBlister: units per blister
 * - precioAplicado: sale price (unit or blister price depending on tipoVenta)
 * - subtotal: line total
 */

import type { DetalleEnriquecido, BoletaDTO } from "@/lib/api"
import type { VentaPreview, NegocioInfo, BoletaOpciones } from "@/lib/print-utils"
import { buildTicketHTML } from "@/lib/print-utils"

export interface ReprintConfig {
    negocio: NegocioInfo
    opciones: BoletaOpciones
}

/**
 * Mapea los detalles enriquecidos del backend al formato VentaItem para el ticket
 */
function mapEnrichedDetailsToItems(
    detalles: DetalleEnriquecido[]
): VentaPreview["items"] {
    return detalles.map(d => {
        let nombreDisplay = d.nombre
        let cantidadDisplay: number

        if (d.tipoVenta === "BLISTER") {
            // Para BLISTER: 
            // - Mostrar cantidad de blisters vendidos
            // - El precio es por blister (precioAplicado = precioActualBlister)
            // - El nombre muestra cuántas unidades tiene cada blister
            const blisters = d.cantidadBlisters || 1
            const undsPerBlister = d.unidadesPorBlister || 10
            nombreDisplay = `${d.nombre} [BLI x${undsPerBlister}]`
            cantidadDisplay = blisters
        } else {
            // Para UNIDAD:
            // - Mostrar cantidad de unidades vendidas
            // - El precio es por unidad (precioAplicado = precioActualUnd)
            cantidadDisplay = d.cantidad
        }

        return {
            nombre: nombreDisplay,
            cantidad: cantidadDisplay,
            precio: d.precioAplicado,
            subtotal: d.subtotal
        }
    })
}

/**
 * Construye la vista previa para reimpresión a partir de una boleta con datos enriquecidos
 */
export function buildReprintPreview(boleta: BoletaDTO): VentaPreview {
    const detalles = boleta.detallesEnriquecidos || []
    const productos = boleta.productos || []

    // Usar detalles enriquecidos si están disponibles, sino fallback a productos legacy
    const items = detalles.length > 0
        ? mapEnrichedDetailsToItems(detalles)
        : productos.map(p => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio: p.precio,
            subtotal: p.cantidad * p.precio
        }))

    return {
        numero: boleta.numero,
        fecha: boleta.fecha,
        cliente: boleta.cliente || "Cliente General",
        vendedor: boleta.usuario || undefined,
        items,
        total: boleta.totalCompra ?? boleta.total ?? 0,
        metodo: {
            nombre: boleta.metodoPago || "Efectivo",
            vuelto: boleta.vuelto ?? 0
        }
    }
}

/**
 * Genera el HTML del ticket para reimpresión
 */
export function buildReprintHTML(
    boleta: BoletaDTO,
    config: ReprintConfig
): string {
    const preview = buildReprintPreview(boleta)
    return buildTicketHTML(preview, config.negocio, config.opciones)
}

/**
 * Obtiene la configuración de impresión desde localStorage
 */
export function getReprintConfig(): ReprintConfig {
    const configGenStr = typeof window !== "undefined"
        ? localStorage.getItem("configuracionGeneral")
        : null
    const configBolStr = typeof window !== "undefined"
        ? localStorage.getItem("configuracionBoleta")
        : null

    const negocio: NegocioInfo = configGenStr ? JSON.parse(configGenStr) : {
        nombreNegocio: "Nueva Esperanza",
        direccion: "Av. La Esperanza 403 - El Tambo",
        telefono: "+51 961 668 320",
        ruc: "1234567890",
        moneda: "S/"
    }

    const configBol = configBolStr ? JSON.parse(configBolStr) : {
        mensajePie: "",
        mostrarLogo: true,
        formatoImpresion: "80mm"
    }

    return {
        negocio,
        opciones: {
            mensajePie: configBol.mensajePie,
            mostrarLogo: configBol.mostrarLogo,
            formatoImpresion: configBol.formatoImpresion
        }
    }
}

/**
 * Abre la ventana de impresión con el ticket de reimpresión
 */
export function openReprintWindow(
    boleta: BoletaDTO,
    config?: ReprintConfig,
    autoprint = true
): Window | null {
    const finalConfig = config || getReprintConfig()
    const html = buildReprintHTML(boleta, finalConfig)

    // Guardar job en localStorage
    localStorage.setItem("ticket_preview_job", JSON.stringify({
        html,
        formato: finalConfig.opciones.formatoImpresion,
        auto: autoprint
    }))

    // Abrir ventana de impresión
    return window.open("/print", "ticketReprint", "width=800,height=900")
}
