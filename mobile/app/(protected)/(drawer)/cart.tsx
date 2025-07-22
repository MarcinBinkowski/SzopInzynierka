import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  ActivityIndicator,
  Divider,
  IconButton,
  useTheme
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import ErrorScreen from '@/components/common/ErrorScreen';
import { useCheckoutItemsList } from '@/api/generated/shop/checkout/checkout';
import { useCheckoutItemsIncreaseQuantityCreate, useCheckoutItemsDecreaseQuantityCreate } from '@/api/generated/shop/checkout/checkout';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function CartScreen() {
  const theme = useTheme();
  
  const { data: cartItems, isLoading, error, refetch } = useCheckoutItemsList();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const increaseQuantityMutation = useCheckoutItemsIncreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to increase quantity. Please try again.');
        console.error('Increase quantity error:', error);
      },
    },
  });

  const decreaseQuantityMutation = useCheckoutItemsDecreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetch();
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to decrease quantity. Please try again.');
        console.error('Decrease quantity error:', error);
      },
    },
  });

  const handleIncreaseQuantity = (itemId: number) => {
    increaseQuantityMutation.mutate({ 
      id: itemId.toString(),
      data: { product_id: itemId }
    });
  };

  const handleDecreaseQuantity = (itemId: number) => {
    decreaseQuantityMutation.mutate({ 
      id: itemId.toString(),
      data: { product_id: itemId }
    });
  };

  // Calculate total
  const total = cartItems?.results?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  
  // Debug cart items
  console.log('Cart items1:', cartItems?.results);
  console.log('Cart items length:', cartItems?.results?.length);
  console.log('Is cart empty?', !cartItems?.results || cartItems.results.length === 0);
  if (isLoading) {
    return <ScreenLoader />;
  }
  if (error || !cartItems) {
    return <ErrorScreen
      title="Failed to load cart"
      message="We couldn't load the cart information. Please check your connection and try again."
      onRetry={() => refetch()}
      icon="alert-circle"
    />
  }

  return (
    <ScreenWrapper >
        <Card style={{ marginBottom: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 10 }}>
              Shopping Cart
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center'}}>
              Manage your cart items
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ flex: 1, marginBottom: 20 }}>
          <Card.Content>
            {cartItems?.results && cartItems.results.length > 0 ? (
              <>
                {cartItems.results.map((item, index: number) => (
                  <View key={item.id}>
                    <List.Item
                      title={item.product?.name || 'Unknown Product'}
                      description={`$${item.unit_price} x ${item.quantity}`}
                      left={(props) => (
                        <View style={styles.imageContainer}>
                          {item.product?.primary_image ? (
                            <Image
                              source={{ uri: item.product.primary_image }}
                              style={styles.productImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <List.Icon {...props} icon="package-variant" />
                          )}
                        </View>
                      )}
                      right={(props) => (
                        <View style={styles.quantityContainer}>
                          <IconButton
                            icon="minus"
                            size={20}
                            onPress={() => handleDecreaseQuantity(item.id)}
                            disabled={decreaseQuantityMutation.isPending}
                          />
                          <Text variant="titleMedium" style={[styles.quantityText, { color: theme.colors.primary }]}>
                            {item.quantity}
                          </Text>
                          <IconButton
                            icon="plus"
                            size={20}
                            onPress={() => handleIncreaseQuantity(item.id)}
                            disabled={increaseQuantityMutation.isPending}
                          />
                        </View>
                      )}
                    />
                    {index < cartItems.results.length - 1 && <Divider />}
                  </View>
                ))}
                <Divider style={{ marginVertical: 10 }} />
                <List.Item
                  title="Total"
                  description={`$${total.toFixed(2)}`}
                  titleStyle={{ fontWeight: 'bold' }}
                  descriptionStyle={{ fontWeight: 'bold' }}
                />
              </>
            ) : (
              <Text variant="bodyLarge">
                🛒Your cart is empty🛒
              </Text>
            )}
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => console.log('Checkout pressed')}
          disabled={!cartItems?.results || cartItems.results.length === 0}
        >
          Checkout
        </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },

});