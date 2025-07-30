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
import { usePaymentsCreateCheckoutSessionCreate, usePaymentsConfirmPaymentIntentCreate } from '@/api/generated/shop/payments/payments';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function CartScreen() {
  const { data: cartItems, isLoading: cartItemsLoading, error: cartItemsError, refetch: refetchCartItems } = useCheckoutItemsList();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const increaseQuantityMutation = useCheckoutItemsIncreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
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
        refetchCartItems();
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to decrease quantity. Please try again.');
        console.error('Decrease quantity error:', error);
      },
    },
  });

  const confirmPaymentMutation = usePaymentsConfirmPaymentIntentCreate({
    mutation: {
      onSuccess: (data) => {
        refetchCartItems();
      },
      onError: (error) => {
        refetchCartItems();
      },
    },
  });

  const createCheckoutSessionMutation = usePaymentsCreateCheckoutSessionCreate({
    mutation: {
      onSuccess: async (data) => {
        if (data.client_secret) {
          try {
            const { error } = await initPaymentSheet({
              paymentIntentClientSecret: data.client_secret,
              merchantDisplayName: 'Your Store',
            });
            
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              const { error: presentError } = await presentPaymentSheet();
              if (presentError) {
                Alert.alert('Error', presentError.message);
              } else {
                // Payment successful, confirm with backend and clear cart
                confirmPaymentMutation.mutate({
                  data: {
                    session_id: data.payment_intent_id  // Using session_id field for payment_intent_id
                  }
                });
                
                Alert.alert(
                  'Payment Successful!', 
                  'Your payment has been processed successfully and your cart has been cleared.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        refetchCartItems();
                      }
                    }
                  ]
                );
              }
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to initialize payment sheet.');
            console.error('Payment sheet error:', error);
          }
        } else {
          Alert.alert('Error', 'No client secret received from server.');
        }
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to create payment intent. Please try again.');
        console.error('Create payment intent error:', error);
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

  const handleCheckout = () => {
    createCheckoutSessionMutation.mutate({
      data: {
        currency: 'usd'
      }
    });
  };

  // Calculate total
  const total = cartItems?.results?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  
  // Debug cart items
  console.log('Cart items1:', cartItems?.results);
  console.log('Cart items length:', cartItems?.results?.length);
  console.log('Is cart empty?', !cartItems?.results || cartItems.results.length === 0);

  if (cartItemsLoading) {
    return <ScreenLoader />;
  }

  if (cartItemsError || !cartItems) {
    return <ErrorScreen
      title="Failed to load cart"
      message="We couldn't load the cart information. Please check your connection and try again."
      onRetry={() => {
        refetchCartItems();
      }}
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
                {cartItems.results.map((item) => (
                  <View key={item.id}>
                    <List.Item
                      title={item.product.name}
                      description={`$${item.unit_price} x ${item.quantity}`}
                      left={() => (
                        <View style={styles.imageContainer}>
                          {item.product.primary_image ? (
                            <Image
                              source={{ uri: item.product.primary_image }}
                              style={styles.productImage}
                            />
                          ) : (
                            <List.Icon icon="image-off" />
                          )}
                        </View>
                      )}
                      right={() => (
                        <View style={styles.quantityContainer}>
                          <IconButton
                            icon="minus"
                            size={20}
                            onPress={() => handleDecreaseQuantity(item.id)}
                            disabled={decreaseQuantityMutation.isPending}
                          />
                          <Text variant="bodyMedium" style={styles.quantityText}>
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
                    <Divider />
                  </View>
                ))}
                
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                  <Text variant="headlineSmall" style={{ marginBottom: 10 }}>
                    Total: ${total.toFixed(2)}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={handleCheckout}
                    disabled={createCheckoutSessionMutation.isPending}
                    loading={createCheckoutSessionMutation.isPending}
                    style={{ minWidth: 200 }}
                  >
                    {createCheckoutSessionMutation.isPending ? 'Preparing Payment...' : 'Pay with Stripe'}
                  </Button>
                </View>
              </>
            ) : (
              <Text variant="bodyLarge">
                🛒Your cart is empty🛒
              </Text>
            )}
          </Card.Content>
        </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: 'center',
  },
  imageContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
});