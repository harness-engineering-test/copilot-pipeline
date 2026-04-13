import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Header } from '../../components/Header';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { userId, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Header title="プロフィール" />
      <View style={styles.content}>
        <Text style={styles.userId}>ユーザーID: {userId ?? '未ログイン'}</Text>
        <Text onPress={signOut} style={styles.signOut}>
          ログアウト
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 24,
  },
  userId: {
    fontSize: 16,
    marginBottom: 24,
  },
  signOut: {
    fontSize: 16,
    color: '#FF3B30',
  },
});
