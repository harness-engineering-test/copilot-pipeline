import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/format';

export function HomeScreen() {
  const { userId, isAuthenticated, login, logout } = useAuth();
  const today = formatDate(new Date());

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{today}</Text>
      {isAuthenticated ? (
        <>
          <Text style={styles.welcome}>Welcome, {userId}</Text>
          <Button label="ログアウト" onPress={logout} />
        </>
      ) : (
        <Button label="ログイン" onPress={() => login('user-1')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
