import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "react-native-paper";

export default function DrawerLayout() {
  const theme = useTheme();

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
        name="main"
        options={{
          title: "Shop",
          drawerLabel: "Shop",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="store" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerLabel: "Profile",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="cart"
        options={{
          title: "Cart",
          drawerLabel: "Cart",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          drawerLabel: "Wishlist",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          title: "Orders",
          drawerLabel: "Orders",
          drawerIcon: ({ size, color }) => (
            <MaterialCommunityIcons
              name="package-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="orders/[id]"
        options={{
          title: "Order Details",
          drawerItemStyle: { display: "none" },
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="product/[id]"
        options={{
          title: "Product Details",
          drawerItemStyle: { display: "none" },
          headerShown: true,
        }}
      />
    </Drawer>
  );
}
