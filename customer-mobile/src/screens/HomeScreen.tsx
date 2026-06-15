import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '@/components/Button';
import { formatDate } from '@/utils/format';
import { RootStackParamList } from '@/types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const MOCK_ITEMS = [
  { id: '1', title: 'Item 1', createdAt: new Date() },
  { id: '2', title: 'Item 2', createdAt: new Date() },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title}</Text>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
      />
      <Button
        label="プロフィールを見る"
        onPress={() => navigation.navigate('Profile', { userId: '1' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
