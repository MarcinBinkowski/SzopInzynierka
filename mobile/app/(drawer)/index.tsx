import NotifyButton from '#/components/NotifyButton';
import { Text } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ 
      padding: 16,
      flex: 1,
      alignItems: 'center'
    }}>
      <Text h3 style={{ textAlign: 'center' }}>
        Marcin Binkowski React Native Cinema
      </Text>
      <NotifyButton/>
    </SafeAreaView>
  );
}