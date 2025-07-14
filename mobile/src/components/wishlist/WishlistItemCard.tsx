import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, IconButton, Chip, useTheme } from "react-native-paper";
import type { WishlistItem } from "@/api/generated/shop/schemas/wishlistItem";

interface WishlistItemCardProps {
  item: WishlistItem;
  onPress: (productId: number) => void;
  onRemove: (itemId: number) => void;
  isRemoving: boolean;
}

export function WishlistItemCard({
  item,
  onPress,
  onRemove,
  isRemoving,
}: WishlistItemCardProps) {
  const theme = useTheme();
  return (
    <Card key={item.id} style={styles.wishlistCard}>
      <TouchableOpacity
        onPress={() => onPress(item.product.id)}
        activeOpacity={0.7}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.imageContainer}>
              {item.product.primary_image ? (
                <Image
                  source={{ uri: item.product.primary_image }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <IconButton icon="image-off" size={24} />
                </View>
              )}
            </View>
            <View style={styles.productInfo}>
              <Text variant="titleMedium" style={styles.productName}>
                {item.product.name}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                {item.product.short_description}
              </Text>
            </View>
            <IconButton
              icon="heart-off"
              size={24}
              iconColor={theme.colors.error}
              onPress={(e) => {
                e.stopPropagation();
                onRemove(item.id);
              }}
              disabled={isRemoving}
            />
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text
                variant="titleLarge"
                style={{ fontWeight: "bold", color: theme.colors.primary }}
              >
                €{item.product.current_price}
              </Text>
              {item.product.is_on_sale && (
                <Chip mode="outlined" icon="tag" style={styles.saleChip}>
                  SALE
                </Chip>
              )}
            </View>
            <View>
              <Chip
                mode="outlined"
                icon={
                  item.product.is_in_stock ? "check-circle" : "close-circle"
                }
                style={{
                  backgroundColor: item.product.is_in_stock
                    ? theme.colors.primaryContainer
                    : theme.colors.errorContainer,
                }}
              >
                {item.product.is_in_stock ? "In Stock" : "Out of Stock"}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  wishlistCard: { marginBottom: 16, marginHorizontal: 16 },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productImage: { width: 80, height: 80, borderRadius: 8 },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: { flex: 1, marginRight: 8 },
  productName: { fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: { flexDirection: "row", alignItems: "center" },
  saleChip: { marginLeft: 8, marginRight: 8 },
});

export default WishlistItemCard;
