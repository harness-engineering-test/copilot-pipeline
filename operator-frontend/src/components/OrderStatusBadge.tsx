import type { OrderStatus } from '@/types'
import { getOrderStatusLabel } from '@/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? '#6b7280'
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: color,
      }}
    >
      {getOrderStatusLabel(status)}
    </span>
  )
}
