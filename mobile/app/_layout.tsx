// mobile/app/_layout.tsx
import {  Slot, SplashScreen, Stack,  } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <StripeProvider
          publishableKey="pk_test_your_publishable_key"
          merchantIdentifier="szopinzynierka.com"
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen
              name="(protected)"
              options={{
                headerShown: false,
                animation: "none",
              }}
            />
            <Stack.Screen
              name="login"
              options={{
                animation: "none",
              }}
            />
          </Stack>
          </GestureHandlerRootView>
        </StripeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}


