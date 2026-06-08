import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { truncate } from '../utils/helpers';

export function ProfileScreen() {
  const { userId } = useAuth();
  const displayName = truncate(userId ?? 'ゲスト', 20);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
