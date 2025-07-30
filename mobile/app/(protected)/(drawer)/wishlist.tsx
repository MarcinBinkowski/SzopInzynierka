import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Card, 
  IconButton,
  useTheme,
  Chip
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import ErrorScreen from '@/components/common/ErrorScreen';
import { useCatalogWishlistList, useCatalogWishlistDestroy, getCatalogWishlistListQueryKey, getCatalogWishlistCheckRetrieveQueryKey } from '@/api/generated/shop/wishlist/wishlist';
import { Alert } from 'react-native';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

export default function WishlistScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  
  const { data: wishlistItems, isLoading: wishlistLoading, error: wishlistError, refetch: refetchWishlist } = useCatalogWishlistList();

  const removeFromWishlistMutation = useCatalogWishlistDestroy({
    mutation: {
      onSuccess: (data, variables) => {
        const removedItem = wishlistItems?.find(item => item.id.toString() === variables.id);
        const productId = removedItem?.product?.id;
        
        if (productId) {
          queryClient.invalidateQueries({
            queryKey: getCatalogWishlistCheckRetrieveQueryKey(productId),
          });
        }
        
        queryClient.invalidateQueries({
          queryKey: getCatalogWishlistListQueryKey(),
        });
        refetchWishlist();
    },
      onError: (error) => {
        Alert.alert('Error', 'Failed to remove item from wishlist. Please try again.');
        console.error('Remove from wishlist error:', error);
      },
    },
  });

  const handleRemoveFromWishlist = (itemId: number) => {
    Alert.alert(
      'Remove from Wishlist',
      'Are you sure you want to remove this item from your wishlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeFromWishlistMutation.mutate({ id: itemId.toString() });
          },
        },
      ]
    );
  };

  const handleProductPress = (productId: number) => {
    router.push(`/product/${productId}`);
  };

  if (wishlistLoading) {
    return <ScreenLoader />;
  }

  if (wishlistError || !wishlistItems) {
    return <ErrorScreen
      title="Failed to load wishlist"
      message="We couldn't load your wishlist. Please check your connection and try again."
      onRetry={() => {
        refetchWishlist();
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
              My Wishlist
            </Text>
          </Card.Content>
        </Card>

        {wishlistItems && wishlistItems.length > 0 ? (
          <>
            {wishlistItems.map((item) => (
              <Card key={item.id} style={styles.wishlistCard}>
                <TouchableOpacity 
                  onPress={() => handleProductPress(item.product.id)}
                  activeOpacity={0.7}
                >
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View style={styles.imageContainer}>
                        {item.product.primary_image ? (
                          <Image
                            source={{ uri: item.product.primary_image }}
                            style={styles.productImage}
                          />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <IconButton icon="image-off" size={24} />
                          </View>
                        )}
                      </View>
                      <View style={styles.productInfo}>
                        <Text variant="titleMedium" style={styles.productName}>
                          {item.product.name}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                          {item.product.short_description}
                        </Text>
                      </View>
                      <IconButton
                        icon="heart-off"
                        size={24}
                        iconColor={theme.colors.error}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item.id);
                        }}
                        disabled={removeFromWishlistMutation.isPending}
                      />
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <View style={styles.priceContainer}>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                          ${item.product.current_price}
                        </Text>
                        {item.product.is_on_sale && (
                          <Chip 
                            mode="outlined" 
                            icon="tag" 
                            style={{ marginLeft: 8 }}
                            textStyle={{ color: theme.colors.error }}
                          >
                            SALE
                          </Chip>
                        )}
                      </View>
                      <View style={styles.stockContainer}>
                        <Chip 
                          mode="outlined" 
                          icon={item.product.is_in_stock ? "check-circle" : "close-circle"}
                          style={{ 
                            backgroundColor: item.product.is_in_stock ? theme.colors.primaryContainer : theme.colors.errorContainer 
                          }}
                        >
                          {item.product.is_in_stock ? 'In Stock' : 'Out of Stock'}
                        </Chip>
                      </View>
                    </View>
                  </Card.Content>
                </TouchableOpacity>
              </Card>
            ))}
          </>
        ) : (
          <Card style={{ marginBottom: 20 }}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 10 }}>
                  💔 Your wishlist is empty 💔
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  Start adding products to your wishlist to see them here!
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  wishlistCard: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
}); 