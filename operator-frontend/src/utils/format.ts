import type { OrderStatus } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '保留中',
  confirmed: '確認済み',
  processing: '処理中',
  shipped: '発送済み',
  delivered: '配達済み',
  cancelled: 'キャンセル',
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status
}
