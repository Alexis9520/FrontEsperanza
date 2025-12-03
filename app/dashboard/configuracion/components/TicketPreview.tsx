import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Eye, Printer, RefreshCw, Receipt } from "lucide-react"
import { ConfGeneral, ConfBoleta, VentaPreview } from "./types"
import { GlassPanel, EmbeddedTicket, SectionHeader } from "@/app/dashboard/configuracion/components/SharedUI"

interface TicketPreviewProps {
  venta: VentaPreview
  confGen: ConfGeneral
  confBol: ConfBoleta
  moneda: string
  onPreview: () => void
  onRefresh: () => void
}

export function TicketPreview({
  venta,
  confGen,
  confBol,
  moneda,
  onPreview,
  onRefresh
}: TicketPreviewProps) {
  return (
    <GlassPanel>
      <CardContent className="p-6 space-y-6">
        <SectionHeader 
          icon={<Eye className="h-5 w-5" />}
          title="Vista Previa del Ticket"
          description="Así lucirá tu comprobante con la configuración actual"
        />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onPreview} className="gap-2">
            <Printer className="h-4 w-4" />
            Abrir en ventana
          </Button>
          <Button size="sm" variant="ghost" onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar vista
          </Button>
        </div>

        {/* Ticket preview container */}
        <div className="relative rounded-xl border border-border/50 bg-muted/20 p-6 overflow-hidden">
          {/* Decorative receipt icon */}
          <Receipt className="absolute top-4 right-4 h-16 w-16 text-muted-foreground/5" />
          
          {/* Ticket mockup */}
          <div className="relative mx-auto w-fit">
            {/* Paper shadow effect */}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-lg transform translate-x-1 translate-y-1" />
            
            {/* Actual ticket */}
            <div className="relative bg-white text-black p-5 rounded-lg shadow-lg max-w-[320px] border border-gray-200">
              {/* Perforated edge top */}
              <div className="absolute -top-1 left-2 right-2 h-2 bg-white rounded-b-full" 
                   style={{ 
                     backgroundImage: "radial-gradient(circle, transparent 40%, white 40%)",
                     backgroundSize: "12px 12px",
                     backgroundPosition: "0 -6px"
                   }} 
              />
              
              <EmbeddedTicket
                venta={venta}
                confGen={confGen}
                confBol={confBol}
                moneda={moneda}
              />
              
              {/* Perforated edge bottom */}
              <div className="absolute -bottom-1 left-2 right-2 h-2 bg-white rounded-t-full"
                   style={{ 
                     backgroundImage: "radial-gradient(circle, transparent 40%, white 40%)",
                     backgroundSize: "12px 12px",
                     backgroundPosition: "0 6px"
                   }} 
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          💡 Para ver el formato de impresión real, usa "Abrir en ventana" y prueba la impresión.
        </p>
      </CardContent>
    </GlassPanel>
  )
}
