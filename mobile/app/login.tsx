import { SafeAreaView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { useAuth } from "@/hooks/useAuth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";

const schema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(9, "Password must be at least 9 characters"),
});

export default function LoginScreen() {
  const { login, isLoggingIn, loginError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Card>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            Login
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ marginBottom: 12 }}
                error={!!errors.email}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                style={{ marginBottom: 16 }}
                error={!!errors.password}
              />
            )}
          />
          <Button
            mode="contained"
            loading={isLoggingIn}
            onPress={handleSubmit(login)}
            disabled={isLoggingIn}
          >
            Sign In
          </Button>
          <Button
            mode="text"
            onPress={() => router.replace("/register")}
            style={{ marginTop: 12 }}
          >
            Don't have an account? Register here
          </Button>
          {loginError && <Text style={{ color: "red" }}>{loginError}</Text>}
          {errors.email && (
            <Text style={{ color: "red" }}>{errors.email.message}</Text>
          )}
          {errors.password && (
            <Text style={{ color: "red" }}>{errors.password.message}</Text>
          )}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}
