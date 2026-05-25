import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/endpoints';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}
