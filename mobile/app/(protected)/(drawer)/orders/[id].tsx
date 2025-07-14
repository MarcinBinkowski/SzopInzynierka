import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, useTheme, Chip, Divider, List } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import { useCheckoutOrdersRetrieve } from "@/api/generated/shop/checkout/checkout";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();

  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useCheckoutOrdersRetrieve(id);

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

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (error || !order) {
    return (
      <ScreenWrapper>
        <ErrorScreen
          title="Failed to load order details"
          message="We couldn't load the order information. Please check your connection and try again."
          onRetry={() => refetch()}
          icon="alert-circle"
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text variant="headlineSmall" style={styles.orderNumber}>
                  {order.order_number}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.orderDate,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Chip
                mode="outlined"
                icon={getStatusIcon(order.status)}
                textStyle={{ color: getStatusColor(order.status) }}
                style={[
                  styles.statusChip,
                  { borderColor: getStatusColor(order.status) },
                ]}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Order Items" />
          <Card.Content>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <View key={item.id}>
                  <List.Item
                    title={item.product?.name || "Product"}
                    description={`€${parseFloat(item.unit_price).toFixed(
                      2,
                    )} x ${item.quantity}`}
                    right={() => (
                      <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                        €{parseFloat(item.total_price).toFixed(2)}
                      </Text>
                    )}
                  />
                  {index < order.items.length - 1 && <Divider />}
                </View>
              ))
            ) : (
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                No items found
              </Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Order Summary" />
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Subtotal:</Text>
              <Text variant="bodyMedium">
                €{parseFloat(order.subtotal).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">Shipping:</Text>
              <Text variant="bodyMedium">
                €{parseFloat(order.shipping_cost).toFixed(2)}
              </Text>
            </View>
            {order.coupon_discount && parseFloat(order.coupon_discount) > 0 && (
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
            <Divider style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Total:
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                €{parseFloat(order.total).toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Shipping Information" />
          <Card.Content>
            {order.shipping_address && (
              <View style={styles.infoSection}>
                <Text variant="labelLarge" style={styles.infoLabel}>
                  Address:
                </Text>
                <Text variant="bodyMedium">
                  {order.shipping_address.full_address}
                </Text>
              </View>
            )}
            {order.shipping_method && (
              <View style={styles.infoSection}>
                <Text variant="labelLarge" style={styles.infoLabel}>
                  Method:
                </Text>
                <Text variant="bodyMedium">{order.shipping_method.name}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {order.notes && (
          <Card style={styles.card}>
            <Card.Title title="Order Notes" />
            <Card.Content>
              <Text variant="bodyMedium">{order.notes}</Text>
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
    marginRight: 16,
  },
  orderNumber: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  card: {
    marginBottom: 16,
    marginHorizontal: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    marginBottom: 4,
    fontWeight: "bold",
  },
});
