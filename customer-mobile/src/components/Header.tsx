import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// TouchableOpacity はこのコンポーネント内で使用していない（未使用 import）

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
