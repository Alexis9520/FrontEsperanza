import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { LowStockProduct } from "../stock-types"

interface PaginatedResponse {
  content: LowStockProduct[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

export function useLowStock() {
  const { toast } = useToast()
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(10)

  // Pagination state
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLowStock = useCallback(async () => {
    setLoading(true)
    try {
      const url = apiUrl(`/productos/stock-bajo?umbral=${threshold}&page=${page}&size=${size}`)
      const response = await fetchWithAuth(url)

      // Handle paginated response
      if (response && typeof response === 'object' && 'content' in response) {
        const paginated = response as PaginatedResponse
        setLowStockProducts(Array.isArray(paginated.content) ? paginated.content : [])
        setTotalElements(paginated.totalElements ?? 0)
        setTotalPages(paginated.totalPages ?? 1)
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated response (backward compatibility)
        setLowStockProducts(response)
        setTotalElements(response.length)
        setTotalPages(1)
      } else {
        setLowStockProducts([])
        setTotalElements(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar los productos con bajo stock.",
        variant: "destructive"
      })
      setLowStockProducts([])
      setTotalElements(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [threshold, page, size, toast])

  // Reset page when threshold changes
  useEffect(() => {
    setPage(0)
  }, [threshold])

  useEffect(() => {
    fetchLowStock()
  }, [fetchLowStock])

  return {
    lowStockProducts,
    loading,
    threshold,
    setThreshold,
    // Pagination
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    refresh: fetchLowStock
  }
}
