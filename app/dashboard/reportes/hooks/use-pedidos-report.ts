import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  fetchWithAuth,
  getPedidoReport,
  type PedidoReportDTO,
} from "@/lib/api"
import { apiUrl } from "@/lib/config"

type Proveedor = {
  id: number
  ruc: string
  razonComercial: string
  numero1: string
  numero2?: string
  correo: string
  direccion: string
  fechaCreacion?: string
  fechaActualizacion?: string
  activo: boolean
}

export function usePedidosReport(isActiveTab: boolean) {
  const router = useRouter()
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [fechaPedido, setFechaPedido] = useState<string>(new Date().toISOString().split('T')[0])
  const [pedidosData, setPedidosData] = useState<PedidoReportDTO[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([])

  // Carga de Proveedores
  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const data = await fetchWithAuth(apiUrl("/proveedores"))
        if (Array.isArray(data)) {
          setProveedores(data)
        }
      } catch (e) {
        console.error("Error cargando proveedores", e)
      }
    }
    fetchProveedores()
  }, [])

  // Carga de Reporte de Pedidos
  useEffect(() => {
    if (!isActiveTab) return

    const fetchPedidos = async () => {
      setLoadingPedidos(true)
      try {
        const pId = selectedProvider ? parseInt(selectedProvider) : 0
        const data = await getPedidoReport({
          proveedorId: pId,
          fechaPedido: fechaPedido
        })
        setPedidosData(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error("Error cargando reporte de pedidos", e)
        setPedidosData([])
      } finally {
        setLoadingPedidos(false)
      }
    }
    fetchPedidos()
  }, [isActiveTab, selectedProvider, fechaPedido])

  // Reset selection when data changes
  useEffect(() => {
    setSelectedKeys([])
  }, [pedidosData])

  const generarPDFPedido = () => {
    const doc = new jsPDF({ orientation: "landscape", format: "a4" })

    const fontSizeTitle = 14
    const fontSizeSub = 10

    const provObj = proveedores.find(p => p.id.toString() === selectedProvider)
    const textoProveedor = provObj
      ? `${provObj.razonComercial} ${provObj.ruc ? `- RUC: ${provObj.ruc}` : ""}`
      : "_____________________________________"

    const [anio, mes, dia] = fechaPedido.split("-")
    const fechaFormateada = `${dia}/${mes}/${anio}`

    doc.setFontSize(8)
    doc.text("FORM-004", 15, 15)
    doc.text("BOTICA NUEVA ESPERANZA", 148, 15, { align: "center" })

    doc.setFontSize(fontSizeTitle)
    doc.setFont("helvetica", "bold")
    doc.text("FORMATO DE RECEPCIÓN DE PRODUCTOS FARMACÉUTICOS Y DISPOSITIVOS MÉDICOS", 148, 25, { align: "center" })

    doc.setFontSize(fontSizeSub)
    doc.setFont("helvetica", "normal")

    let startY = 35
    doc.text(`Fecha De Recepción:  ${fechaFormateada}`, 15, startY)
    doc.text(`Proveedor:  ${textoProveedor}`, 100, startY)

    startY += 8
    doc.text("Documento De Referencia: ______________________________", 15, startY)
    doc.text("Fact. / GR N°: ___________________", 180, startY)

    const tableColumn = [
      "N°",
      "DESCRIPCIÓN DEL PRODUCTO",
      "CONCENTRACIÓN / FORMA",
      "PRESENTACIÓN",
      "LOTE / SERIE",
      "VENCIMI\nENTO",
      "REG SAN /\nNSOC",
      "CANT.\nSOLICIT.",
      "CANT.\nRECIBIDA",
      "COND.\nALMAC.",
      "EMPAQUE\nMEDIATO",
      "EMPAQUE\nINMED.",
      "TIPO\nENVASE",
      "ESTADO\nENVASE"
    ]

    const dataToExport = selectedKeys.length > 0
      ? pedidosData.filter(item => selectedKeys.includes(item.codigoStock))
      : pedidosData

    const tableRows = dataToExport.map((item, index) => [
      index + 1,
      item.producto || "",
      item.concentracion || "",
      item.presentacion || "",
      item.codigoStock || "",
      item.fvencimiento || "",
      "",
      item.cantInicial || "",
      "",
      "",
      "",
      "",
      "",
      ""
    ])

    autoTable(doc, {
      startY: startY + 5,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45 },
        7: { halign: 'center' },
      },
      styles: {
        cellPadding: 2,
        minCellHeight: 8
      },
      margin: { left: 15, right: 15 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(7)
    doc.text("LEYENDA: Empaque inmediato / empaque mediato / estado del envase: Óptimo / Deficiente", 15, finalY)
    doc.text("Tipos de envase: Vidrio / Plástico / Aluminio / Blíster Termosellado / Otros.", 160, finalY)

    const conclsY = finalY + 10
    doc.setFontSize(9)
    doc.text("Conclusiones:", 15, conclsY)
    doc.text("Aprobado   (   )", 60, conclsY)
    doc.text("Rechazado   (   )", 160, conclsY)

    const obsY = conclsY + 10
    doc.text("Observación: _____________________________________________________________________________________________________________", 15, obsY)

    const firmasY = obsY + 30
    doc.line(30, firmasY, 90, firmasY)
    doc.text("RESPONSABLE DE RECEPCIÓN", 60, firmasY + 5, { align: "center" })

    doc.line(110, firmasY, 170, firmasY)
    doc.text("V°B° D.T. QUÍMICO FARMACÉUTICO", 140, firmasY + 5, { align: "center" })

    doc.line(200, firmasY, 260, firmasY)
    doc.text("REPRESENTANTE LEGAL DEL EEFF", 230, firmasY + 5, { align: "center" })

    doc.save(`Recepcion_${fechaPedido}_${provObj?.razonComercial || "General"}.pdf`)
  }

  const navigateToPedidosView = () => {
    const prov = selectedProvider ? encodeURIComponent(selectedProvider) : ""
    const fecha = encodeURIComponent(fechaPedido)
    router.push(`/dashboard/proveedores?view=pedidos&fecha=${fecha}&proveedor=${prov}`)
  }

  return {
    proveedores,
    selectedProvider, setSelectedProvider,
    fechaPedido, setFechaPedido,
    pedidosData,
    loadingPedidos,
    selectedKeys, setSelectedKeys,
    generarPDFPedido,
    navigateToPedidosView
  }
}
