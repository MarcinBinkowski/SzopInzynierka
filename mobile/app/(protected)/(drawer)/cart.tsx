import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  Divider,
  IconButton,
  useTheme,
  RadioButton
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import ErrorScreen from '@/components/common/ErrorScreen';
import { useCheckoutItemsList } from '@/api/generated/shop/checkout/checkout';
import { useCheckoutItemsIncreaseQuantityCreate, useCheckoutItemsDecreaseQuantityCreate } from '@/api/generated/shop/checkout/checkout';
import { useCheckoutCreateCheckoutSessionCreate, useCheckoutConfirmPaymentIntentCreate } from '@/api/generated/shop/checkout/checkout';
import { useProfileAddressesList } from '@/api/generated/shop/profile/profile';
import { useCheckoutShippingMethodsList } from '@/api/generated/shop/checkout/checkout';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import React from 'react';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const theme = useTheme();
  const { data: cartItems, isLoading: cartItemsLoading, error: cartItemsError, refetch: refetchCartItems } = useCheckoutItemsList();
  const { data: addresses, isLoading: addressesLoading } = useProfileAddressesList();
  const { data: shippingMethods, isLoading: shippingMethodsLoading } = useCheckoutShippingMethodsList();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<number>(0);

  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  React.useEffect(() => {
    if (shippingMethods && shippingMethods.length > 0 && !selectedShippingMethodId) {
      setSelectedShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethodId]);

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

  const confirmPaymentMutation = useCheckoutConfirmPaymentIntentCreate({
    mutation: {
      onSuccess: (data) => {
        refetchCartItems();
      },
      onError: (error) => {
        refetchCartItems();
      },
    },
  });

  const createCheckoutSessionMutation = useCheckoutCreateCheckoutSessionCreate({
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
                confirmPaymentMutation.mutate({
                  data: {
                    session_id: data.payment_intent_id 
                  }
                });
                
                Alert.alert(
                  'Payment Successful!', 
                  'Your payment has been processed successfully.',
                  [
                    {
                      text: 'View Orders',
                      onPress: () => {
                        refetchCartItems();
                        router.push('/orders');
                      }
                    }
                  ]
                );
              }
            }
          } catch (error) {
            console.error('Payment sheet error:', error);
          }
        }
      },
      onError: (error) => {
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
        currency: 'usd',
        shipping_address_id: selectedAddressId,
        shipping_method_id: selectedShippingMethodId
      }
    });
  };

  const handleAddressSelection = (addressId: number) => {
    setSelectedAddressId(addressId);
  };

  const handleShippingMethodSelection = (methodId: number) => {
    setSelectedShippingMethodId(methodId);
  };

  const subtotal = cartItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  
  const selectedShippingMethod = shippingMethods?.find(method => method.id === selectedShippingMethodId);
  const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
  
  const total = subtotal + shippingCost;
  
  if (cartItemsLoading || addressesLoading || shippingMethodsLoading) {
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
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 10 }}>
              Shopping Cart
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <Card.Content>
            {cartItems && cartItems.length > 0 ? (
              <>
                {cartItems.map((item) => (
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
                
                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Shipping Address
                  </Text>
                  {addresses && addresses.length > 0 ? (
                    addresses.map((address) => (
                      <View key={address.id} style={styles.radioItem}>
                        <RadioButton
                          value={address.id.toString()}
                          status={selectedAddressId === address.id ? 'checked' : 'unchecked'}
                          onPress={() => handleAddressSelection(address.id)}
                        />
                        <View style={styles.addressInfo}>
                          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                            {address.label || 'Shipping Address'}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                      No shipping addresses found. Please add an address in your profile.
                    </Text>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Shipping Method
                  </Text>
                  {shippingMethods && shippingMethods.length > 0 ? (
                    shippingMethods.map((method) => (
                      <View key={method.id} style={styles.radioItem}>
                        <RadioButton
                          value={method.id.toString()}
                          status={selectedShippingMethodId === method.id ? 'checked' : 'unchecked'}
                          onPress={() => handleShippingMethodSelection(method.id)}
                        />
                        <View style={styles.methodInfo}>
                          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                            {method.name}
                          </Text>
                          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                            ${method.price}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                      No shipping methods available.
                    </Text>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Subtotal:</Text>
                    <Text variant="bodyMedium">${subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Shipping:</Text>
                    <Text variant="bodyMedium">${shippingCost.toFixed(2)}</Text>
                  </View>
                  <Divider style={{ marginVertical: 8 }} />
                  <View style={styles.summaryRow}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total:</Text>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>${total.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 20, alignItems: 'center', marginBottom: 20 }}>
                  <Button
                    mode="contained"
                    onPress={handleCheckout}
                    disabled={createCheckoutSessionMutation.isPending || !selectedAddressId || !selectedShippingMethodId}
                    loading={createCheckoutSessionMutation.isPending}
                    style={{ minWidth: 200 }}
                  >
                    {createCheckoutSessionMutation.isPending ? 'Preparing Payment...' : 'Pay with Stripe'}
                  </Button>
                </View>
              </>
            ) : (
              <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
                🛒Your cart is empty🛒
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 8,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 15,
  },
  summary: {
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
});