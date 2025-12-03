import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { StockItem, StockFilters } from "../stock-types"
import { useDebounceValue } from "@/hooks/use-debounce"

export function useStock() {
  const { toast } = useToast()
  
  // Data state
  const [stock, setStock] = useState<StockItem[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<StockFilters>({
    q: "",
    lab: "",
    cat: "",
    codigo: ""
  })

  // Pagination state
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)

  // Debounce search text
  const debouncedQ = useDebounceValue(filters.q, 500)
  const debouncedCodigo = useDebounceValue(filters.codigo, 500)

  const fetchStock = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", page.toString())
      params.set("size", size.toString())
      
      if (debouncedQ) params.set("q", debouncedQ)
      if (filters.lab && filters.lab !== "todos") params.set("lab", filters.lab)
      if (filters.cat && filters.cat !== "todos") params.set("cat", filters.cat)
      if (debouncedCodigo) params.set("codigo", debouncedCodigo)

      const response = await fetchWithAuth(apiUrl(`/api/stock?${params.toString()}`))
      
      // Validate response structure
      if (response && Array.isArray(response.content)) {
        setStock(response.content)
        setTotalElements(response.totalElements || 0)
        setTotalPages(response.totalPages || 0)
      } else {
        setStock([])
        setTotalElements(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error fetching stock:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario.",
        variant: "destructive"
      })
      setStock([])
    } finally {
      setLoading(false)
    }
  }, [page, size, debouncedQ, filters.lab, filters.cat, debouncedCodigo, toast])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [debouncedQ, filters.lab, filters.cat, debouncedCodigo])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  const updateFilter = (key: keyof StockFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return {
    stock,
    totalElements,
    totalPages,
    loading,
    page,
    setPage,
    size,
    setSize,
    filters,
    updateFilter,
    refresh: fetchStock
  }
}
