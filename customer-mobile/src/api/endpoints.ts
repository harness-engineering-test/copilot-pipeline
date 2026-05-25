import { apiClient } from './client';
import { Order } from '../types/models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },
};

export const ordersApi = {
  list: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },

  get: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },
};
