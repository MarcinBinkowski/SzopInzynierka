import {
  Text,
  Button,
  Searchbar,
  Portal,
} from "react-native-paper";
import { Alert } from "react-native";
import { AxiosError } from "axios";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import ScreenLoader from "@/components/common/ScreenLoader";

import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductQuery } from "@/hooks/products/useProductQuery";
import { ProductFiltersAccordion } from "@/components/products/ProductFiltersAccordion";
import { PaginatedFlatList } from "@/components/common/PaginatedFlatList";
import { CategoryDialog } from "@/components/products/FilterModals/CategoryDialog";
import { TagsDialog } from "@/components/products/FilterModals/TagsDialog";
import { SortDialog } from "@/components/products/FilterModals/SortDialog";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductList } from "@/api/generated/shop/schemas/productList";
import type { ProductDetail } from "@/api/generated/shop/schemas/productDetail";
import {
  useCheckoutItemsCreate,
  useCheckoutItemsDecreaseQuantityCreate,
  useCheckoutItemsIncreaseQuantityCreate,
  useCheckoutItemsList,
  getCheckoutCartsCurrentRetrieveQueryKey,
} from "@/api/generated/shop/checkout/checkout";
import { useQueryClient } from "@tanstack/react-query";

export default function MainScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 700);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);

  const [ordering, setOrdering] = useState<string | null>(null);
  const [showSortDialog, setShowSortDialog] = useState(false);

  const queryClient = useQueryClient();

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
      onError: (error: AxiosError) => {
        if (error.response?.status === 422) {
          Alert.alert(
            "Insufficient Stock",
            "This product is no longer available in the requested quantity.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", "Failed to add product to cart. Please try again.");
        }
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
      onError: (error: AxiosError) => {
        if (error.response?.status === 422) {
          Alert.alert(
            "Insufficient Stock",
            "This product is not available in the requested quantity.",
            [{ text: "OK", onPress: () => refetchCartItems() }]
          );
        } else {
          Alert.alert("Error", "Failed to increase quantity. Please try again.");
        }
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
      onError: (_: AxiosError) => {
          Alert.alert("Error", "Failed to decrease quantity. Please try again.");
      },
    },
  });

  const selectedCategoryName = selectedCategory
    ? `Category ${selectedCategory}`
    : "All Categories";

  const productQuery = useProductQuery({
    filters: {
      searchQuery: debouncedSearchQuery,
      selectedCategory,
      selectedTags,
      ordering,
    },
  });

  const { isLoading, products } = productQuery;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const openTagModal = useCallback(() => {
    setShowTagDialog(true);
  }, []);

  const handleApplyTags = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleAddToCart = useCallback(
    (product: ProductList | ProductDetail) => {
      addToCartMutation.mutate({
        data: {
          product_id: product.id,
          quantity: 1,
        },
      });
    },
    [addToCartMutation],
  );

  const handleIncreaseQuantity = useCallback(
    (productId: number) => {
      const cartItem = cartItems?.find(
        (item) => item.product?.id === productId,
      );
      if (!cartItem) return;

      increaseQuantityMutation.mutate({
        id: cartItem.id.toString(),
        data: cartItem,
      });
    },
    [cartItems, increaseQuantityMutation],
  );

  const handleDecreaseQuantity = useCallback(
    (productId: number) => {
      const cartItem = cartItems?.find(
        (item) => item.product?.id === productId,
      );
      if (!cartItem) return;

      decreaseQuantityMutation.mutate({
        id: cartItem.id.toString(),
        data: cartItem,
      });
    },
    [cartItems, decreaseQuantityMutation],
  );

  const renderProduct = useCallback(
    ({ item }: { item: ProductList }) => {
      const cartItem = cartItems?.find(
        (cartItem) => cartItem.product?.id === item.id,
      );

      return (
        <ProductCard
          product={item}
          cartItem={cartItem}
          onAddToCart={handleAddToCart}
          onIncreaseQuantity={handleIncreaseQuantity}
          onDecreaseQuantity={handleDecreaseQuantity}
          onDetails={() => router.push(`/product/${item.id}`)}
        />
      );
    },
    [
      cartItems,
      handleAddToCart,
      handleIncreaseQuantity,
      handleDecreaseQuantity,
    ],
  );

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setOrdering(null);
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScreenWrapper showBackButton={false}>
      <View style={styles.container}>
        <View style={styles.sectionPad}>
          <Searchbar
            placeholder="Search products..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.search}
            icon="magnify"
          />

          <ProductFiltersAccordion
            filters={{
              searchQuery: debouncedSearchQuery,
              selectedCategory,
              selectedTags,
              ordering,
            }}
            selectedCategoryName={selectedCategoryName}
            onShowCategoryDialog={() => setShowCategoryDialog(true)}
            onShowTagDialog={openTagModal}
            onShowSortDialog={() => setShowSortDialog(true)}
            onClearFilters={clearFilters}
          />
        </View>

        <PaginatedFlatList
          query={productQuery}
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
          contentContainerStyle={styles.listContent}
          emptyMessage="No products found"
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text variant="bodyLarge" style={styles.emptyTitle}>
                No products found
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </Text>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.emptyButton}
              >
                Clear Filters
              </Button>
            </View>
          }
        />

        <Portal>
          <CategoryDialog
            visible={showCategoryDialog}
            onDismiss={() => setShowCategoryDialog(false)}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          <TagsDialog
            visible={showTagDialog}
            onDismiss={() => setShowTagDialog(false)}
            selectedTags={selectedTags}
            onApplyTags={handleApplyTags}
          />

          <SortDialog
            visible={showSortDialog}
            onDismiss={() => setShowSortDialog(false)}
            ordering={ordering}
            onSelect={(value: string | null) => {
              setOrdering(value);
              setShowSortDialog(false);
            }}
          />
        </Portal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionPad: { padding: 16, paddingBottom: 8 },
  sectionTitle: { marginBottom: 12 },
  search: { marginBottom: 12 },
  listContent: { paddingBottom: 20 },
  emptyWrap: { padding: 32, alignItems: "center" },
  emptyTitle: { textAlign: "center", marginBottom: 8 },
  emptySubtitle: { textAlign: "center" },
  emptyButton: { marginTop: 16 },
});
