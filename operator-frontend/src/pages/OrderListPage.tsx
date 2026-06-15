import { useEffect } from 'react'
import { useOrders } from '@/hooks'
import { OrderStatusBadge, ErrorMessage } from '@/components'
import { formatCurrency, formatDate } from '@/utils'

export function OrderListPage() {
  const { orders, total, loading, error, fetchOrders } = useOrders({
    page: 1,
    pageSize: 20,
  })

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (loading) {
    return <div>読み込み中...</div>
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchOrders} />
  }

  return (
    <div>
      <h1>注文一覧</h1>
      <p>全{total}件</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>注文ID</th>
            <th>ステータス</th>
            <th>合計金額</th>
            <th>作成日時</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                <OrderStatusBadge status={order.status} />
              </td>
              <td>{formatCurrency(order.totalAmount)}</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
