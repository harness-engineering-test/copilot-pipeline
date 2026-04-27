import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { formatDate, formatCurrency } from '../utils/formatters';

export function HomeScreen() {
  const today = formatDate(new Date());
  const price = formatCurrency(1980);

  return (
    <View style={styles.container}>
      <Header title="ホーム" />
      <Text style={styles.text}>本日: {today}</Text>
      <Text style={styles.text}>価格: {price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 16,
    margin: 8,
  },
});
