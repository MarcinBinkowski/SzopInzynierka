import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { 
  Text, 
  Card, 
  Button, 
  List, 
  ActivityIndicator,
  useTheme,
  Divider
} from 'react-native-paper';

export default function CartScreen() {
  const theme = useTheme();
  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: () => Promise.resolve({ 
      items: [
        { id: 1, name: 'Product 1', price: 29.99 },
        { id: 2, name: 'Product 2', price: 19.99 }
      ], 
      total: 49.98 
    }),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={{ marginTop: 10 }}>
            Loading cart...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Card style={{ marginBottom: 20 }}>
          <Card.Content>
            <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 10 }}>
              Shopping Cart
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', opacity: 0.7 }}>
              Manage your cart items
            </Text>
          </Card.Content>
        </Card>

        <Card style={{ flex: 1, marginBottom: 20 }}>
          <Card.Content>
            {data?.items?.length > 0 ? (
              <>
                {data.items.map((item: any, index: number) => (
                  <View key={item.id}>
                    <List.Item
                      title={item.name}
                      description={`$${item.price}`}
                      left={(props) => <List.Icon {...props} icon="package-variant" />}
                      right={(props) => (
                        <Button 
                          mode="text" 
                          compact 
                          onPress={() => console.log('Remove item')}
                        >
                          Remove
                        </Button>
                      )}
                    />
                    {index < data.items.length - 1 && <Divider />}
                  </View>
                ))}
                <Divider style={{ marginVertical: 10 }} />
                <List.Item
                  title="Total"
                  description={`$${data.total}`}
                  titleStyle={{ fontWeight: 'bold' }}
                  descriptionStyle={{ fontWeight: 'bold' }}
                />
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text variant="bodyLarge" style={{ opacity: 0.5, textAlign: 'center' }}>
                  Your cart is empty
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Button 
          mode="contained" 
          onPress={() => console.log('Checkout pressed')}
          disabled={!data?.items?.length}
        >
          Checkout
        </Button>
      </View>
    </SafeAreaView>
  );
}