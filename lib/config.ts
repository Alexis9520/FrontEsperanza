/**
 * Configuración centralizada de la aplicación
 * 
 * Este archivo centraliza la URL base del backend y proporciona
 * utilidades para construir URLs de API de forma consistente.
 */

/**
 * URL base del backend
 * Para cambiar el servidor backend, modifica solo esta constante
 */
export const BASE_URL = "http://109.199.106.139:8090";

/**
 * Construye una URL completa de API a partir de un path relativo
 * @param path - Ruta relativa de la API (ej: "/usuarios/me", "auth/login")
 * @returns URL completa del endpoint
 * 
 * @example
 * apiUrl("/auth/login") // => "http://109.199.106.139:8090/auth/login"
 * apiUrl("usuarios/me") // => "http://109.199.106.139:8090/usuarios/me"
 * apiUrl("http://example.com/api") // => "http://example.com/api" (sin modificar)
 */
export function apiUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
