import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Order } from '../types/models';

interface OrderCardProps {
  order: Order;
}

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: '保留中',
  confirmed: '確認済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
};

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: '#ff9500',
  confirmed: '#007aff',
  delivered: '#34c759',
  cancelled: '#ff3b30',
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>注文 #{order.id}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[order.status] }]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[order.status]}</Text>
        </View>
      </View>
      <Text style={styles.amount}>¥{order.totalAmount.toLocaleString()}</Text>
      <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString('ja-JP')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: { fontSize: 14, color: '#666' },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  amount: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 12, color: '#888' },
});
