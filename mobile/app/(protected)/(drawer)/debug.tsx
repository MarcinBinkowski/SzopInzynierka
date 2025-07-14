import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  ActivityIndicator,
  useTheme,
  Divider
} from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

export default function DebugScreen() {
  const { logout } = useAuth();
  const theme = useTheme();
  return (
    <SafeAreaView>
      <View>
        <Text>Debug</Text>
        <Button onPress={() => {
          logout();
        }}>
          Logout
        </Button>
      </View>
    </SafeAreaView>
  );
}