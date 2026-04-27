import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// このコンポーネントはどこからも import・使用されていない（未参照コンポーネント）
export function LegacyBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>旧バナー（削除予定）</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffcc00',
    padding: 8,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});
