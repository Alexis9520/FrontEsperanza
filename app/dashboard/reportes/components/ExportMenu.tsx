"use client"

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, AlertTriangle, Clock, PackageX } from "lucide-react"
import { exportInventory, exportInventoryFull } from "@/lib/api"
import React, { useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  search?: string
  categoria?: string
  activo?: boolean
  nearExpiryDays?: number
}

export function ExportMenu({ search, categoria, activo, nearExpiryDays = 30 }: Props) {
  const [exportState, setExportState] = useState<'idle'|'generating'|'downloading'>('idle')

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={exportState !== 'idle'}
        className={cn(
          "border-border/60 hover:bg-primary/5 hover:border-primary/40 transition-all",
          exportState !== 'idle' && "opacity-70"
        )}
        onClick={async () => {
          setExportState('generating')
          try {
            await exportInventoryFull({ search, categoria, activo }, () => setExportState('downloading'))
          } catch (e: any) {
            alert(e?.message || "No se pudo exportar (¿permisos de Admin?)")
          } finally {
            setExportState('idle')
          }
        }}
      >
        {exportState === 'idle' && (
          <>
            <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-500" /> Inventario FULL
          </>
        )}
        {exportState === 'generating' && (
          <>
            <svg className="animate-spin w-4 h-4 mr-1.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Generando...
          </>
        )}
        {exportState === 'downloading' && (
          <>
            <svg className="animate-spin w-4 h-4 mr-1.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Descargando...
          </>
        )}
      </Button>

      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => exportInventory("all")}
        className="border-border/60 hover:bg-muted/50 transition-all"
      >
        <Download className="w-4 h-4 mr-1.5 text-muted-foreground" /> Resumen
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => exportInventory("low")}
        className="border-border/60 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all"
      >
        <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-500" /> Bajo mínimo
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => exportInventory("near-expiry", nearExpiryDays)}
        className="border-border/60 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all"
      >
        <Clock className="w-4 h-4 mr-1.5 text-orange-500" /> Próx. vencer
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => exportInventory("out-of-stock")}
        className="border-border/60 hover:bg-red-500/10 hover:border-red-500/40 transition-all"
      >
        <PackageX className="w-4 h-4 mr-1.5 text-red-500" /> Sin stock
      </Button>
    </div>
  )
}