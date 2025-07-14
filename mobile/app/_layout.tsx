import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

LogBox.ignoreLogs([
  'Warning: Each child in a list should have a unique "key" prop',
]);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
