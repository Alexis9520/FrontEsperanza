import { apiUrl } from "./config"

type ToastFn = (opts: { title: string; description: string; variant?: "destructive" | "default" }) => void;

type ApiError = Error & {
  status?: number
  statusText?: string | null
  backendMessage?: string
  url?: string
  rawBody?: string
}

function createApiError(message: string, status: number, meta: Partial<ApiError> = {}) {
  const error = new Error(message || `Error ${status}`) as ApiError
  error.status = status
  if (meta.statusText !== undefined) error.statusText = meta.statusText
  if (meta.backendMessage !== undefined) error.backendMessage = meta.backendMessage
  if (meta.url !== undefined) error.url = meta.url
  if (meta.rawBody !== undefined) error.rawBody = meta.rawBody
  return error
}

// Detecta rutas solo-ADMIN
function isAdminOnlyPath(url: string): boolean {
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    const p = u.pathname || "";
    // Ajusta este listado si tienes más prefijos solo-admin
    return /^\/api\/(dashboard|reports|admin)(\/|$)/.test(p);
  } catch {
    // Si es una URL relativa no parseable, haz una comprobación simple
    return /\/api\/(dashboard|reports|admin)\b/.test(url);
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}, toastFn?: ToastFn) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    if (toastFn) toastFn({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente.", variant: "destructive" });
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("No token");
  }
  const hasBody = !!options.body;
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    ...(hasBody ? { "Content-Type": (options.headers as any)?.["Content-Type"] || "application/json" } : {})
  } as Record<string, string>;

  // Include credentials so session cookies (JSESSIONID) are sent for cross-origin setups
  const res = await fetch(url, { ...options, headers, credentials: "include" });

  if (!res.ok) {
    let errorText = await res.text(); let backendMsg = "";
    try { const json = JSON.parse(errorText); backendMsg = json.message || errorText; } catch { backendMsg = errorText; }
    const lowerMsg = (backendMsg || "").toLowerCase();

    // If server returns 403 with empty body, log a short warning to help debug auth/session issues
    if (res.status === 403 && (!backendMsg || backendMsg.trim().length === 0)) {
      console.warn("fetchWithAuth: 403 Forbidden from", url, "- response had empty body. Check token, session cookie or backend permissions.")
    }

    if (res.status === 403 && lowerMsg.includes("cerrar tu caja")) {
      if (toastFn) toastFn({ title: "Atención", description: backendMsg, variant: "destructive" });
      if (typeof window !== "undefined" && window.location.pathname !== "/dashboard/caja") window.location.href = "/dashboard/caja";
      return null;
    }
    if (res.status === 403 && (lowerMsg.includes("fuera de tu horario") || lowerMsg.includes("fuera de horario"))) {
      if (toastFn) toastFn({ title: "Acceso fuera de turno", description: backendMsg, variant: "destructive" });
      localStorage.removeItem("token"); localStorage.removeItem("usuario");
      if (typeof window !== "undefined") window.location.href = "/login";
      throw createApiError(backendMsg || "Acceso denegado", 403, { statusText: res.statusText, backendMessage: backendMsg, url, rawBody: errorText });
    }
    if (res.status === 401) {
      localStorage.removeItem("token"); localStorage.removeItem("usuario");
      if (toastFn) toastFn({ title: "Sesión expirada", description: "Por seguridad, inicia sesión nuevamente.", variant: "destructive" });
      if (typeof window !== "undefined") window.location.href = "/login";
      throw createApiError("Sesión expirada", 401, { statusText: res.statusText, backendMessage: backendMsg, url, rawBody: errorText });
    }

    if (toastFn) toastFn({ title: "Error", description: backendMsg || `Error en la petición: ${res.status}`, variant: "destructive" });
    throw createApiError(backendMsg || `Error en la petición: ${res.status}`, res.status, { statusText: res.statusText, backendMessage: backendMsg, url, rawBody: errorText });
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/octet-stream") || contentType.includes("application/vnd.openxmlformats")) return res;
  const contentLength = res.headers.get("content-length");
  if (res.status === 204 || contentLength === "0") return null;

  const text = await res.text(); if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function downloadWithAuth(path: string, filename = "reporte.xlsx", toastFn?: ToastFn, onStart?: () => void) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) {
    if (toastFn) toastFn({ title: "Sesión expirada", description: "Por favor inicia sesión nuevamente.", variant: "destructive" });
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("No token");
  }
  const res = await fetch(apiUrl(path), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const blob = await res.blob(); let msg = `Error ${res.status}`;
    try { const text = await blob.text(); const json = JSON.parse(text); msg = json.message || text || msg; } catch { }
    throw new Error(msg);
  }
  // Notifica al llamador que la respuesta del servidor llegó y la descarga está por comenzar
  try { onStart && onStart(); } catch (e) { console.warn("onStart callback failed", e) }

  const blob = await res.blob(); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* Tipos */
export type SalesSummary = { ventas: number; tickets: number; unidades: number; ticket_promedio: number; upt: number }
export type SalesByDay = { fecha: string; tickets: number; unidades: number; ventas: number; ticket_promedio: number; upt: number }
export type SalesByHour = { hora: number; tickets: number; ventas: number }
export type TopProduct = { codigo_barras: string; nombre: string; categoria: string | null; unidades: number; ventas: number }
export type PaymentMix = { metodo_pago: string; tickets: number; total: number }
export type TopCustomer = { dni: string | null; nombre: string | null; tickets: number; unidades: number; ventas: number; ultima_compra: string | null }
export type InventoryProductFull = {
  codigo_barras: string; cantidad_unidades_blister: number | null; activo: boolean | null; cantidad_general: number | null; categoria: string | null;
  concentracion: string | null; descuento: number | null; fecha_actualizacion: string | null; fecha_creacion: string | null; laboratorio: string | null;
  nombre: string; precio_venta_blister: number | null; precio_venta_und: number | null; cantidad_minima: number | null; principio_activo: string | null;
  tipo_medicamento: string | null; presentacion: string | null; stock_total: number; lotes: number; lotes_vencidos: number; proximo_vencimiento: string | null;
  valor_compra_total: number | null; costo_promedio: number | null
}
export type InventoryLot = { lote_id: number; codigo_barras: string; cantidad_unidades: number; fecha_vencimiento: string | null; precio_compra: number | null; estado: string }
export type CajaSummary = { ingresos: number; egresos: number; neto: number }

/* Lotes Report - Batch/Lot tracking */
export type LoteReportDTO = {
  productoId: number;
  nombreProducto: string;
  codigoBarras: string;
  concentracion: string | null;
  presentacion: string | null;
  stockId: number;
  codigoStock: string | null;
  cantidadUnidades: number;
  cantidadInicial: number;
  fechaVencimiento: string | null;
  precioCompra: number | null;
  fechaCreacion: string | null;
}

/* Products endpoint types */
export type ProductStock = {
  codigoStock: string | null;
  cantidadUnidades: number;
  fechaVencimiento: string | null;
  precioCompra: number | null;
}

export type ProductDTO = {
  id: number;
  codigoBarras: string;
  nombre: string;
  concentracion: string | null;
  cantidadGeneral: number;
  cantidadMinima: number | null;
  precioVentaUnd: number | null;
  descuento: number | null;
  laboratorio: string | null;
  categoria: string | null;
  cantidadUnidadesBlister: number | null;
  precioVentaBlister: number | null;
  principioActivo: string | null;
  tipoMedicamento: string | null;
  presentacion: string | null;
  proveedorId: number | null;
  proveedorNombre: string | null;
  stocks: ProductStock[];
  nroRegistroSanitario?: string | null;
}
// Para el POST /api/pedidos/agregar-stock
export type NewStockLot = {
  codigoStock: string;
  cantidadUnidades: number;
  fechaVencimiento: string | null; // "YYYY-MM-DD"
  precioCompra: number;
}

export type AddStockPayload = {
  stockData: {
    productoId: number;
    lotes: NewStockLot[];
  };
  fechaDePedido: string; // "YYYY-MM-DD"
}

export type EditPedidoPayload = {
  proveedorId: number;
  fechaDePedido: string; // "YYYY-MM-DD"
  stock: {
    codigoStock: string;
    cantidadInicial: number;
    fechaVencimiento: string | null; // "YYYY-MM-DD"
    precioCompra: number;
  }
}

// Para el GET /api/pedidos/reporte
export type PedidoReportDTO = {
  codigoBarras: string;
  producto: string;
  concentracion: string | null;
  presentacion: string | null;
  codigoStock: string;
  cantUnidades: number;
  cantInicial: number;
  precioCompra: number;
  fechaDePedido: string | null; // "YYYY-MM-DD"
  fvencimiento: string | null;
  fcreacion: string;
  pedidoId: number;
}
/* Utils */
function toQuery(params?: Record<string, any>) {
  if (!params) return ""; const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v === undefined || v === null) return; if (v instanceof Date) search.append(k, v.toISOString()); else search.append(k, String(v)); });
  const s = search.toString(); return s ? `?${s}` : "";
}

/* Ventas (reportes - ADMIN) */
export function getSalesSummary({ from, to }: { from: Date; to: Date }) { return fetchWithAuth(apiUrl("/api/reports/sales/summary") + toQuery({ from, to })) as Promise<SalesSummary> }
export function getSalesByDay({ from, to }: { from: Date; to: Date }) { return fetchWithAuth(apiUrl("/api/reports/sales/by-day") + toQuery({ from, to })) as Promise<SalesByDay[]> }
export function getSalesByHour({ from, to }: { from: Date; to: Date }) { return fetchWithAuth(apiUrl("/api/reports/sales/by-hour") + toQuery({ from, to })) as Promise<SalesByHour[]> }
export function getTopProducts({ from, to, limit = 10 }: { from: Date; to: Date; limit?: number }) { return fetchWithAuth(apiUrl("/api/reports/sales/top-products") + toQuery({ from, to, limit })) as Promise<TopProduct[]> }
export function getPaymentMix({ from, to }: { from: Date; to: Date }) { return fetchWithAuth(apiUrl("/api/reports/sales/payment-mix") + toQuery({ from, to })) as Promise<PaymentMix[]> }

/* Inventario (reportes - ADMIN) */
export type PageResponse<T> = {
  items(items: any): unknown; content: T[]; totalElements: number; page: number; size: number; totalPages: number
}
export function getInventoryFull(params: { search?: string; categoria?: string; activo?: boolean; page?: number; size?: number; sort?: string; dir?: "asc" | "desc" }) {
  const { page = 0, size = 50, sort = "nombre", dir = "asc", ...rest } = params || {};
  return fetchWithAuth(apiUrl("/api/reports/inventory/full") + toQuery({ page, size, sort, dir, ...rest })) as Promise<PageResponse<InventoryProductFull>>;
}
export function getInventoryLots(codigo_barras: string) { return fetchWithAuth(apiUrl("/api/reports/inventory/lots") + toQuery({ codigo_barras })) as Promise<InventoryLot[]> }
export function exportInventoryFull(params: { search?: string; categoria?: string; activo?: boolean } = {}, onStart?: () => void) {
  const q = toQuery(params);
  // Pasamos onStart como cuarto argumento a downloadWithAuth (toastFn queda por defecto undefined)
  return downloadWithAuth(`/api/reports/inventory/export-full${q}`, "inventario_full.xlsx", undefined, onStart)
}
export function exportInventory(scope: "all" | "low" | "near-expiry" | "out-of-stock", days = 30) { const q = toQuery({ scope, days: scope === "near-expiry" ? days : undefined, format: "xlsx" }); return downloadWithAuth(`/api/reports/inventory/export${q}`, `inventario_${scope}.xlsx`) }

/* Clientes (reportes - ADMIN) */
export function getTopCustomers({ from, to, limit = 20, sortBy = "ventas" as "ventas" | "tickets" }: { from?: Date; to?: Date; limit?: number; sortBy?: "ventas" | "tickets" }) {
  return fetchWithAuth(apiUrl("/api/reports/customers/top") + toQuery({ from, to, limit, sortBy })) as Promise<TopCustomer[]>;
}
export function exportCustomers({ from, to }: { from?: Date; to?: Date }) {
  const q = toQuery({ from, to, format: "xlsx" });
  return downloadWithAuth(`/api/reports/customers/export${q}`, `clientes_top.xlsx`);
}

/* Caja (si esto también es admin, queda suavizado por fetchWithAuth) */
export function getCajaSummary({ from, to }: { from: Date; to: Date }) {
  return fetchWithAuth(apiUrl("/api/reports/caja/summary") + toQuery({ from, to })) as Promise<CajaSummary>;
}

/* Ventas export (admin) */
export function exportSalesByDay({ from, to }: { from: Date; to: Date }) { const q = toQuery({ from, to, group_by: "day", format: "xlsx" }); return downloadWithAuth(`/api/reports/sales/export${q}`, `ventas_por_dia.xlsx`) }
export function exportSalesByProduct({ from, to }: { from: Date; to: Date }) { const q = toQuery({ from, to, group_by: "product", format: "xlsx" }); return downloadWithAuth(`/api/reports/sales/export${q}`, `ventas_por_producto.xlsx`) }
export function exportInventoryProfessional(params: { search?: string; categoria?: string; activo?: boolean } = {}) {
  const q = toQuery(params)
  return downloadWithAuth(`/api/reports/inventory/export-professional${q}`, "Inventario_Botica.xlsx")
}

/* Lotes Report (batches/lots by date range) */
export function getLotesReport({ fechaInicio, fechaFin }: { fechaInicio: string; fechaFin: string }) {
  return fetchWithAuth(apiUrl("/api/reports/lotes-json") + toQuery({ fechaInicio, fechaFin })) as Promise<LoteReportDTO[]>;
}

/* Products endpoint - New inventory source */
export function getProducts(params: { page?: number; size?: number; search?: string; q?: string; categoria?: string; laboratorio?: string; tipoMedicamento?: string } = {}) {
  const { page = 0, size = 10, search, q, categoria, laboratorio, tipoMedicamento, ...rest } = params;
  // El backend expone /productos esperando los parámetros: q, lab, cat, page, size
  // Aceptamos tanto `q` como `search` desde el frontend. Priorizamos `q` si se envía.
  const queryParams: Record<string, any> = { page, size, ...rest };

  const term = q ?? search;
  if (term !== undefined && term !== null && String(term).trim() !== "") {
    queryParams.q = String(term).trim();
  }
  if (laboratorio !== undefined && laboratorio !== null && String(laboratorio).trim() !== "") {
    queryParams.lab = laboratorio
  }
  if (categoria !== undefined && categoria !== null && String(categoria).trim() !== "") {
    queryParams.cat = categoria
  }
  if (tipoMedicamento !== undefined && tipoMedicamento !== null) {
    // El backend actual no define tipoMedicamento, pero lo dejamos en la query por compatibilidad
    queryParams.tipoMedicamento = tipoMedicamento
  }

  return fetchWithAuth(apiUrl("/productos") + toQuery(queryParams)) as Promise<PageResponse<ProductDTO>>;
}

/** Métricas de productos desde el backend */
export type ProductMetricsDTO = {
  totalProductosActivos: number
  cantidadTotalUnidades: number
  productosStockCritico: number
  lotesVencidos: number
}

/** GET /productos/metricas - Obtiene métricas globales de productos */
export function getProductMetrics() {
  return fetchWithAuth(apiUrl("/productos/metricas")) as Promise<ProductMetricsDTO>
}

/* Pedidos y Gestión de Stock con Proveedores */

export type AddStockSimplePayload = {
  codigoStock: string;
  productoId: number;
  codigoBarras: string;
  cantidadUnidades: number;
  fechaVencimiento: string;
  precioCompra: number;
}

export function addStockSimple(payload: AddStockSimplePayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl("/productos/agregar-stock"), {
    method: "POST",
    body: JSON.stringify(payload)
  }, toastFn);
}

export function addStock(payload: AddStockPayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl("/api/pedidos/agregar-stock"), {
    method: "POST",
    body: JSON.stringify(payload)
  }, toastFn);
}

/* ------------------ Stock (CRUD sin pedidos) ------------------ */
export type StockUnlinkedPayload = {
  codigoStock: string;
  cantidadUnidades: number;
  precioCompra: number;
  idProducto: number;
  fechaVencimiento?: string | null;
}

/**
 * POST /api/stock
 * Crea un lote/stock independiente (no asociado a un pedido)
 * Espera 201 Created en el backend.
 */
export async function createStock(payload: StockUnlinkedPayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl("/api/stock"), {
    method: "POST",
    body: JSON.stringify(payload)
  }, toastFn);
}

/**
 * PUT /api/stock/{id}
 * Edita un stock previamente creado (sin relación a pedidos)
 * Espera 200 OK en el backend.
 */
export async function editStock(id: string | number, payload: StockUnlinkedPayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl(`/api/stock/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  }, toastFn);
}

/**
 * DELETE /api/stock/{id}
 * Elimina un stock independiente. Espera 204 No Content.
 */
export async function deleteStock(id: string | number, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl(`/api/stock/${id}`), {
    method: "DELETE"
  }, toastFn);
}

//* GET /api/pedidos/reporte

/** 
 * GET /api/pedidos/reporte - Obtiene reporte de pedidos
 * @param params - Filtros opcionales:
 *   - proveedorId: Solo pedidos de este proveedor (0 o undefined = todos)
 *   - fechaPedido: Solo pedidos de esta fecha (undefined = todas)
 * @example 
 *   getPedidoReport() // Todos los pedidos
 *   getPedidoReport({ proveedorId: 5 }) // Solo del proveedor 5
 *   getPedidoReport({ fechaPedido: '2024-12-13' }) // Solo de esa fecha
 *   getPedidoReport({ proveedorId: 5, fechaPedido: '2024-12-13' }) // Combinado
 */
export function getPedidoReport(params?: { proveedorId?: number; fechaPedido?: string }) {
  // Build query params only for valid values
  const queryParams: Record<string, any> = {}

  // Only add ID_proveedor if it's a valid number > 0
  if (params?.proveedorId && params.proveedorId > 0) {
    queryParams.ID_proveedor = params.proveedorId
  }

  // Only add fecha_de_pedido if it's a non-empty string
  if (params?.fechaPedido && params.fechaPedido.trim() !== "") {
    queryParams.fecha_de_pedido = params.fechaPedido
  }

  return fetchWithAuth(apiUrl("/api/pedidos/reporte") + toQuery(queryParams)) as Promise<PedidoReportDTO[]>;
}

/**
 * DELETE /api/pedidos/{id}
 * Elimina un pedido por su id. Devuelve lo que retorne fetchWithAuth (normalmente null o mensaje).
 */
export function deletePedido(id: string | number, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl(`/api/pedidos/${id}`), {
    method: "DELETE"
  }, toastFn)
}

/**
 * PUT /api/pedidos/{id}
 * Edita un pedido existente con los datos provistos en el payload.
 */
export function editPedido(id: string | number, payload: EditPedidoPayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl(`/api/pedidos/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  }, toastFn)
}


/**
 * GET /productos/proveedor/{id}
 */
export function getProductsByProvider(proveedorId: number) {
  return fetchWithAuth(apiUrl(`/productos/proveedor/${proveedorId}`)) as Promise<ProductDTO[]>;
}

/* Ventas / Boletas (accesible a trabajador + admin) */
export type VentaItem = { id: number; codBarras: string; nombre: string; cantidad: number; precio: number }

/** Detalle enriquecido de producto vendido - nueva estructura del backend */
export type DetalleEnriquecido = {
  productoId: number
  codigoBarras: string
  nombre: string
  tipoVenta: "UNIDAD" | "BLISTER" | string
  cantidad: number
  cantidadBlisters: number
  unidadesPorBlister: number
  precioAplicado: number
  precioActualUnd: number
  precioActualBlister: number
  precioModificado: boolean
  subtotal: number
}

export type BoletaDTO = {
  id: number
  numero: string
  fecha: string
  cliente: string | null
  metodoPago: string | null
  totalCompra?: number | null
  total?: number | null
  vuelto?: number | null
  usuario: string | null
  /** @deprecated Usar detallesEnriquecidos en su lugar */
  productos?: VentaItem[]
  /** Nueva estructura de detalles desde el backend */
  detallesEnriquecidos?: DetalleEnriquecido[]
}

// Compat multi-formato
export async function getBoletas(params: {
  page?: number
  limit?: number
  size?: number
  search?: string
  q?: string
  from?: string
  to?: string
  pathOverride?: string
} = {}) {
  const { page = 1, limit = 10, size, search, q, from, to, pathOverride } = params;
  const query = new URLSearchParams()
  query.set("page", String(page))
  query.set("limit", String(size ?? limit))
  if (search?.trim()) query.set("search", search.trim())
  if (!search && q?.trim()) query.set("search", q.trim())
  if (from) query.set("from", from)
  if (to) query.set("to", to)

  const path = pathOverride || "/api/boletas"
  const res = await fetchWithAuth(apiUrl(`${path}?${query.toString()}`))

  if (res && Array.isArray(res.boletas)) {
    const content = res.boletas as BoletaDTO[]
    const total = typeof res.total === "number" ? res.total : content.length
    const pageSize = size ?? limit
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    return { content, totalElements: total, page: page - 1, size: pageSize, totalPages } as PageResponse<BoletaDTO>
  }
  if (res && Array.isArray(res.content)) {
    const total = typeof res.totalElements === "number" ? res.totalElements : (typeof res.total === "number" ? res.total : res.content.length)
    const pageSize = typeof res.size === "number" ? res.size : (size ?? limit)
    const totalPages = typeof res.totalPages === "number" ? res.totalPages : Math.max(1, Math.ceil(total / pageSize))
    return { content: res.content as BoletaDTO[], totalElements: total, page: typeof res.page === "number" ? res.page : (page - 1), size: pageSize, totalPages } as PageResponse<BoletaDTO>
  }
  if (Array.isArray(res)) {
    const content = res as BoletaDTO[]; const total = content.length; const pageSize = size ?? limit
    return { content, totalElements: total, page: page - 1, size: pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) } as PageResponse<BoletaDTO>
  }
  return {
    items: (items: any) => items,
    content: [],
    totalElements: 0,
    page: page - 1,
    size: size ?? limit,
    totalPages: 0
  } as PageResponse<BoletaDTO>
}

export async function getBoletasPage(params: { page?: number; size?: number; search?: string; from?: string; to?: string } = {}) {
  const { page = 0, size = 10, search, from, to } = params
  const qs = new URLSearchParams()
  qs.set("page", String(page))
  qs.set("size", String(size))
  if (search?.trim()) qs.set("search", search.trim())
  if (from) qs.set("from", from)
  if (to) qs.set("to", to)
  const res = await fetchWithAuth(apiUrl(`/api/boletas?${qs.toString()}`))
  return res as PageResponse<BoletaDTO>
}

export async function getBoletaById(id: number) {
  return fetchWithAuth(apiUrl(`/api/boletas/${id}`)) as Promise<BoletaDTO>
}

/* ------------------------- Ventas (POST) ------------------------- */
export type VentaProductoPayload = {
  id?: number
  codBarras?: string
  nombre?: string
  cantidad: number
}

export type MetodoPagoPayload = {
  nombre: string
  efectivo: number
  digital: number
  efectivoFix: number
}

export type CrearVentaPayload = {
  numero?: string
  dniCliente?: string
  dniVendedor?: string
  nombreCliente?: string
  metodoPago: MetodoPagoPayload
  productos: VentaProductoPayload[]
}

/**
 * POST /api/ventas
 * Registra una venta (boleta). El backend prioriza `id` dentro de cada producto si está presente,
 * de lo contrario usa `codBarras`.
 */
export async function crearVenta(payload: CrearVentaPayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl("/api/ventas"), {
    method: "POST",
    body: JSON.stringify(payload)
  }, toastFn) as Promise<BoletaDTO>
}

/* ------------------------- Productos (CRUD mínimo, sin stock) ------------------------- */
export type ProductoCreatePayload = {
  codigoBarras?: string
  nombre: string
  concentracion?: string | null
  cantidadMinima?: number | null
  precioVentaUnd?: number | null
  laboratorio?: string | null
  categoria?: string | null
  cantidadUnidadesBlister?: number | null
  precioVentaBlister?: number | null
  principioActivo?: string | null
  tipoMedicamento?: string | null
  presentacion?: string | null
  proveedorIds?: number[]
}

export async function crearProducto(payload: ProductoCreatePayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl("/productos/nuevo"), {
    method: "POST",
    body: JSON.stringify(payload)
  }, toastFn)
}

export async function actualizarProducto(id: number, payload: ProductoCreatePayload, toastFn?: ToastFn) {
  return fetchWithAuth(apiUrl(`/productos/${id}`), {
    method: "PUT",
    body: JSON.stringify(payload)
  }, toastFn)
}

