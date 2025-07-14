import { View, StyleSheet, Image, ScrollView, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  IconButton,
  useTheme,
  RadioButton,
  TextInput,
  Chip,
} from "react-native-paper";
import { AxiosError } from "axios";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import {
  useCheckoutCartsCurrentRetrieve,
  useCheckoutItemsIncreaseQuantityCreate,
  useCheckoutItemsDecreaseQuantityCreate,
  useCheckoutCreateCheckoutSessionCreate,
  useCheckoutConfirmPaymentIntentCreate,
  useCheckoutCouponsValidateCreate,
  useCheckoutCouponsRemoveCreate,
} from "@/api/generated/shop/checkout/checkout";
import { useQueryClient } from "@tanstack/react-query";
import {
  useProfileAddressesList,
  useProfileProfilesCheckoutStatusRetrieve,
} from "@/api/generated/shop/profile/profile";
import { useCheckoutShippingMethodsList } from "@/api/generated/shop/checkout/checkout";
import type {
  AddressList,
} from "@/api/generated/shop/schemas";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function CartScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const {
    data: cart,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useCheckoutCartsCurrentRetrieve({
    query: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 0,
    },
  });
  const { data: addressesPage, isLoading: addressesLoading } =
    useProfileAddressesList();
  const { data: shippingMethods, isLoading: shippingMethodsLoading } =
    useCheckoutShippingMethodsList();
  const { data: checkoutStatus} =
    useProfileProfilesCheckoutStatusRetrieve();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<number>(0);
  const [selectedShippingMethodId, setSelectedShippingMethodId] =
    useState<number>(0);
  const [couponCode, setCouponCode] = useState<string>("");

  const cartItems = cart?.items || [];
  const appliedCoupon = cart?.applied_coupon || null;
  const couponDiscount = cart?.coupon_discount || 0;

  const { userEmail } = useAuth();
  const allAddresses: AddressList[] = addressesPage ?? [];
  
  const addressesArray: AddressList[] = React.useMemo(() => {
    if (!userEmail) return [];
    return allAddresses.filter((addr) => addr.profile?.user_email === userEmail);
  }, [allAddresses, userEmail]);

  React.useEffect(() => {
    if (addressesArray.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addressesArray[0].id);
    }
  }, [addressesArray, selectedAddressId]);

  React.useEffect(() => {
    if (
      shippingMethods &&
      shippingMethods.length > 0 &&
      !selectedShippingMethodId
    ) {
      setSelectedShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethodId]);

  const increaseQuantityMutation = useCheckoutItemsIncreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCart();
      },
      onError: (error: AxiosError) => {
        if (error.response?.status === 422) {
          Alert.alert(
            "Insufficient Stock",
            "This product is not available in the requested quantity. Please check your cart.",
            [{ text: "OK", onPress: () => refetchCart() }]
          );
        } else {
          Alert.alert("Error", `Failed to increase quantity. Status: ${error.response?.status}`);
        }
      },
    },
  });

  const decreaseQuantityMutation = useCheckoutItemsDecreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCart();
      },
      onError: (error: AxiosError) => {
        if (error.response?.status === 422) {
          Alert.alert(
            "Invalid Quantity",
            "Cannot decrease quantity below 0.",
            [{ text: "OK", onPress: () => refetchCart() }]
          );
        } else {
          Alert.alert("Error", `Failed to decrease quantity. Status: ${error.response?.status}`);
        }
      },
    },
  });

  const confirmPaymentMutation = useCheckoutConfirmPaymentIntentCreate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries();
        refetchCart();
      },
      onError: () => {
        refetchCart();
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
              merchantDisplayName: "SzopInzynierka",
            });

            if (error) {
              Alert.alert("Error", error.message);
            } else {
              const { error: presentError } = await presentPaymentSheet();
              if (presentError) {
                Alert.alert("Error", presentError.message);
              } else {
                confirmPaymentMutation.mutate({
                  data: {
                    session_id: data.payment_intent_id,
                  },
                });

                Alert.alert(
                  "Payment Successful!",
                  "Your payment has been processed successfully.",
                  [
                    {
                      text: "View Orders",
                      onPress: () => {
                        router.push("/orders");
                      },
                    },
                  ],
                );
              }
            }
          } catch (error) {
            console.error("Payment sheet error:", error);
          }
        }
      },
      onError: (error: AxiosError) => {
        console.error("Create payment intent error:", error);
        if (error.response?.status === 422) {
          if (
            error.response?.data &&
            (error.response.data as any).error &&
            (error.response.data as any).unavailable_items
          ) {
            const { error: _, unavailable_items } = error.response.data as {
              error: string;
              unavailable_items: {
                product_name: string;
                requested_quantity: number;
                available_stock: number;
              }[];
            };
          
            const itemsString = unavailable_items
              .map(
                (item) =>
                  `Name: ${item.product_name}\nRequested: ${item.requested_quantity}\nAvailable: ${item.available_stock}`
              )
              .join("\n\n");
          
            const message = `These items are no longer available in your cart. Please review your cart.\n\n${itemsString}`;
          
            Alert.alert("Items unavailable", message);
          } else {
            Alert.alert("Failed to create payment intent", "Please try again.");
          }
        } else {
          Alert.alert("Failed to create payment intent", "Please try again.");
        }
      },
    },
  });

  const validateCouponMutation = useCheckoutCouponsValidateCreate({
    mutation: {
      onSuccess: () => {
        setCouponCode("");
        refetchCart();
        Alert.alert("Success", "Coupon applied successfully!");
      },
      onError: (error: any) => {
        if (error.response?.status === 404) {
          Alert.alert(
            "Invalid Coupon",
            "This coupon code does not exist. Please check the code and try again.",
          );
        } else if (error.response?.status === 422) {
          const errorMessage =
            error.response?.data?.error ||
            "This coupon cannot be applied to your cart.";
          Alert.alert("Coupon Not Valid", errorMessage);
        } else {
          Alert.alert(
            "Error",
            "Failed to apply coupon. Please try again later.",
          );
        }
      },
    },
  });

  const removeCouponMutation = useCheckoutCouponsRemoveCreate({
    mutation: {
      onSuccess: () => {
        refetchCart();
        Alert.alert("Success", "Coupon removed successfully!");
      },
      onError: (error: any) => {
        if (error.response?.status === 400) {
          Alert.alert(
            "No Active Cart",
            "No active cart found to remove coupon from.",
          );
        } else {
          Alert.alert("Error", "Failed to remove coupon. Please try again.");
        }
      },
    },
  });

  const handleIncreaseQuantity = (itemId: number) => {
    increaseQuantityMutation.mutate({
      id: itemId.toString(),
      data: { product_id: itemId },
    });
  };

  const handleDecreaseQuantity = (itemId: number) => {
    decreaseQuantityMutation.mutate({
      id: itemId.toString(),
      data: { product_id: itemId },
    });
  };

  const handleCheckout = () => {
    createCheckoutSessionMutation.mutate({
      data: {
        currency: "usd",
        shipping_address_id: selectedAddressId,
        shipping_method_id: selectedShippingMethodId,
      },
    });
  };

  const handleAddressSelection = (addressId: number) => {
    setSelectedAddressId(addressId);
  };

  const handleShippingMethodSelection = (methodId: number) => {
    setSelectedShippingMethodId(methodId);
  };

  const subtotal =
    cartItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;

  const selectedShippingMethod = shippingMethods?.find(
    (method) => method.id === selectedShippingMethodId,
  );
  const shippingCost = selectedShippingMethod
    ? parseFloat(selectedShippingMethod.price)
    : 0;

  const total = subtotal + shippingCost - couponDiscount;

  if (cartLoading || addressesLoading || shippingMethodsLoading) {
    return <ScreenLoader />;
  }

  if (cartError || !cart) {
    return (
      <ErrorScreen
        title="Failed to load cart"
        message="We couldn't load the cart information. Please check your connection and try again."
        onRetry={() => {
          refetchCart();
        }}
        icon="alert-circle"
      />
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={{ marginBottom: 20 }}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={{ textAlign: "center", marginBottom: 10 }}
            >
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
                      description={`€${item.unit_price} x ${item.quantity}`}
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
                          <Text
                            variant="bodyMedium"
                            style={styles.quantityText}
                          >
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
                  {addressesArray.length > 0 ? (
                    addressesArray.map((address: AddressList) => (
                      <View key={address.id} style={styles.radioItem}>
                        <RadioButton
                          value={address.id.toString()}
                          status={
                            selectedAddressId === address.id
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() => handleAddressSelection(address.id)}
                        />
                        <View style={styles.addressInfo}>
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            {address.label || "Shipping Address"}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.error }}
                    >
                      No shipping addresses found. Please add an address in your
                      profile.
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
                          status={
                            selectedShippingMethodId === method.id
                              ? "checked"
                              : "unchecked"
                          }
                          onPress={() =>
                            handleShippingMethodSelection(method.id)
                          }
                        />
                        <View style={styles.methodInfo}>
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            {method.name}
                          </Text>
                          <Text
                            variant="bodySmall"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            €{method.price}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text
                      variant="bodyMedium"
                      style={{ color: theme.colors.error }}
                    >
                      No shipping methods available.
                    </Text>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.section}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Coupon Code
                  </Text>
                  {appliedCoupon ? (
                    <View style={styles.appliedCoupon}>
                      <Chip
                        mode="outlined"
                        icon="ticket-percent"
                        onClose={() => removeCouponMutation.mutate()}
                        disabled={removeCouponMutation.isPending}
                      >
                        {appliedCoupon.code} - €{appliedCoupon.discount_amount}
                      </Chip>
                    </View>
                  ) : (
                    <View style={styles.couponInput}>
                      <TextInput
                        label="Enter coupon code"
                        value={couponCode}
                        onChangeText={setCouponCode}
                        mode="outlined"
                        style={styles.couponTextInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        right={
                          <TextInput.Icon
                            icon="ticket-percent"
                            onPress={() => {
                              if (couponCode.trim()) {
                                validateCouponMutation.mutate({
                                  data: { code: couponCode.trim() },
                                });
                              }
                            }}
                            disabled={
                              !couponCode.trim() ||
                              validateCouponMutation.isPending
                            }
                          />
                        }
                      />
                    </View>
                  )}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.summary}>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Subtotal:</Text>
                    <Text variant="bodyMedium">€{subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text variant="bodyMedium">Shipping:</Text>
                    <Text variant="bodyMedium">€{shippingCost.toFixed(2)}</Text>
                  </View>
                  {couponDiscount > 0 && (
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
                        -€{couponDiscount.toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <Divider style={{ marginVertical: 8 }} />
                  <View style={styles.summaryRow}>
                    <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                      Total:
                    </Text>
                    <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                      €{total.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {!checkoutStatus?.is_checkout_ready && (
                  <Card
                    style={{
                      margin: 16,
                      backgroundColor: theme.colors.errorContainer,
                    }}
                  >
                    <Card.Content>
                      <Text
                        variant="bodyMedium"
                        style={{
                          color: theme.colors.onErrorContainer,
                          textAlign: "center",
                        }}
                      >
                        ⚠️ Complete your profile to proceed with checkout
                      </Text>
                      <Text
                        variant="bodySmall"
                        style={{
                          color: theme.colors.onErrorContainer,
                          textAlign: "center",
                          marginTop: 4,
                        }}
                      >
                        Missing:{" "}
                        {checkoutStatus?.missing_checkout_fields?.join(", ") ||
                          "Profile information"}
                      </Text>
                    </Card.Content>
                  </Card>
                )}

                <View
                  style={{
                    marginTop: 20,
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  {!checkoutStatus?.is_checkout_ready ? (
                    <Button
                      mode="outlined"
                      onPress={() => router.push("/profile")}
                      disabled={false}
                      style={{ minWidth: 200 }}
                      icon="account-edit"
                    >
                      Complete Profile to Checkout
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={handleCheckout}
                      disabled={
                        createCheckoutSessionMutation.isPending ||
                        !selectedAddressId ||
                        !selectedShippingMethodId
                      }
                      loading={createCheckoutSessionMutation.isPending}
                      style={{ minWidth: 200 }}
                    >
                      {createCheckoutSessionMutation.isPending
                        ? "Preparing Payment..."
                        : "Pay with Stripe"}
                    </Button>
                  )}
                </View>
              </>
            ) : (
              <Text variant="bodyLarge" style={{ textAlign: "center" }}>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    marginHorizontal: 10,
    minWidth: 30,
    textAlign: "center",
  },
  imageContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 5,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 8,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    marginVertical: 15,
  },
  summary: {
    marginVertical: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  couponInput: {
    marginTop: 10,
  },
  couponTextInput: {
    marginTop: 10,
  },
  appliedCoupon: {
    marginTop: 10,
  },
});
