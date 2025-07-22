import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button,
  Chip,
  Avatar,
  List,
  FAB,
  Badge,
  Divider,
  useTheme,
  IconButton,
  Searchbar,
  ProgressBar,
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import { useCatalogProductsList } from '@/api/generated/shop/catalog/catalog';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MainScreen() {
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useCatalogProductsList();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'electronics', name: 'Electronics', icon: 'cellphone' },
    { id: 'clothing', name: 'Clothing', icon: 'tshirt-crew' },
    { id: 'books', name: 'Books', icon: 'book-open-variant' },
    { id: 'home', name: 'Home & Garden', icon: 'home' },
  ];

  const handleAddToCart = (productId: string) => {
    Alert.alert('Success', 'Product added to cart!');
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (isLoading) {
    return <ScreenLoader />;
  }

  if (error) {
    return (
      <ScreenWrapper>
        <Card style={{ margin: 16 }}>
          <Card.Content>
            <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
              Error loading products
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              {(error as any)?.data?.detail || (error as any)?.data?.message || 'An error occurred while loading products'}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => refetch()}
              style={{ marginTop: 16 }}
            >
              Retry
            </Button>
          </Card.Content>
        </Card>
      </ScreenWrapper>
    );
  }

  const products = data?.results || [];
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <Card style={{ margin: 16, marginBottom: 8 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Avatar.Icon size={40} icon="store" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text variant="headlineSmall">Welcome to Our Store</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Discover amazing products
                </Text>
              </View>
              <Badge>{String(products.length)}</Badge>
            </View>
            
            <Searchbar
              placeholder="Search products..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginBottom: 16 }}
            />

            {/* Category Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    selected={selectedCategory === category.id}
                    onPress={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    icon={category.icon}
                    style={{ marginRight: 8 }}
                  >
                    {category.name}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Products Grid */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>
            Featured Products
          </Text>
          
          {filteredProducts.map((product, index) => (
            <Card key={product.id || index} style={{ marginBottom: 12 }}>
              <Card.Cover 
                source={{ uri: (product as any).image_url || 'https://placehold.co/300x200/png' }}
                style={{ height: 200 }}
              />
              <Card.Content style={{ paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" numberOfLines={2}>
                      {product.name || 'Product Name'}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {(product as any).description || 'Product description goes here...'}
                    </Text>
                    <Text variant="titleLarge" style={{ color: theme.colors.primary, marginTop: 8 }}>
                      ${(product as any).price || '29.99'}
                    </Text>
                  </View>
                  <IconButton
                    icon={favorites.includes(String(product.id || '')) ? 'heart' : 'heart-outline'}
                    iconColor={favorites.includes(String(product.id || '')) ? theme.colors.error : theme.colors.onSurfaceVariant}
                    onPress={() => toggleFavorite(String(product.id || ''))}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Button
                    mode="contained"
                    onPress={() => handleAddToCart(String(product.id || ''))}
                    style={{ flex: 1 }}
                    icon="cart-plus"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Details', `Viewing details for ${product.name}`)}
                    icon="information"
                  >
                    Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Stats Section */}
        <Card style={{ margin: 16, marginTop: 8 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Store Statistics
            </Text>
            <View style={{ flexDirection: 'row', justifyCent: 'ontspace-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {String(products.length)}
                </Text>
                <Text variant="bodySmall">Products</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                  {String(favorites.length)}
                </Text>
                <Text variant="bodySmall">Favorites</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
                  {String(categories.length)}
                </Text>
                <Text variant="bodySmall">Categories</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={{ margin: 16, marginTop: 8 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Quick Actions
            </Text>
            <View style={{ gap: 12 }}>
              <List.Item
                title="View Cart"
                description="Check your shopping cart"
                left={(props) => <List.Icon {...props} icon="cart" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('Navigation', 'Navigate to cart')}
              />
              <Divider />
              <List.Item
                title="My Profile"
                description="Manage your account"
                left={(props) => <List.Icon {...props} icon="account" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('Navigation', 'Navigate to profile')}
              />
              <Divider />
              <List.Item
                title="Order History"
                description="View your past orders"
                left={(props) => <List.Icon {...props} icon="history" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => Alert.alert('Navigation', 'Navigate to orders')}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => Alert.alert('FAB', 'Quick action button pressed!')}
      />
    </ScreenWrapper>
  );
}