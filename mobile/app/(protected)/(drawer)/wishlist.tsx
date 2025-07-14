import { View, ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";
import ErrorScreen from "@/components/common/ErrorScreen";
import {
  useCatalogWishlistList,
  useCatalogWishlistDestroy,
  getCatalogWishlistListQueryKey,
  getCatalogWishlistCheckRetrieveQueryKey,
} from "@/api/generated/shop/wishlist/wishlist";
import { Alert } from "react-native";
import React, { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import type { WishlistItem } from "@/api/generated/shop/schemas/wishlistItem";
import { WishlistHeader } from "@/components/wishlist/WishlistHeader";
import { WishlistItemCard } from "@/components/wishlist/WishlistItemCard";

export default function WishlistScreen() {
  const queryClient = useQueryClient();

  const {
    data: wishlistItems,
    isLoading: wishlistLoading,
    error: wishlistError,
    refetch: refetchWishlist,
  } = useCatalogWishlistList();

  const removeFromWishlistMutation = useCatalogWishlistDestroy({
    mutation: {
      onSuccess: (_, variables) => {
        const removedItem = wishlistItems?.find(
          (item) => item.id.toString() === variables.id,
        );
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
        onError: () => {
        Alert.alert(
          "Error",
          "Failed to remove item from wishlist. Please try again.",
        );
      },
    },
  });

  const handleRemoveFromWishlist = useCallback(
    (itemId: number) => {
      Alert.alert(
        "Remove from Wishlist",
        "Are you sure you want to remove this item from your wishlist?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () =>
              removeFromWishlistMutation.mutate({ id: itemId.toString() }),
          },
        ],
      );
    },
    [removeFromWishlistMutation],
  );

  const handleProductPress = useCallback((productId: number) => {
    router.push({
      pathname: "/product/[id]",
      params: { id: String(productId), from: "wishlist" },
    });
  }, []);

  if (wishlistLoading) {
    return <ScreenLoader />;
  }

  if (wishlistError || !wishlistItems) {
    return (
      <ErrorScreen
        title="Failed to load wishlist"
        message="We couldn't load your wishlist. Please check your connection and try again."
        onRetry={() => {
          refetchWishlist();
        }}
        icon="alert-circle"
      />
    );
  }

  const hasItems = (wishlistItems?.length || 0) > 0;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <WishlistHeader />

        {hasItems ? (
          wishlistItems!.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item as WishlistItem}
              onPress={handleProductPress}
              onRemove={handleRemoveFromWishlist}
              isRemoving={removeFromWishlistMutation.isPending}
            />
          ))
        ) : (
          <Card style={{ marginBottom: 20 }}>
            <Card.Content>
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text
                  variant="headlineSmall"
                  style={{ textAlign: "center", marginBottom: 10 }}
                >
                  💔 Your wishlist is empty 💔
                </Text>
                <Text variant="bodyMedium" style={{ textAlign: "center" }}>
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
