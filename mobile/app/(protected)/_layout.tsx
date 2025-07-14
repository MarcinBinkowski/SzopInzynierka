import { useAuth } from "@/hooks/useAuth";
import { Redirect, Stack } from "expo-router";
import { useContext } from "react";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

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