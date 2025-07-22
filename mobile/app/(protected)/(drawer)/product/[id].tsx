import React, { useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCatalogProductsRetrieve } from '@/api/generated/shop/catalog/catalog';
import { useCheckoutItemsCreate, useCheckoutItemsDecreaseQuantityCreate, useCheckoutItemsIncreaseQuantityCreate, useCheckoutItemsList } from '@/api/generated/shop/checkout/checkout';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Card, Text, Button, Chip, Divider, IconButton, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ScreenLoader from '@/components/common/ScreenLoader';
import ErrorScreen from '@/components/common/ErrorScreen';
import PriceBadge from '@/components/products/PriceBadge';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const carouselRef = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  
  const productId = parseInt(id, 10);
  
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useCatalogProductsRetrieve(productId);

  const { data: cartItems, refetch: refetchCartItems } = useCheckoutItemsList();

  const addToCartMutation = useCheckoutItemsCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
      }
    },
  });

  const increaseQuantityMutation = useCheckoutItemsIncreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
      }
    },
  });

  const decreaseQuantityMutation = useCheckoutItemsDecreaseQuantityCreate({
    mutation: {
      onSuccess: () => {
        refetchCartItems();
      },
    },
  });

  const cartItem = cartItems?.results?.find(item => item.product?.id === productId);


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

  const handleAddToWishlist = () => {
    Alert.alert('Success', 'Product added to wishlist!');
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
              <View style={{ height: 300, position: 'relative' }}>
                <Carousel
                  ref={carouselRef}
                  loop
                  width={width - 32}
                  height={300}
                  autoPlay={product.images.length > 1}
                  data={[...product.images]}
                  scrollAnimationDuration={1000}
                  onProgressChange={progress}
                  renderItem={({ item }) => (
                    <Card.Cover 
                      source={{ uri: item.image_url || 'https://placehold.co/300x200/png' }} 
                      style={styles.carouselImage}
                    />
                  )}
                />
                
                {product.images.length > 1 && (
                  <Pagination.Basic
                    progress={progress}
                    data={[...product.images]}
                    dotStyle={{ 
                      backgroundColor: theme.colors.onSurfaceVariant, 
                      borderRadius: 4,
                      width: 8,
                      height: 8,
                    }}
                    activeDotStyle={{ 
                      backgroundColor: theme.colors.primary, 
                      borderRadius: 4,
                      width: 8,
                      height: 8,
                    }}
                    containerStyle={styles.paginationContainer}
                  />
                )}
                
                {isOnSale && (
                  <View style={[styles.saleBadge, { backgroundColor: theme.colors.error }]}>
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
                  <Text variant="titleLarge" numberOfLines={3} style={styles.productTitle}>
                    {product.name}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.productDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {product.short_description}
                  </Text>
                  <View style={styles.priceStockContainer}>
                    <PriceBadge product={product}/>
                    <Chip 
                      mode="outlined" 
                      icon={isInStock ? "check-circle" : "close-circle"}
                      style={[styles.stockChip, { 
                        backgroundColor: isInStock ? theme.colors.primaryContainer : theme.colors.errorContainer 
                      }]}>
                      {isInStock ? 'In Stock' : 'Out of Stock'}
                    </Chip>
                  </View>
                </View>

              </View>

              <Divider style={styles.divider} />

              {product.category && (
                <View style={styles.metaItem}>
                  <Text variant="labelLarge">Category:</Text>
                                     <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {product.category.name}
                  </Text>
                </View>
              )}
              {product.manufacturer && (
                <View style={styles.metaItem}>
                  <Text variant="labelLarge">Manufacturer:</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {product.manufacturer.name}
                  </Text>
                </View>
              )}
            <Divider style={styles.divider} />
              {product.description && (
                <View style={styles.descriptionContainer}>
                  <Text variant="titleMedium" style={styles.descriptionTitle}>Description</Text>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    {product.description}
                  </Text>
                </View>
              )}
              <Divider style={styles.divider} />

              {product.tags && product.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Text variant="titleMedium" style={styles.descriptionTitle}>Tags</Text>
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
                      <Text variant="headlineSmall" style={[styles.quantityText, { color: theme.colors.primary }]}>
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
                    {isInStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={handleAddToWishlist}
                  icon="heart-outline"
                >
                  Wishlist
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
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  stockChip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },

  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  productCard: {
    marginBottom: 12,
  },
  cardContent: {
    paddingTop: 12,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
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
    alignItems: 'center',
  },
  quantityLabel: {
    marginBottom: 8,
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityText: {
    minWidth: 40,
    textAlign: 'center',
  },


});
