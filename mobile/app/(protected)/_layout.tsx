import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const authState = useAuth();

  if (authState.isLoading) {
    return null;
  }

  if (!authState.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
