"use client"

import React, { useState } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/use-toast'
import { apiUrl } from '@/lib/config'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ComboBoxCategoria } from "@/components/ComboBoxCategoria" // Asegúrate que la ruta sea correcta
import { ComboBoxProveedor } from "@/components/ComboBoxProveedor" // Asegúrate que la ruta sea correcta
import clsx from "clsx"

// Definimos qué datos necesita este componente para funcionar
interface ProductoFormProps {
  datos: any // Podrías importar el tipo ProductoFormState si quieres ser estricto
  setDatos: React.Dispatch<React.SetStateAction<any>>
  diccionarioProveedores: Record<number, string>
  modoEdicion?: boolean
}

export default function ProductoForm({
  datos,
  setDatos,
  diccionarioProveedores,
  modoEdicion = false
}: ProductoFormProps) {

  // Helper interno para actualizar el estado del padre
  const update = (key: string, val: any) => {
    setDatos((prev: any) => ({ ...prev, [key]: val }))
  }
  const [searching, setSearching] = useState(false)
  const { toast } = useToast()
  const [digemidDialogOpen, setDigemidDialogOpen] = useState(false)
  const [digemidPayload, setDigemidPayload] = useState<any>(null)
  const [digemidAlert, setDigemidAlert] = useState<string | null>(null)
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [validatingSession, setValidatingSession] = useState(false)
  const [lastSearchNro, setLastSearchNro] = useState<string | null>(null)

  // Apply normalized payload into the form state
  const applyNormalized = (norm: any) => {
    if (!norm) return
    setDatos((prev: any) => ({
      ...prev,
      nombre: norm.nombre ?? prev.nombre,
      concentracion: norm.concentracion ?? prev.concentracion,
      laboratorio: norm.laboratorio ?? prev.laboratorio,
      categoria: norm.categoria ?? prev.categoria,
      presentacion: norm.presentacion ?? prev.presentacion,
      precio_venta_und: norm.precioVentaUnd !== undefined && norm.precioVentaUnd !== null ? String(norm.precioVentaUnd) : prev.precio_venta_und,
      cantidad_general: norm.cantidadGeneral !== undefined && norm.cantidadGeneral !== null ? String(norm.cantidadGeneral) : prev.cantidad_general,
      nro_registro_sanitario: norm.nroRegistroSanitario ?? norm.nro ?? prev.nro_registro_sanitario
    }))
  }

  // Perform a scraping request for a given RNS, handle session creation/validation flow and results
  async function performScrape(nro: string) {
    const token = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage.getItem('token') : ''
    try {
      const res = await fetch(apiUrl('/api/scraping/scrape'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ nroDeRegistroSanitario: nro })
      })

      // Handle 404 specially - could be a session error that needs session creation flow
      if (res.status === 404) {
        let data404: any = null
        try { data404 = await res.json() } catch { }
        // Check if it's a "no validated session" error - if so, start session creation flow
        if (data404 && typeof data404.error === 'string' && data404.error.toLowerCase().includes('no validated session')) {
          toast({ title: 'DIGEMID', description: 'Sin sesión válida, creando nueva sesión...', variant: 'warning' })
          // create session
          try {
            console.log('[DIGEMID] Iniciando creación de sesión...')
            const sres = await fetch(apiUrl('/api/scraping/session/create'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : ''
              }
            })
            console.log('[DIGEMID] Respuesta de crear sesión - status:', sres.status, 'ok:', sres.ok)
            if (!sres.ok) {
              let m = 'No se pudo crear sesión DIGEMID'
              try { const t = await sres.text(); if (t) m = t } catch { }
              console.log('[DIGEMID] Error al crear sesión:', m)
              toast({ title: 'DIGEMID', description: m, variant: 'destructive' })
              return
            }
            const sdata = await sres.json()
            console.log('[DIGEMID] Respuesta JSON de crear sesión:', sdata)
            const spayload = sdata?.json ?? sdata
            console.log('[DIGEMID] Payload procesado:', spayload)
            console.log('[DIGEMID] vnc_url:', spayload?.vnc_url, 'vncUrl:', spayload?.vncUrl)
            setSessionInfo(spayload)
            setSessionDialogOpen(true)
            console.log('[DIGEMID] Dialog abierto, sessionInfo establecido')
            toast({ title: 'DIGEMID', description: 'Sesión creada. Resuelve el captcha en la ventana y valida.', variant: 'info' })
          } catch (err) {
            console.error('[DIGEMID] Error crear sesión DIGEMID', err)
            toast({ title: 'DIGEMID', description: 'Error al crear sesión', variant: 'destructive' })
          }
          return
        }
        // Not a session error, treat as generic 404 error
        const msg = data404?.error || data404?.message || 'No se pudo consultar DIGEMID (404)'
        toast({ title: 'DIGEMID', description: msg, variant: 'destructive' })
        return
      }

      if (!res.ok) {
        let msg = 'No se pudo consultar DIGEMID'
        try { const t = await res.text(); if (t) msg = t } catch { }
        toast({ title: 'DIGEMID', description: msg, variant: 'destructive' })
        return
      }

      const data = await res.json()
      // If top-level error about no validated session (for non-404 responses), show toast and start session creation
      if (data && typeof data.error === 'string' && data.error.toLowerCase().includes('no validated session')) {
        toast({ title: 'DIGEMID', description: 'Sin sesión valida, creando nueva sesión', variant: 'warning' })
        // create session
        try {
          const sres = await fetch(apiUrl('/api/scraping/session/create'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({})
          })
          if (!sres.ok) {
            let m = 'No se pudo crear sesión DIGEMID'
            try { const t = await sres.text(); if (t) m = t } catch { }
            toast({ title: 'DIGEMID', description: m, variant: 'destructive' })
            return
          }
          const sdata = await sres.json()
          const spayload = sdata?.json ?? sdata
          setSessionInfo(spayload)
          setSessionDialogOpen(true)
          toast({ title: 'DIGEMID', description: 'Sesión creada. Resuelve el captcha en la ventana y valida.', variant: 'info' })
        } catch (err) {
          console.error('Error crear sesión DIGEMID', err)
          toast({ title: 'DIGEMID', description: 'Error al crear sesión', variant: 'destructive' })
        }
        return
      }

      const payload = data?.json ?? data
      const alertMsg = payload?.alert ?? payload?.note ?? ''

      if (payload && (payload.count === 1 || payload.count === '1')) {
        if (alertMsg) toast({ title: 'DIGEMID', description: alertMsg })
        applyNormalized(payload.selected_normalized ?? payload.selected_normalized)
      } else if (payload && (payload.count > 1 || (typeof payload.count === 'string' && Number(payload.count) > 1))) {
        if (alertMsg) {
          setDigemidPayload(payload)
          setDigemidAlert(alertMsg)
          setDigemidDialogOpen(true)
        } else {
          toast({ title: 'DIGEMID', description: 'Se encontraron múltiples resultados. Revisa manualmente.' })
        }
      } else {
        toast({ title: 'DIGEMID', description: 'No se encontró información para ese registro.' })
      }
    } catch (err) {
      console.error('Error performScrape', err)
      toast({ title: 'DIGEMID', description: 'Error al consultar DIGEMID', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4 py-2">
      {/* GRUPO 1: IDENTIDAD */}
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-8 sm:col-span-9">
          <Field
            label="Nombre del Producto *"
            value={datos.nombre}
            onChange={(v: string) => update("nombre", v)}
            placeholder="Ej. Paracetamol 500mg"
          />
        </div>
        <div className="col-span-4 sm:col-span-3">
          <Field
            label="Cód. Barras"
            value={datos.codigo_barras}
            onChange={(v: string) => update("codigo_barras", v)}
            placeholder="Escanea..."
          />
        </div>
      </div>

      {/* GRUPO 2: CLASIFICACIÓN */}
      <div className="rounded-lg border p-3 bg-muted/20 space-y-3">
        <SectionTitle title="Clasificación y Detalles" small />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
              Categoría
            </Label>
            <ComboBoxCategoria
              value={datos.categoria}
              onChange={(v) => update("categoria", v)}
            />
          </div>
          <Field
            label="Laboratorio"
            value={datos.laboratorio}
            onChange={(v: string) => update("laboratorio", v)}
            placeholder="Ej. Bagó"
          />

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
              Tipo
            </Label>
            <Select
              value={datos.tipoMedicamento}
              onValueChange={(v) => update("tipoMedicamento", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENÉRICO">Genérico</SelectItem>
                <SelectItem value="MARCA">Marca</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Field
            label="Principio Activo"
            value={datos.principioActivo}
            onChange={(v: string) => update("principioActivo", v)}
          />
          <Field
            label="Concentración"
            value={datos.concentracion}
            onChange={(v: string) => update("concentracion", v)}
          />
          <Field
            label="Presentación"
            value={datos.presentacion}
            onChange={(v: string) => update("presentacion", v)}
            placeholder="Ej. Caja x 10"
          />
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase">
              N.º Registro Sanitario
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                value={datos.nro_registro_sanitario}
                placeholder="Ej. RNS-123456"
                onChange={(e) => update("nro_registro_sanitario", e.target.value)}
                className="h-9 text-sm bg-background/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50 flex-1"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  const nro = (datos.nro_registro_sanitario || '').trim()
                  if (!nro) {
                    toast({ title: 'DIGEMID', description: 'Ingresa un número de registro sanitario antes de buscar', variant: 'warning' })
                    return
                  }
                  setLastSearchNro(nro)
                  setSearching(true)
                  try {
                    await performScrape(nro)
                  } finally {
                    setSearching(false)
                  }
                }}
                disabled={!datos.nro_registro_sanitario || !String(datos.nro_registro_sanitario).trim()}
              >
                {searching ? 'Buscando...' : 'Buscar DIGEMID'}
              </Button>
              <Dialog open={digemidDialogOpen} onOpenChange={(open) => setDigemidDialogOpen(open)}>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Registros Múltiples Encontrados
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {digemidAlert || 'Se encontraron varios registros sanitarios. Selecciona cuál deseas utilizar:'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Card: Registro Expirado */}
                    <div
                      className="group relative rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/10 p-4 cursor-pointer transition-all duration-200 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
                      onClick={() => {
                        applyNormalized(digemidPayload?.selected_normalized)
                        setDigemidDialogOpen(false)
                        setDigemidPayload(null)
                        setDigemidAlert(null)
                      }}
                    >
                      {/* Badge de estado */}
                      <div className="absolute -top-2 right-3">
                        <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/50 text-[10px] uppercase tracking-wider">
                          Expirado / Anterior
                        </Badge>
                      </div>

                      {/* Icono */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-amber-100 group-hover:text-amber-50 transition-colors">
                          Registro buscado
                        </h4>
                      </div>

                      {/* Datos */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span className="font-medium text-right max-w-[60%] truncate" title={digemidPayload?.selected_normalized?.nombre}>
                            {digemidPayload?.selected_normalized?.nombre ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Laboratorio:</span>
                          <span className="font-medium">{digemidPayload?.selected_normalized?.laboratorio ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RNS:</span>
                          <span className="font-mono text-xs bg-black/20 px-1.5 py-0.5 rounded">
                            {digemidPayload?.selected_normalized?.nroRegistroSanitario ?? digemidPayload?.selected?.rs ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Situación:</span>
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30">
                            {digemidPayload?.selected?.situacion ?? digemidPayload?.selected_normalized?.situacion ?? '—'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimiento:</span>
                          <span className="text-amber-400 font-medium">{digemidPayload?.selected?.fecha_vencimiento ?? '—'}</span>
                        </div>
                      </div>

                      {/* Botón implícito */}
                      <div className="mt-4 pt-3 border-t border-amber-500/20">
                        <div className="text-center text-xs text-amber-500/70 group-hover:text-amber-400 transition-colors">
                          Clic para usar este registro →
                        </div>
                      </div>
                    </div>

                    {/* Card: Registro Vigente */}
                    <div
                      className="group relative rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-cyan-500/10 p-4 cursor-pointer transition-all duration-200 hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10"
                      onClick={() => {
                        applyNormalized(digemidPayload?.newSelected_normalized ?? digemidPayload?.selected_normalized)
                        setDigemidDialogOpen(false)
                        setDigemidPayload(null)
                        setDigemidAlert(null)
                      }}
                    >
                      {/* Badge de estado */}
                      <div className="absolute -top-2 right-3">
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-500 border-emerald-500/50 text-[10px] uppercase tracking-wider">
                          ✓ Vigente / Actual
                        </Badge>
                      </div>

                      {/* Icono */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-emerald-100 group-hover:text-emerald-50 transition-colors">
                          Registro actualizado
                        </h4>
                      </div>

                      {/* Datos */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span className="font-medium text-right max-w-[60%] truncate" title={digemidPayload?.newSelected_normalized?.nombre ?? digemidPayload?.selected_normalized?.nombre}>
                            {digemidPayload?.newSelected_normalized?.nombre ?? digemidPayload?.selected_normalized?.nombre ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Laboratorio:</span>
                          <span className="font-medium">{digemidPayload?.newSelected_normalized?.laboratorio ?? digemidPayload?.selected_normalized?.laboratorio ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">RNS:</span>
                          <span className="font-mono text-xs bg-black/20 px-1.5 py-0.5 rounded">
                            {digemidPayload?.newSelected_normalized?.nroRegistroSanitario ?? digemidPayload?.newSelected?.rs ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Situación:</span>
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                            {digemidPayload?.newSelected?.situacion ?? '—'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vencimiento:</span>
                          <span className="text-emerald-400 font-medium">{digemidPayload?.newSelected?.fecha_vencimiento ?? '—'}</span>
                        </div>
                      </div>

                      {/* Botón implícito */}
                      <div className="mt-4 pt-3 border-t border-emerald-500/20">
                        <div className="text-center text-xs text-emerald-500/70 group-hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                          <span>Recomendado</span>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                      <Button variant="ghost" className="text-muted-foreground">
                        Cancelar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* SESSION DIALOG - appears when a session is created and needs captcha validation */}
              <Dialog open={sessionDialogOpen} onOpenChange={(open) => setSessionDialogOpen(open)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Validar sesión DIGEMID</DialogTitle>
                    <DialogDescription>Se creó una nueva sesión para completar el captcha. Abre la vista integrada o en una pestaña nueva, resuelve el captcha y luego valida la sesión.</DialogDescription>
                  </DialogHeader>

                  <div className="py-3">
                    <div className="w-full h-64 bg-black/10 rounded-md overflow-hidden">
                      {(() => {
                        const baseUrl = sessionInfo?.vnc_url ?? sessionInfo?.json?.vnc_url ?? sessionInfo?.vncUrl ?? sessionInfo?.json?.vncUrl
                        if (!baseUrl) return <div className="p-4">No hay URL disponible para la sesión.</div>
                        // Agregar password=secret a la URL
                        const urlWithPassword = baseUrl.includes('?') ? `${baseUrl}&password=secret` : `${baseUrl}?password=secret`
                        return (
                          <iframe
                            title="DIGEMID VNC"
                            src={urlWithPassword}
                            className="w-full h-full border-0"
                          />
                        )
                      })()}
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                      <Button variant="outline" onClick={() => {
                        const baseUrl = sessionInfo?.vnc_url ?? sessionInfo?.json?.vnc_url ?? sessionInfo?.vncUrl ?? sessionInfo?.json?.vncUrl
                        if (baseUrl) {
                          const urlWithPassword = baseUrl.includes('?') ? `${baseUrl}&password=secret` : `${baseUrl}?password=secret`
                          globalThis.open(urlWithPassword, '_blank')
                        }
                      }}>Abrir en nueva pestaña</Button>

                      <Button onClick={async () => {
                        if (!sessionInfo) return
                        const sessionId = sessionInfo.session_id ?? sessionInfo.json?.session_id ?? sessionInfo.sessionId ?? sessionInfo.json?.sessionId
                        if (!sessionId) {
                          toast({ title: 'DIGEMID', description: 'ID de sesión no disponible', variant: 'destructive' })
                          return
                        }
                        setValidatingSession(true)
                        try {
                          const token = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) ? (globalThis as any).localStorage.getItem('token') : ''
                          const res = await fetch(apiUrl(`/api/scraping/session/${sessionId}/validate`), {
                            method: 'POST',
                            headers: { Authorization: token ? `Bearer ${token}` : '' }
                          })
                          if (!res.ok) {
                            let txt = 'No se pudo validar la sesión'
                            try { const t = await res.text(); if (t) txt = t } catch { }
                            toast({ title: 'DIGEMID', description: txt, variant: 'destructive' })
                            return
                          }
                          toast({ title: 'DIGEMID', description: 'Sesión validada, reintentando búsqueda...', variant: 'success' })
                          setSessionDialogOpen(false)
                          setSessionInfo(null)
                          // retry
                          if (lastSearchNro) await performScrape(lastSearchNro)
                        } catch (err) {
                          console.error('Error validar sesión', err)
                          toast({ title: 'DIGEMID', description: 'Error al validar sesión', variant: 'destructive' })
                        } finally {
                          setValidatingSession(false)
                        }
                      }}>{validatingSession ? 'Validando...' : 'Ya validé / Validar sesión'}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {(() => {
              const val = String(datos.nro_registro_sanitario || "")
              const tooLong = val.length > 64
              const invalidPattern = val && !/^[A-Za-z0-9\-\/\s]*$/.test(val)
              if (tooLong) return <p className="text-xs text-destructive mt-1">Máximo 64 caracteres permitido.</p>
              if (invalidPattern) return <p className="text-xs text-destructive mt-1">Formato inválido. Solo letras, números, espacios, guiones y barras permitidos.</p>
              return null
            })()}
          </div>
        </div>
      </div>

      {/* GRUPO 3: PROVEEDORES */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold">Proveedores Asignados</Label>
          <ComboBoxProveedor
            value={null}
            onChange={(id) => {
              if (id && !datos.proveedorIds.includes(id)) {
                update("proveedorIds", [...datos.proveedorIds, id])
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded border border-dashed bg-background/50">
          {datos.proveedorIds.length === 0 && (
            <span className="text-[10px] text-muted-foreground italic">
              Ninguno seleccionado
            </span>
          )}
          {datos.proveedorIds.map((id: number) => (
            <Badge key={id} variant="secondary" className="h-6 gap-1 pr-1">
              {diccionarioProveedores[id] || `ID ${id}`}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-500"
                onClick={() =>
                  update(
                    "proveedorIds",
                    datos.proveedorIds.filter((pid: number) => pid !== id)
                  )
                }
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* GRUPO 4: ECONOMÍA */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Columna Izq */}
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 space-y-3">
          <SectionTitle title="Venta Unitaria & Stock" small />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Precio Venta (S/)"
              type="number"
              step="0.01"
              value={datos.precio_venta_und}
              onChange={(v: string) => update("precio_venta_und", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-cyan-500/20">
            <Field
              label="Stock Mínimo"
              type="number"
              value={datos.cantidad_minima}
              onChange={(v: string) => update("cantidad_minima", v)}
            />
          </div>
        </div>

        {/* Columna Der */}
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-3">
          <SectionTitle title="Configuración Blister" small />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Unidades x Blister"
              type="number"
              value={datos.cantidad_unidades_blister}
              onChange={(v: string) => update("cantidad_unidades_blister", v)}
            />
            <Field
              label="Precio Blister (S/)"
              type="number"
              step="0.01"
              value={datos.precio_venta_blister}
              onChange={(v: string) => update("precio_venta_blister", v)}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 italic">
            * Opcional para ventas fraccionadas.
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Componentes auxiliares locales ---
function SectionTitle({ title, small = false }: { title: string; small?: boolean }) {
  return (
    <h3
      className={clsx(
        "font-semibold tracking-tight flex items-center gap-2",
        small ? "text-xs uppercase text-muted-foreground" : "text-sm text-slate-100"
      )}
    >
      {title}
    </h3>
  )
}

function Field({ label, value, onChange, type = "text", step, placeholder }: any) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-muted-foreground uppercase">
        {label}
      </Label>
      <Input
        value={value}
        type={type}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-sm bg-background/50 focus-visible:ring-1 focus-visible:ring-cyan-400/50"
      />
    </div>
  )
}