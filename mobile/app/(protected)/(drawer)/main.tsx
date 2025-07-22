import { 
  Text, 
  Card,
  useTheme,
  Button, 
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import { useCatalogProductsList } from '@/api/generated/shop/catalog/catalog';
import { Alert, ScrollView, View } from 'react-native';
import PriceBadge from '@/components/products/PriceBadge';
import { router } from 'expo-router';

export default function MainScreen() {
  const theme = useTheme();

  const { data, isLoading, error } = useCatalogProductsList();

  if (isLoading) {
    return <ScreenLoader />;
  }
  let products = data?.results || [];
  return (
    <ScreenWrapper >
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Featured Products
          </Text>
          
          {products.map((product, index) => (
            <Card key={product.id || index} style={{ marginBottom: 12 }}>
              <Card.Cover 
                source={{ uri: product.primary_image || 'https://placehold.co/300x200/png' }}
                style={{ height: 200 }}
              />
              <Card.Content style={{ paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" numberOfLines={2}>
                      {product.name }
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {product.short_description}
                    </Text>
                  <PriceBadge product={product} />                    
                  </View>
                 
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Button
                    mode="contained"
                    onPress={() => null}
                    style={{ flex: 1 }}
                    icon="cart-plus"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => router.push(`/product/${product.id}`)}
                    icon="information"
                  >
                    Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
        </ScrollView>
    </ScreenWrapper>
  );
}