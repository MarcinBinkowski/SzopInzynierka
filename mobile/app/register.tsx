import React from "react";
import { SafeAreaView, Alert } from "react-native";
import { Card, Text, TextInput, Button } from "react-native-paper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { usePostAllauthClientV1AuthSignup } from "@/api/generated/auth/authentication-account/authentication-account";

const schema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(9, "Password must be at least 9 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const signupMutation = usePostAllauthClientV1AuthSignup();

  const onSubmit = async (values: FormValues) => {
    try {
      await signupMutation.mutateAsync({
        client: "app",
        data: { email: values.email, password: values.password },
      });
      Alert.alert("Success", "Account created. You can now log in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (e) {
      Alert.alert(
        "Registration failed",
        "Please check your details and try again.",
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Card>
        <Card.Content>
          <Text
            variant="headlineMedium"
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            Create Account
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
          {errors.email && (
            <Text style={{ color: "red", marginBottom: 8 }}>
              {errors.email.message}
            </Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                style={{ marginBottom: 12 }}
                error={!!errors.password}
              />
            )}
          />
          {errors.password && (
            <Text style={{ color: "red", marginBottom: 8 }}>
              {errors.password.message}
            </Text>
          )}

          <Button
            mode="contained"
            loading={signupMutation.isPending}
            onPress={handleSubmit(onSubmit)}
            disabled={signupMutation.isPending}
          >
            Register
          </Button>

          <Button
            mode="text"
            onPress={() => router.replace("/login")}
            style={{ marginTop: 12 }}
          >
            Already have an account? Log in
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}
