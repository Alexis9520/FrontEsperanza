"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import {
  Home,
  ShoppingCart,
  Plus,
  Receipt,
  History,
  Wallet,
  Pill,
  Box,
  BarChart3,
  Users,
  Settings,
  Sparkles,
  Code2,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CHANGELOG, isRecent } from "@/lib/changelog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
  id?: string
  order?: number
  badge?: string
  color?: string
}

/* -------------------------------- Icons ---------------------------------- */
const Icons = {
  dashboard: <Home className="h-[18px] w-[18px]" />,
  nuevaVenta: (
    <span className="relative inline-flex">
      <ShoppingCart className="h-[18px] w-[18px]" />
      <Plus className="h-3 w-3 absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground p-[1px]" />
    </span>
  ),
  historialVentas: (
    <span className="relative inline-flex">
      <Receipt className="h-[18px] w-[18px]" />
      <History className="h-3 w-3 absolute -right-1 -bottom-1 opacity-80" />
    </span>
  ),
  caja: <Wallet className="h-[18px] w-[18px]" />,
  productos: <Pill className="h-[18px] w-[18px]" />,
  stock: <Box className="h-[18px] w-[18px]" />,
  proveedores: <Building2 className="h-[18px] w-[18px]" />,
  reportes: <BarChart3 className="h-[18px] w-[18px]" />,
  usuarios: <Users className="h-[18px] w-[18px]" />,
  configuracion: <Settings className="h-[18px] w-[18px]" />,
  changelog: <Sparkles className="h-[18px] w-[18px]" />,
  desarrolladores: <Code2 className="h-[18px] w-[18px]" />
}

/* ----------------------- Original nav with adminOnly --------------------- */
const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Icons.dashboard, adminOnly: true, order: -100, color: "blue" },
  { title: "Vender", href: "/dashboard/nueva", icon: Icons.nuevaVenta, order: 10, color: "emerald" },
  { title: "Historial ventas", href: "/dashboard/ventas", icon: Icons.historialVentas, adminOnly: true, order: 11, color: "violet" },
  { title: "Caja", href: "/dashboard/caja", icon: Icons.caja, order: 12, color: "amber" },
  { title: "Productos", href: "/dashboard/productos", icon: Icons.productos, adminOnly: true, order: 20, color: "pink" },
  { title: "Stock", href: "/dashboard/stock", icon: Icons.stock, order: 21, color: "orange" },
  { title: "Proveedores", href: "/dashboard/proveedores", icon: Icons.proveedores, adminOnly: true, order: 22, color: "cyan" },
  { title: "Reportes", href: "/dashboard/reportes", icon: Icons.reportes, adminOnly: true, order: 30, color: "indigo" },
  { title: "Usuarios", href: "/dashboard/usuarios", icon: Icons.usuarios, adminOnly: true, order: 40, color: "rose" },
  { title: "Configuración", href: "/dashboard/configuracion", icon: Icons.configuracion, adminOnly: true, order: 41, color: "slate" },
  { title: "Desarrolladores", href: "/dashboard/desarrolladores", icon: Icons.desarrolladores, adminOnly: true, order: 60, color: "purple" },
]

/* ----------------------------- Constants --------------------------------- */
const CHANGELOG_STORAGE_KEY = "changelog:lastSeenVersion"
const SIDEBAR_COLLAPSED_KEY = "sidebar:collapsed"
export const SIDEBAR_WIDTH_EXPANDED = 260
export const SIDEBAR_WIDTH_COLLAPSED = 76
const MOBILE_NAV_HEIGHT = 68
const WORKER_HOME = "/dashboard/nueva"
const ADMIN_HOME = "/dashboard"

/* ----------------------------- Color Maps -------------------------------- */
const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", glow: "shadow-blue-500/20" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500", glow: "shadow-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-500", glow: "shadow-violet-500/20" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-500", glow: "shadow-amber-500/20" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-500", glow: "shadow-pink-500/20" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500", glow: "shadow-orange-500/20" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-500", glow: "shadow-cyan-500/20" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-500", glow: "shadow-indigo-500/20" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-500", glow: "shadow-rose-500/20" },
  slate: { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-500", glow: "shadow-slate-500/20" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500", glow: "shadow-purple-500/20" },
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const isAdmin = user?.rol?.toLowerCase() === "administrador"

  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Changelog
  const latest = CHANGELOG[0]
  const isLatestRecent = latest ? isRecent(latest.date) : false
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const unread = latest && lastSeen !== latest.version

  /* -------------------- Persisted UI state & changelog ------------------- */
  useEffect(() => {
    if (typeof window === "undefined") return
    const sLast = localStorage.getItem(CHANGELOG_STORAGE_KEY)
    if (sLast) setLastSeen(sLast)
    const sCol = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (sCol) setCollapsed(sCol === "1")
  }, [])

  useEffect(() => {
    if (pathname.startsWith("/dashboard/actualizaciones") && latest) {
      localStorage.setItem(CHANGELOG_STORAGE_KEY, latest.version)
      setLastSeen(latest.version)
    }
  }, [pathname, latest])

  /* ---------------------- Role-based route protection -------------------- */
  useEffect(() => {
    if (!user) return
    if (isAdmin) return
    
    if (pathname === ADMIN_HOME) {
      router.replace(WORKER_HOME)
      return
    }

    const isForbidden = navItems
      .filter(i => i.adminOnly)
      .some(item => {
        if (item.href === ADMIN_HOME) {
          return pathname === item.href
        }
        return pathname === item.href || pathname.startsWith(item.href + "/")
      })

    if (isForbidden) {
      router.replace(WORKER_HOME)
    }
  }, [pathname, isAdmin, user, router])

  /* --------------------------- Keyboard toggle --------------------------- */
  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      if (typeof window !== "undefined")
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0")
      return next
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault()
        toggleCollapsed()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggleCollapsed])

  /* --------------------------- Filtered nav list ------------------------- */
  const filteredNavItems = useMemo(
    () =>
      navItems
        .filter(i => !i.adminOnly || isAdmin)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [isAdmin]
  )

  /* -------------------- Global body padding for mobile nav --------------- */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    function apply() {
      if (mq.matches) {
        document.documentElement.style.setProperty("--mobile-nav-height", `${MOBILE_NAV_HEIGHT}px`)
        if (!document.body.dataset.prevPb) {
          const current = parseFloat(getComputedStyle(document.body).paddingBottom || "0")
          document.body.dataset.prevPb = String(current)
          document.body.style.paddingBottom = `${current + MOBILE_NAV_HEIGHT}px`
        }
      } else {
        cleanup()
      }
    }
    function cleanup() {
      if (document.body.dataset.prevPb !== undefined) {
        document.body.style.paddingBottom = document.body.dataset.prevPb
        delete document.body.dataset.prevPb
      }
      document.documentElement.style.removeProperty("--mobile-nav-height")
    }
    apply()
    mq.addEventListener("change", apply)
    return () => {
      mq.removeEventListener("change", apply)
      cleanup()
    }
  }, [])

  /* ------------------------------ Helpers -------------------------------- */
  const isActive = useCallback(
    (href: string) =>
      pathname === href || (href !== ADMIN_HOME && pathname.startsWith(href + "/")),
    [pathname]
  )

  const getItemColors = (item: NavItem, active: boolean, hovered: boolean) => {
    const color = item.color || "blue"
    const colors = colorMap[color] || colorMap.blue
    
    if (active) {
      return {
        iconBg: colors.bg,
        iconBorder: colors.border,
        iconText: colors.text,
        glow: colors.glow,
      }
    }
    
    if (hovered) {
      return {
        iconBg: "bg-muted/60",
        iconBorder: colors.border,
        iconText: colors.text,
        glow: "",
      }
    }
    
    return {
      iconBg: "bg-muted/40 dark:bg-muted/20",
      iconBorder: "border-transparent",
      iconText: "text-muted-foreground",
      glow: "",
    }
  }

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href)
    const showUnread = item.id === "changelog" && unread && !active
    const isHovered = hoveredItem === item.href
    const colors = getItemColors(item, active, isHovered)

    const link = (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.title}
        onMouseEnter={() => setHoveredItem(item.href)}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none",
          "transition-all duration-300 ease-out",
          "focus-visible:ring-2 focus-visible:ring-primary/40",
          active
            ? cn("bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-transparent", colors.glow, "shadow-lg")
            : "hover:bg-muted/40 dark:hover:bg-muted/20"
        )}
        aria-current={active ? "page" : undefined}
      >
        {/* Active indicator line */}
        <span
          className={cn(
            "absolute inset-y-2 left-0 w-[3px] rounded-full transition-all duration-300",
            active 
              ? "bg-primary scale-y-100 opacity-100" 
              : "bg-primary scale-y-0 opacity-0 group-hover:scale-y-50 group-hover:opacity-50"
          )}
        />
        
        {/* Icon container with color */}
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border text-[13px]",
            "transition-all duration-300 ease-out",
            colors.iconBg,
            colors.iconBorder,
            colors.iconText,
            active && "shadow-md",
            isHovered && !active && "scale-110"
          )}
        >
          {item.icon}
        </span>
        
        {/* Title with slide animation */}
        {!collapsed && (
          <span 
            className={cn(
              "flex-1 truncate transition-all duration-300",
              active ? "text-foreground font-semibold" : "text-muted-foreground group-hover:text-foreground"
            )}
          >
            {item.title}
          </span>
        )}
        
        {/* Badge for new items */}
        {item.badge && !collapsed && (
          <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
            {item.badge}
          </span>
        )}
        
        {/* Unread indicator */}
        {showUnread && (
          <span
            className={cn(
              "absolute",
              collapsed ? "top-1 right-1" : "top-1/2 -translate-y-1/2 right-3",
              "h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background",
              "animate-pulse shadow-lg shadow-primary/50"
            )}
            aria-label="Nuevo"
          />
        )}
      </Link>
    )

    if (!collapsed) return link

    return (
      <Tooltip key={item.href} delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent 
          side="right" 
          sideOffset={12}
          className="px-3 py-1.5 text-xs font-medium bg-popover/95 backdrop-blur-sm border shadow-lg"
        >
          {item.title}
        </TooltipContent>
      </Tooltip>
    )
  }

  /* ------------------------------ Render --------------------------------- */
  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <TooltipProvider disableHoverableContent>
        <aside
          className={cn(
            "hidden md:flex h-screen flex-col border-r transition-all duration-300 ease-out shrink-0",
            "relative z-40",
            "bg-gradient-to-b from-background via-background to-muted/20",
            "shadow-xl shadow-black/5 dark:shadow-black/20",
            collapsed ? "w-[76px]" : "w-[260px]"
          )}
          style={{
            ["--sidebar-width" as string]: collapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`
          }}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />
          
          {/* Brand */}
          <div className={cn(
            "relative flex h-16 items-center border-b border-border/50",
            collapsed ? "justify-center px-2" : "px-4"
          )}>
            <Link
              href={isAdmin ? ADMIN_HOME : WORKER_HOME}
              className={cn(
                "flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]",
                collapsed && "justify-center"
              )} 
              aria-label="Ir a inicio"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg shadow-primary/10">
                <img src="/icono-sidebar.png" alt="Logo" className="h-7 w-7 drop-shadow-sm" />
                {isLatestRecent && (
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary text-[7px] font-bold text-primary-foreground shadow-lg flex items-center justify-center animate-bounce">
                    !
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Nueva Esperanza
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Sistema de Gestión
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Collapse toggle button */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 z-50",
              collapsed ? "-right-3" : "-right-3"
            )}
          >
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expandir" : "Colapsar"}
              className={cn(
                "group flex h-6 w-6 items-center justify-center rounded-full",
                "bg-background border-2 border-border shadow-md",
                "text-muted-foreground transition-all duration-300",
                "hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/20",
                "hover:scale-110 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <ChevronLeft className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                collapsed && "rotate-180"
              )} />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {filteredNavItems.map(renderNavLink)}
            </nav>
          </ScrollArea>

          {/* Footer section */}
          <div className={cn(
            "relative border-t border-border/50 p-3",
            collapsed ? "flex flex-col items-center gap-2" : "space-y-3"
          )}>
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
                "text-muted-foreground transition-all duration-300",
                "hover:bg-muted/40 hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 border border-border/50">
                {mounted ? (
                  theme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-500" />
                  )
                ) : (
                  <div className="h-4 w-4" />
                )}
              </span>
              {!collapsed && <span>Cambiar tema</span>}
            </button>

            {/* User info & logout */}
            {user && (
              <div className={cn(
                "flex items-center gap-3 rounded-xl p-2",
                "bg-muted/30 border border-border/50",
                collapsed && "flex-col p-2"
              )}>
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20",
                  "text-primary font-bold text-sm"
                )}>
                  {user.nombreCompleto?.charAt(0).toUpperCase() || "U"}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.nombreCompleto}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {isAdmin ? "Administrador" : "Usuario"}
                    </p>
                  </div>
                )}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
                        router.push("/login")
                      }}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        "text-muted-foreground transition-all duration-200",
                        "hover:bg-red-500/10 hover:text-red-500",
                        collapsed && "mt-1"
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={collapsed ? "right" : "top"} className="text-xs">
                    Cerrar sesión
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Status indicator */}
            {!collapsed && (
              <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  En línea
                </span>
                <span className="opacity-60">Ctrl+B para colapsar</span>
              </div>
            )}
          </div>
        </aside>
      </TooltipProvider>

      {/* MOBILE BOTTOM NAV */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex md:hidden border-t",
          "bg-background/80 backdrop-blur-xl",
          "shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
        )}
        role="navigation"
        aria-label="Navegación móvil"
        style={{ height: MOBILE_NAV_HEIGHT }}
      >
        <ul className="flex w-full items-stretch overflow-x-auto px-1 py-1.5 gap-0.5 scrollbar-none">
          {filteredNavItems.map(item => {
            const active = isActive(item.href)
            const showUnread = item.id === "changelog" && unread && !active
            const color = item.color || "blue"
            const colors = colorMap[color] || colorMap.blue
            
            return (
              <li
                key={item.href}
                className="flex flex-col items-center min-w-[64px] flex-1"
              >
                <Link
                  href={item.href}
                  aria-label={item.title}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 w-full",
                    "text-[10px] font-medium transition-all duration-300",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground active:scale-95"
                  )}
                >
                  {/* Background glow for active */}
                  {active && (
                    <span className={cn(
                      "absolute inset-1 rounded-xl",
                      colors.bg,
                      "animate-in fade-in duration-300"
                    )} />
                  )}
                  
                  <span
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
                      active
                        ? cn(colors.bg, colors.border, colors.text, "shadow-lg", colors.glow)
                        : "border-transparent bg-muted/40"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className={cn(
                    "relative leading-none truncate max-w-[60px] transition-colors",
                    active && colors.text
                  )}>
                    {item.title}
                  </span>
                  
                  {/* Active dot indicator */}
                  {active && (
                    <span className={cn(
                      "absolute -top-0.5 h-1 w-6 rounded-full",
                      "bg-primary"
                    )} />
                  )}
                  
                  {showUnread && (
                    <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  )
}