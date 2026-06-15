import { useState, useCallback } from 'react'
import { ordersApi, ApiClientError } from '@/api'
import type { Order, OrderStatus } from '@/types'

interface UseOrdersParams {
  page?: number
  pageSize?: number
  status?: OrderStatus
}

export function useOrders(params: UseOrdersParams = {}) {
  const { page = 1, pageSize = 20, status } = params
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await ordersApi.list({ page, pageSize, status })
      setOrders(result.data)
      setTotal(result.total)
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('注文の取得に失敗しました')
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, status])

  const updateOrderStatus = useCallback(
    async (id: string, newStatus: OrderStatus, note?: string) => {
      try {
        const updated = await ordersApi.updateStatus(id, {
          status: newStatus,
          note,
        })
        setOrders((prev) =>
          prev.map((order) => (order.id === id ? updated : order)),
        )
        return updated
      } catch (err) {
        if (err instanceof ApiClientError) {
          throw new Error(err.message)
        }
        throw new Error('ステータスの更新に失敗しました')
      }
    },
    [],
  )

  return { orders, total, loading, error, fetchOrders, updateOrderStatus }
}
