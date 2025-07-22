// mobile/app/login.tsx
import { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';
import { Controller, useForm } from 'react-hook-form';
import { PostAllauthClientV1AuthLoginMutationBody } from '@/api/generated/auth/authentication-account/authentication-account';
import { zodResolver } from "@hookform/resolvers/zod"
import { postAllauthClientV1AuthLoginBody } from '@/api/generated/auth/authentication-account/authentication-account.zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginScreen() {
  
  const { login, isLoggingIn, loginError} = useAuth();
  const { control, handleSubmit, register, formState: { errors } } = useForm<z.infer<typeof schema>>(
    {
      resolver: zodResolver(schema),
    }
  );
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
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
          {loginError && <Text style={{ color: 'red' }}>{loginError}</Text>}
          {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}
          {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}
        </Card.Content>
      </Card>
    </View>
  );
}