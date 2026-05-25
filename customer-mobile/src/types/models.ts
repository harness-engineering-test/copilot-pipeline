export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}
