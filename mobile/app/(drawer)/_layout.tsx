import { Colors } from '#/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
        drawerActiveTintColor: Colors.light.tint,
        drawerInactiveTintColor: Colors.light.tabIconDefault,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="movies"
        options={{
          title: 'Movies',
          drawerLabel: 'Movies',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="film" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="screening-rooms"
        options={{
          title: 'Screening Rooms',
          drawerLabel: 'Screening Rooms',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="tv" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="screenings"
        options={{
          title: 'Screenings',
          drawerLabel: 'Screenings',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tickets"
        options={{
          title: 'Tickets',
          drawerLabel: 'Tickets',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          drawerLabel: 'Bookings',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="book" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="customers"
        options={{
          title: 'Customers',
          drawerLabel: 'Customers',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="users" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="staff"
        options={{
          title: 'Staff',
          drawerLabel: 'Staff',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="staff-roles"
        options={{
          title: 'Staff Roles',
          drawerLabel: 'Staff Roles',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="id-badge" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}