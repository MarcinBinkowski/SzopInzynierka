import React, { useRef } from "react";
import { View, ScrollView, StyleSheet, Dimensions, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCatalogProductsRetrieve } from "@/api/generated/shop/catalog/catalog";
import {
  useCatalogWishlistCreate,
  useCatalogWishlistDestroy,
  useCatalogWishlistCheckRetrieve,
  getCatalogWishlistListQueryKey,
  getCatalogWishlistCheckRetrieveQueryKey,
} from "@/api/generated/shop/wishlist/wishlist";
import {
  useCheckoutItemsCreate,
  useCheckoutItemsDecreaseQuantityCreate,
  useCheckoutItemsIncreaseQuantityCreate,
  useCheckoutItemsList,
  getCheckoutCartsCurrentRetrieveQueryKey,
} from "@/api/generated/shop/checkout/checkout";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import {
  Card,
  Text,
  Button,
  Chip,
  Divider,
  IconButton,
  useTheme,
} from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import PriceBadge from "@/components/products/PriceBadge";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const carouselRef = useRef<ICarouselInstance>(null);

  const productId = parseInt(id, 10);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useCatalogProductsRetrieve(productId);

  const { data: cartItems, refetch: refetchCartItems } = useCheckoutItemsList(
    undefined,
    {
      query: {
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 0,
      },
    },
  );

  const addToCartMutation = useCheckoutItemsCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
        queryClient.invalidateQueries({
          queryKey: getCheckoutCartsCurrentRetrieveQueryKey(),
        });
      },
    },
  });

  const increaseQuantityMutation = useCheckoutItemsIncreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
        queryClient.invalidateQueries({
          queryKey: getCheckoutCartsCurrentRetrieveQueryKey(),
        });
      },
    },
  });

  const decreaseQuantityMutation = useCheckoutItemsDecreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
        queryClient.invalidateQueries({
          queryKey: getCheckoutCartsCurrentRetrieveQueryKey(),
        });
      },
    },
  });

  const cartItem = cartItems?.find((item) => item.product?.id === productId);

  const handleAddToCart = () => {
    if (!product) return;

    addToCartMutation.mutate({
      data: {
        product_id: product.id,
        quantity: 1,
      },
    });
  };

  const handleIncreaseQuantity = () => {
    if (!cartItem) return;

    increaseQuantityMutation.mutate({
      id: cartItem.id.toString(),
      data: cartItem,
    });
  };

  const handleDecreaseQuantity = () => {
    if (!cartItem) return;

    decreaseQuantityMutation.mutate({
      id: cartItem.id.toString(),
      data: cartItem,
    });
  };

  const { data: wishlistCheck, refetch: refetchWishlistCheck } =
    useCatalogWishlistCheckRetrieve(product?.id || 0, {
      query: {
        enabled: !!product?.id,
      },
    });

  const isInWishlist = wishlistCheck?.is_in_wishlist || false;
  const wishlistItemId = wishlistCheck?.wishlist_item_id || null;

  const addToWishlistMutation = useCatalogWishlistCreate({
    mutation: {
      onSuccess: () => {
        refetchWishlistCheck();

        queryClient.invalidateQueries({
          queryKey: getCatalogWishlistListQueryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: getCatalogWishlistCheckRetrieveQueryKey(productId),
        });
      },
      onError: () => {
        Alert.alert("Error", "Failed to add product to wishlist");
      },
    },
  });

  const removeFromWishlistMutation = useCatalogWishlistDestroy({
    mutation: {
      onSuccess: () => {
        refetchWishlistCheck();

        queryClient.invalidateQueries({
          queryKey: getCatalogWishlistListQueryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: getCatalogWishlistCheckRetrieveQueryKey(productId),
        });
      },
      onError: () => {
        Alert.alert("Error", "Failed to remove product from wishlist");
      },
    },
  });

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist && wishlistItemId) {
      removeFromWishlistMutation.mutate({ id: wishlistItemId.toString() });
    } else {
      addToWishlistMutation.mutate({
        data: { product_id: product.id },
      });
    }
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (error || !product) {
    return (
      <ScreenWrapper>
        <ErrorScreen
          title="Failed to load product details"
          message="We couldn't load the product information. Please check your connection and try again."
          onRetry={() => refetch()}
          icon="alert-circle"
        />
      </ScreenWrapper>
    );
  }

  const isOnSale = product.is_on_sale;
  const isInStock = product.is_in_stock;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {product.images && product.images.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <View style={{ height: 300, position: "relative" }}>
                <Carousel
                  ref={carouselRef}
                  loop
                  width={width - 32}
                  height={300}
                  autoPlay={product.images.length > 1}
                  data={[...product.images]}
                  scrollAnimationDuration={1000}
                  renderItem={({ item }) => (
                    <Card.Cover
                      source={{
                        uri:
                          item.image_url || "https://placehold.co/300x200/png",
                      }}
                      style={styles.carouselImage}
                    />
                  )}
                />

                {isOnSale && (
                  <View
                    style={[
                      styles.saleBadge,
                      { backgroundColor: theme.colors.error },
                    ]}
                  >
                    <Text style={styles.saleText}>SALE</Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          <Card style={styles.productCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text
                    variant="titleLarge"
                    numberOfLines={3}
                    style={styles.productTitle}
                  >
                    {product.name}
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.productDescription,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    {product.short_description}
                  </Text>
                  <View style={styles.priceStockContainer}>
                    <PriceBadge product={product} />
                    <Chip
                      mode="outlined"
                      icon={isInStock ? "check-circle" : "close-circle"}
                      style={[
                        styles.stockChip,
                        {
                          backgroundColor: isInStock
                            ? theme.colors.primaryContainer
                            : theme.colors.errorContainer,
                        },
                      ]}
                    >
                      {isInStock ? "In Stock" : "Out of Stock"}
                    </Chip>
                  </View>
                </View>
              </View>

              <Divider style={styles.divider} />

              {product.category && (
                <View style={styles.metaItem}>
                  <Text variant="labelLarge">Category:</Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {product.category.name}
                  </Text>
                </View>
              )}
              {product.manufacturer && (
                <View style={styles.metaItem}>
                  <Text variant="labelLarge">Manufacturer:</Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {product.manufacturer.name}
                  </Text>
                </View>
              )}
              <Divider style={styles.divider} />
              {product.description && (
                <View style={styles.descriptionContainer}>
                  <Text variant="titleMedium" style={styles.descriptionTitle}>
                    Description
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {product.description}
                  </Text>
                </View>
              )}
              <Divider style={styles.divider} />

              {product.tags && product.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text variant="titleSmall" style={styles.descriptionTitle}>
                    Tags
                  </Text>
                  <View style={styles.tagsList}>
                    {product.tags.map((tag) => (
                      <Chip key={tag.id} mode="outlined" style={styles.tag}>
                        {tag.name}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.actionButtonsContainer}>
                {cartItem ? (
                  <View style={styles.quantityContainer}>
                    <View style={styles.quantityButtons}>
                      <IconButton
                        icon="minus"
                        onPress={handleDecreaseQuantity}
                        disabled={decreaseQuantityMutation.isPending}
                        loading={decreaseQuantityMutation.isPending}
                        mode="outlined"
                      />
                      <Text
                        variant="headlineSmall"
                        style={[
                          styles.quantityText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {cartItem.quantity}
                      </Text>
                      <IconButton
                        icon="plus"
                        onPress={handleIncreaseQuantity}
                        disabled={increaseQuantityMutation.isPending}
                        loading={increaseQuantityMutation.isPending}
                        mode="outlined"
                      />
                    </View>
                  </View>
                ) : (
                  <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    disabled={!isInStock || addToCartMutation.isPending}
                    loading={addToCartMutation.isPending}
                    style={styles.addToCartButton}
                    icon="cart-plus"
                  >
                    {isInStock ? "Add to Cart" : "Out of Stock"}
                  </Button>
                )}
                <Button
                  mode={isInWishlist ? "contained" : "outlined"}
                  onPress={handleWishlistToggle}
                  icon={isInWishlist ? "heart" : "heart-outline"}
                  buttonColor={isInWishlist ? theme.colors.error : undefined}
                  textColor={isInWishlist ? theme.colors.onError : undefined}
                  disabled={
                    addToWishlistMutation.isPending ||
                    removeFromWishlistMutation.isPending
                  }
                  loading={
                    addToWishlistMutation.isPending ||
                    removeFromWishlistMutation.isPending
                  }
                >
                  {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  saleBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  stockChip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  metaItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },

  productCard: {
    marginBottom: 12,
  },
  cardContent: {
    paddingTop: 12,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    marginBottom: 8,
  },
  productDescription: {
    marginBottom: 12,
  },
  priceStockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 40,
  },
  addToCartButton: {
    flex: 1,
  },
  descriptionTitle: {
    marginBottom: 8,
  },
  carouselImage: {
    height: 300,
  },
  quantityContainer: {
    flex: 1,
    alignItems: "center",
  },
  quantityLabel: {
    marginBottom: 8,
  },
  quantityButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityText: {
    minWidth: 40,
    textAlign: "center",
  },
});
