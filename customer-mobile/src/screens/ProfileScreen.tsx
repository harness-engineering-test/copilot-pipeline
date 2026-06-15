import { StyleSheet, Text, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { useProfile } from '@/hooks/useProfile';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const route = useRoute<ProfileScreenRouteProp>();
  const { userId } = route.params;
  const { profile, loading } = useProfile(userId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{profile?.name ?? 'ユーザー'}</Text>
      <Text style={styles.email}>{profile?.email ?? ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    paddingTop: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
});
