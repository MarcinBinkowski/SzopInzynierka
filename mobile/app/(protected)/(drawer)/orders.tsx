import React, { useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, useTheme, Chip, Button } from "react-native-paper";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import { router } from "expo-router";
import { useCheckoutOrdersList } from "@/api/generated/shop/checkout/checkout";
import type { Order } from "@/api/generated/shop/schemas";

export default function OrdersScreen() {
  const theme = useTheme();

  const {
    data: ordersPage,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useCheckoutOrdersList({ page: 1, page_size: 1000 });


  const orders: Order[] = Array.isArray((ordersPage as any)?.results)
    ? (ordersPage as any).results
    : [];

  const handleOrderPress = useCallback((orderId: number) => {
    router.push({ pathname: "/orders/[id]", params: { id: String(orderId) } });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return theme.colors.primary;
      case "shipped":
        return theme.colors.tertiary;
      case "delivered":
        return theme.colors.primary;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "check-circle";
      case "shipped":
        return "truck";
      case "delivered":
        return "package-variant-closed";
      case "cancelled":
        return "close-circle";
      default:
        return "clock";
    }
  };

  if (ordersLoading) {
    return <ScreenLoader />;
  }

  if (ordersError || !orders) {
    return (
      <ErrorScreen
        title="Failed to load orders"
        message="We couldn't load your order history. Please check your connection and try again."
        onRetry={refetchOrders}
        icon="alert-circle"
      />
    );
  }

  const hasOrders = orders.length > 0;

  return (
    <ScreenWrapper showBackButton={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              My Orders
            </Text>
            <Text
              variant="bodyMedium"
              style={[
                styles.headerSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your order history and status
            </Text>
          </Card.Content>
        </Card>

        {hasOrders ? (
          orders.map((order: Order) => (
            <Card
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleOrderPress(order.id)}
            >
              <Card.Content>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text variant="titleMedium" style={styles.orderNumber}>
                      {order.order_number}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.orderDate,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    icon={getStatusIcon(order.status || "pending")}
                    textStyle={{
                      color: getStatusColor(order.status || "pending"),
                    }}
                    style={[
                      styles.statusChip,
                      {
                        borderColor: getStatusColor(order.status || "pending"),
                      },
                    ]}
                  >
                    {(order.status || "pending").charAt(0).toUpperCase() +
                      (order.status || "pending").slice(1)}
                  </Chip>
                </View>

                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Subtotal:</Text>
                    <Text variant="bodyMedium">
                      €{parseFloat(order.subtotal).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Shipping:</Text>
                    <Text variant="bodyMedium">
                      €{parseFloat(order.shipping_cost || "0").toFixed(2)}
                    </Text>
                  </View>
                  {order.coupon_discount &&
                    parseFloat(order.coupon_discount) > 0 && (
                      <View style={styles.summaryRow}>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.primary }}
                        >
                          Coupon Discount:
                        </Text>
                        <Text
                          variant="bodyMedium"
                          style={{ color: theme.colors.primary }}
                        >
                          -€{parseFloat(order.coupon_discount).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  <View style={styles.summaryRow}>
                    <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                      Total:
                    </Text>
                    <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                      €{parseFloat(order.total).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  onPress={() => handleOrderPress(order.id)}
                  style={styles.viewButton}
                  icon="eye"
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContent}>
                <Text variant="headlineSmall" style={styles.emptyTitle}>
                  📦 No orders yet
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.emptySubtitle,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Start shopping to see your orders here!
                </Text>
                <Button
                  mode="contained"
                  onPress={() => router.push("/main")}
                  style={styles.shopButton}
                  icon="store"
                >
                  Start Shopping
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  headerTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    textAlign: "center",
  },
  orderCard: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
    marginRight: 16,
  },
  orderNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  orderSummary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  viewButton: {
    alignSelf: "center",
  },
  emptyCard: {
    marginBottom: 20,
    marginHorizontal: 8,
  },
  emptyContent: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: 20,
  },
  shopButton: {
    minWidth: 150,
  },
});
