// mobile/app/(drawer)/_layout.tsx
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useIsAuthenticated } from '@/stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const theme = useTheme();
  console.log('drawer layout');
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
        },
        drawerLabelStyle: {
          color: theme.colors.onSurface,
        },
      }}
    >
      <Drawer.Screen
        name="cart"
        options={{
          title: 'Cart',
          drawerLabel: 'Cart',
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="debug"
        options={{
          title: 'Debug',
          drawerLabel: 'Debug',
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="bug" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}