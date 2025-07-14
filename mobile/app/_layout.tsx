import { Stack } from "expo-router";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { useColorScheme } from "react-native";
import { en, registerTranslation } from "react-native-paper-dates";
import Constants from "expo-constants";

registerTranslation("en", en);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
      gcTime: 1000 * 10,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider
        publishableKey={Constants.expoConfig?.extra?.stripePublishableKey}
        merchantIdentifier="szopinzynierka.com"
      >
        <PaperProvider theme={theme}>
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
        </PaperProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}