import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  Text, 
  Button,
  useTheme, 
} from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View>
        <Button
        mode="contained"
         onPress={() => {
          logout();
        }}>
          Logout
        </Button>
      </View>
      <Text variant="headlineMedium">{SecureStore.getItem('session_token')}</Text>
      <Text variant="headlineMedium">User: {SecureStore.getItem('user')}</Text>
    </SafeAreaView> 
  );
} 