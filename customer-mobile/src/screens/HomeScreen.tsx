import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../components/Header';
import { formatDate, formatCurrency } from '../utils/formatters';

// getGreeting は定義されているが、この画面内で呼び出されていない（未使用関数 / dead code）
function getGreeting(): string {
  return 'こんにちは！';
}

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

  // ここより下は到達不能コード（return の後に記述）
  console.log('到達不能なログ');
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
