import { 
  Text, 
  Card,
  useTheme,
  Button, 
  ActivityIndicator,
  Searchbar,
  Chip,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import { catalogProductsList, useCatalogCategoriesList } from '@/api/generated/shop/catalog/catalog';
import { View, FlatList, ScrollView } from 'react-native';
import PriceBadge from '@/components/products/PriceBadge';
import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { createGetNextPageParam, flattenPaginatedData } from '@/lib/pagination';
import { useState, useCallback, useEffect } from 'react';

export default function MainScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Fetch categories for the filter
  const { data: categoriesData } = useCatalogCategoriesList();
  const categories = categoriesData || [];

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get selected category name for display
  const selectedCategoryName = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)?.name || 'Unknown Category'
    : 'All Categories';

  // Build query parameters
  const buildQueryParams = useCallback((pageParam: number = 1) => {
    const params: any = { 
      page: pageParam, 
      page_size: 10 
    };

    // Add search query
    if (debouncedSearchQuery.trim()) {
      params.search = debouncedSearchQuery.trim();
    }

    // Add category filter
    if (selectedCategory) {
      params.category = selectedCategory;
    }

    return params;
  }, [debouncedSearchQuery, selectedCategory]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite', debouncedSearchQuery, selectedCategory],
    queryFn: ({ pageParam = 1 }) => 
      catalogProductsList(buildQueryParams(pageParam)),
    getNextPageParam: createGetNextPageParam(),
    initialPageParam: 1,
  });

  const products = flattenPaginatedData(data);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setShowCategoryModal(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedCategory(null);
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  const renderProduct = ({ item: product, index }: { item: any; index: number }) => (
    <Card key={product.id || index} style={{ marginBottom: 12, marginHorizontal: 16 }}>
      <Card.Cover 
        source={{ uri: product.primary_image || 'https://placehold.co/300x200/png' }}
        style={{ height: 200 }}
      />
      <Card.Content style={{ paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" numberOfLines={2}>
              {product.name || 'Unnamed Product'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {product.short_description || 'No description available'}
            </Text>
            <PriceBadge product={product} />                    
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button
            mode="contained"
            onPress={() => null}
            style={{ flex: 1 }}
            icon="cart-plus"
          >
            Add to Cart
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push(`/product/${product.id}`)}
            icon="information"
          >
            Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading more products...</Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <ScreenWrapper showBackButton={false}>
      <View style={{ flex: 1 }}>
        {/* Search and Filter Section */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Featured Products
          </Text>
          
          {/* Search Bar */}
          <Searchbar
            placeholder="Search products..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={{ marginBottom: 12 }}
            icon="magnify"
          />

          {/* Category Filter */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Chip
              mode="outlined"
              onPress={() => setShowCategoryModal(true)}
              icon="filter-variant"
              style={{ marginRight: 8 }}
            >
              {selectedCategoryName}
            </Chip>
            
            {(searchQuery || selectedCategory) && (
              <Chip
                mode="outlined"
                onPress={clearFilters}
                icon="close"
                style={{ backgroundColor: theme.colors.errorContainer }}
              >
                Clear
              </Chip>
            )}
          </View>

          {/* Results Count */}
          {products.length > 0 && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </View>
        
        {/* Products List */}
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 8 }}>
                No products found
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                Try adjusting your search or filters
              </Text>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={{ marginTop: 16 }}
              >
                Clear Filters
              </Button>
            </View>
          }
        />

        <Portal> 
          <Modal
            visible={showCategoryModal}
            onDismiss={() => setShowCategoryModal(false)}
            contentContainerStyle={{
              backgroundColor: theme.colors.surface,
              margin: 20,
              borderRadius: 16,
              maxHeight: '80%',
            }}
          >
            <View style={{ padding: 16, paddingTop: 48 }}>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Select Category
              </Text>
              
              <ScrollView style={{ marginBottom: 16 }}>
                <List.Item
                  title="All Categories"
                  left={(props) => <List.Icon {...props} icon="apps" />}
                  onPress={() => handleCategorySelect(null)}
                  style={{
                    backgroundColor: selectedCategory === null ? theme.colors.primaryContainer : undefined,
                  }}
                />
                
                {categories.map((category) => (
                  <List.Item
                    key={category.id}
                    title={category.name}
                    left={(props) => <List.Icon {...props} icon="folder" />}
                    onPress={() => handleCategorySelect(category.id)}
                    style={{
                      backgroundColor: selectedCategory === category.id ? theme.colors.primaryContainer : undefined,
                    }}
                  />
                ))}
              </ScrollView>
            </View>
            <Button
                mode="outlined"
                onPress={() => setShowCategoryModal(false)}
                style={{ marginTop: 16 }}
              >
                Cancel
              </Button>
          </Modal>
        </Portal>
      </View>
    </ScreenWrapper>
  );
}