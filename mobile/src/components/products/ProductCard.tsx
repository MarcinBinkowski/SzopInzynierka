import React from "react";
import { View } from "react-native";
import { Card, Text, Button, IconButton, useTheme } from "react-native-paper";
import PriceBadge from "@/components/products/PriceBadge";
import { ProductList } from "@/api/generated/shop/schemas/productList";
import { ProductDetail } from "@/api/generated/shop/schemas/productDetail";
import { CartItem } from "@/api/generated/shop/schemas/cartItem";

interface ProductCardProps {
  product: ProductList;
  cartItem?: CartItem;
  onAddToCart?: (product: ProductList | ProductDetail) => void;
  onIncreaseQuantity?: (productId: number) => void;
  onDecreaseQuantity?: (productId: number) => void;
  onDetails: () => void;
}

export function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onDetails,
}: ProductCardProps) {
  const theme = useTheme();
  const isInStock = (product.stock_quantity || 0) > 0;

  return (
    <Card style={{ marginBottom: 12, marginHorizontal: 16 }}>
      <Card.Cover
        source={{
          uri: product.primary_image || "https://placehold.co/300x200/png",
        }}
        style={{ height: 200 }}
      />
      <Card.Content style={{ paddingTop: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" numberOfLines={2}>
              {product.name || "Unnamed Product"}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
            >
              {product.short_description || "No description available"}
            </Text>
            <PriceBadge product={product} />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {cartItem ? (
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <IconButton
                icon="minus"
                onPress={() => onDecreaseQuantity?.(product.id)}
                mode="outlined"
                size={20}
              />
              <Text
                variant="headlineSmall"
                style={{
                  color: theme.colors.primary,
                  minWidth: 30,
                  textAlign: "center",
                }}
              >
                {cartItem.quantity}
              </Text>
              <IconButton
                icon="plus"
                onPress={() => onIncreaseQuantity?.(product.id)}
                mode="outlined"
                size={20}
              />
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={() => onAddToCart?.(product)}
              style={{ flex: 1 }}
              icon="cart-plus"
              disabled={!isInStock}
            >
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
          <Button mode="outlined" onPress={onDetails} icon="information">
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default ProductCard;
