// mobile/app/login.tsx
import { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
            Login
          </Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{ marginBottom: 12 }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 16 }}
          />
          <Button
            mode="contained"
            loading={isLoggingIn}
            onPress={() => login({ email, password })}
            disabled={!email || !password || isLoggingIn}
          >
            Sign In
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}