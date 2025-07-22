import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
}

export default function ErrorScreen({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content.',
  onRetry,
  showRetryButton = true,
  icon = 'alert-circle',
  iconSize = 48,
}: ErrorScreenProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={theme.colors.error} 
            style={styles.icon}
          />
          <Text variant="titleMedium" style={[styles.title, { color: theme.colors.error }]}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
            {message}
          </Text>
          {showRetryButton && onRetry && (
            <Button 
              mode="contained" 
              onPress={onRetry} 
              style={styles.retryButton}
              icon="refresh"
            >
              Try Again
            </Button>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    minWidth: 120,
  },
}); 