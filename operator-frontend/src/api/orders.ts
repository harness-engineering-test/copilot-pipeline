import type { Order, PaginatedResponse, PaginationParams } from '@/types'
import { apiClient } from './client'

export interface OrderFilterParams extends PaginationParams {
  status?: string
  customerId?: string
}

export interface UpdateOrderStatusPayload {
  status: string
  note?: string
}

export const ordersApi = {
  list: (params: OrderFilterParams): Promise<PaginatedResponse<Order>> => {
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.status ? { status: params.status } : {}),
      ...(params.customerId ? { customerId: params.customerId } : {}),
    })
    return apiClient.get<PaginatedResponse<Order>>(`/orders?${query.toString()}`)
  },

  get: (id: string): Promise<Order> =>
    apiClient.get<Order>(`/orders/${id}`),

  updateStatus: (id: string, payload: UpdateOrderStatusPayload): Promise<Order> =>
    apiClient.patch<Order>(`/orders/${id}/status`, payload),
}
