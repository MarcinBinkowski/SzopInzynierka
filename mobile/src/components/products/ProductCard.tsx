import React from 'react';
import { View } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import PriceBadge from '@/components/products/PriceBadge';
import { ProductList } from '@/api/generated/shop/schemas/productList';
import { ProductDetail } from '@/api/generated/shop/schemas/productDetail';

interface ProductCardProps {
  product: ProductList ;
  onAddToCart?: (product: ProductList | ProductDetail) => void;
  onDetails: () => void;
}

export function ProductCard({ product, onAddToCart, onDetails }: ProductCardProps) {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 12, marginHorizontal: 16 }}>
      <Card.Cover 
        source={{ uri: product.primary_image || 'https://placehold.co/300x200/png' }}
        style={{ height: 200 }}
      />
      <Card.Content style={{ paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" numberOfLines={2}>
              {product.name || 'Unnamed Product'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {product.short_description || 'No description available'}
            </Text>
            <PriceBadge product={product} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button
            mode="contained"
            onPress={() => onAddToCart?.(product)}
            style={{ flex: 1 }}
            icon="cart-plus"
          >
            Add to Cart
          </Button>
          <Button
            mode="outlined"
            onPress={onDetails}
            icon="information"
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default ProductCard;