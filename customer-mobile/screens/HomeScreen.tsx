import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { formatCurrency, formatDate } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

interface Order {
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
}

const MOCK_ORDERS: Order[] = [
  { id: '1', title: '商品A', amount: 1500, createdAt: new Date('2024-01-15') },
  { id: '2', title: '商品B', amount: 3200, createdAt: new Date('2024-01-20') },
];

export function HomeScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text>ログインが必要です</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="注文履歴" />
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            title={item.title}
            body={`${formatCurrency(item.amount)} - ${formatDate(item.createdAt)}`}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
});
