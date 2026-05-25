import React from 'react';
import { render } from '@testing-library/react-native';
import { OrderCard } from '../../src/components/OrderCard';
import { Order } from '../../src/types/models';

const mockOrder: Order = {
  id: 'order-1',
  status: 'confirmed',
  items: [{ id: 'item-1', name: 'テスト商品', quantity: 2, price: 500 }],
  totalAmount: 1000,
  createdAt: '2024-01-15T10:00:00.000Z',
};

describe('OrderCard', () => {
  it('renders order id', () => {
    const { getByText } = render(<OrderCard order={mockOrder} />);
    expect(getByText('注文 #order-1')).toBeTruthy();
  });

  it('renders status label for confirmed order', () => {
    const { getByText } = render(<OrderCard order={mockOrder} />);
    expect(getByText('確認済み')).toBeTruthy();
  });

  it('renders total amount', () => {
    const { getByText } = render(<OrderCard order={mockOrder} />);
    expect(getByText('¥1,000')).toBeTruthy();
  });

  it('renders cancelled status correctly', () => {
    const cancelledOrder = { ...mockOrder, status: 'cancelled' as const };
    const { getByText } = render(<OrderCard order={cancelledOrder} />);
    expect(getByText('キャンセル')).toBeTruthy();
  });
});
