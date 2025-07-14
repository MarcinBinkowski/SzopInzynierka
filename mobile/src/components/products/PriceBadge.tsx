import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { ProductList } from "@/api/generated/shop/schemas/productList";
import { ProductDetail } from "@/api/generated/shop/schemas/productDetail";
export default function PriceBadge({
  product,
}: {
  product: ProductList | ProductDetail;
}) {
  const theme = useTheme();
  const { is_on_sale, original_price, current_price } = product;

  if (!is_on_sale) {
    return (
      <Text
        variant="titleMedium"
        style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
      >
        €{current_price}
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text
        variant="titleMedium"
        style={{
          textDecorationLine: "line-through",
          color: theme.colors.onSurfaceVariant,
          opacity: 0.7,
        }}
      >
        €{original_price}
      </Text>
      <Text
        variant="titleLarge"
        style={{
          color: theme.colors.primary,
          fontWeight: "bold",
        }}
      >
        €{current_price}
      </Text>
    </View>
  );
}
