import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { LowStockProduct } from "../stock-types"

export function useLowStock() {
  const { toast } = useToast()
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [threshold, setThreshold] = useState(10)

  const fetchLowStock = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(apiUrl(`/productos/stock-bajo?umbral=${threshold}`))
      if (Array.isArray(response)) {
        setLowStockProducts(response)
      } else {
        setLowStockProducts([])
      }
    } catch (error) {
      console.error("Error fetching low stock products:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar los productos con bajo stock.",
        variant: "destructive"
      })
      setLowStockProducts([])
    } finally {
      setLoading(false)
    }
  }, [threshold, toast])

  useEffect(() => {
    fetchLowStock()
  }, [fetchLowStock])

  return {
    lowStockProducts,
    loading,
    threshold,
    setThreshold,
    refresh: fetchLowStock
  }
}
