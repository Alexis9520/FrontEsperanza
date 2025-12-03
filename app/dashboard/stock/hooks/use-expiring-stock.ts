import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/lib/use-toast"
import { fetchWithAuth } from "@/lib/api"
import { apiUrl } from "@/lib/config"
import { StockItem } from "../stock-types"

export function useExpiringStock() {
  const { toast } = useToast()
  const [expiringStock, setExpiringStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(false)
  const [withinDays, setWithinDays] = useState(30)

  const fetchExpiring = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(apiUrl(`/api/stock/expiring?withinDays=${withinDays}`))
      if (Array.isArray(response)) {
        setExpiringStock(response)
      } else {
        setExpiringStock([])
      }
    } catch (error) {
      console.error("Error fetching expiring stock:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar los productos por vencer.",
        variant: "destructive"
      })
      setExpiringStock([])
    } finally {
      setLoading(false)
    }
  }, [withinDays, toast])

  useEffect(() => {
    fetchExpiring()
  }, [fetchExpiring])

  return {
    expiringStock,
    loading,
    withinDays,
    setWithinDays,
    refresh: fetchExpiring
  }
}
