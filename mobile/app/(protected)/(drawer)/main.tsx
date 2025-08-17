import { 
  Text, 
  useTheme,
  Button, 
  Searchbar,
  Portal,
  Badge,
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';

import { View, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useProductQuery } from '@/hooks/products/useProductQuery';
import { ProductFiltersAccordion } from '@/components/products/ProductFiltersAccordion';
import { PaginatedFlatList } from '@/components/common/PaginatedFlatList';
import { CategoryDialog } from '@/components/products/FilterModals/CategoryDialog';
import { TagsDialog } from '@/components/products/FilterModals/TagsDialog';
import { SortDialog } from '@/components/products/FilterModals/SortDialog';
import { ProductCard } from '@/components/products/ProductCard';
import type { ProductList } from '@/api/generated/shop/schemas/productList';

export default function MainScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 700);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDialog, setShowTagDialog] = useState(false);

  const [ordering, setOrdering] = useState<string | null>(null);
  const [showSortDialog, setShowSortDialog] = useState(false);




  // We'll need to fetch category name when needed, for now just show the ID
  const selectedCategoryName = selectedCategory ? `Category ${selectedCategory}` : 'All Categories';

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

  const renderProduct = useCallback(({ item }: { item: ProductList }) => (
    <ProductCard
      product={item}
      onAddToCart={() => null}
      onDetails={() => router.push(`/product/${item.id}`)}
    />
  ), []);

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
            onSelect={(value: string | null) => { setOrdering(value); setShowSortDialog(false); }}
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
  emptyWrap: { padding: 32, alignItems: 'center' },
  emptyTitle: { textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { textAlign: 'center' },
  emptyButton: { marginTop: 16 },
});