import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useOrders } from '../hooks/useOrders';
import { OrderCard } from '../components/OrderCard';

export function OrdersScreen() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>注文履歴の取得に失敗しました</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>注文履歴がありません</Text>}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  errorText: { color: '#ff3b30', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 32 },
});
