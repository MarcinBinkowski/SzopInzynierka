import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  Card,
  Switch,
  Button,
  useTheme,
  Divider,
  List,
} from 'react-native-paper';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import ScreenLoader from '@/components/common/ScreenLoader';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationsScreen() {
  const theme = useTheme();
  const {
    expoPushToken,
    permissionStatus,
    error,
    requestPermissions,
    registerToken,
    unregisterToken,
  } = useNotifications();
  
  // Mock notification preferences - these will be connected to backend
  const [stockAlerts, setStockAlerts] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const permissionGranted = await requestPermissions();
      if (permissionGranted) {
        const tokenRegistered = await registerToken();
        if (tokenRegistered) {
          Alert.alert(
            'Success',
            'Notifications enabled! You\'ll receive alerts about your wishlist items.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions, registerToken]);

  const handleDisableNotifications = useCallback(async () => {
    Alert.alert(
      'Disable Notifications',
      'Are you sure you want to disable all notifications? You won\'t receive alerts about your wishlist items.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await unregisterToken();
              Alert.alert('Success', 'Notifications disabled.');
            } catch (err) {
              Alert.alert('Error', 'Failed to disable notifications.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [unregisterToken]);

  const savePreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Save preferences to backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      Alert.alert('Success', 'Notification preferences saved!');
    } catch (err) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [stockAlerts, priceDropAlerts, quietHoursEnabled]);

  if (isLoading) {
    return <ScreenLoader />;
  }

  const isNotificationsEnabled = permissionStatus?.granted && expoPushToken;

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Permission Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusSection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Notification Status
              </Text>
              
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: isNotificationsEnabled ? theme.colors.primary : theme.colors.error }
                ]} />
                <Text variant="bodyLarge">
                  {isNotificationsEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              
              {error && (
                <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                  {error}
                </Text>
              )}
              
              <Text variant="bodyMedium" style={styles.description}>
                Get notified when items in your wishlist are back in stock or go on sale.
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Enable/Disable Notifications */}
        <Card style={styles.card}>
          <Card.Content>
            {!isNotificationsEnabled ? (
              <View>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Enable Notifications
                </Text>
                <Text variant="bodyMedium" style={styles.description}>
                  Allow push notifications to receive alerts about your wishlist items.
                </Text>
                <Button
                  mode="contained"
                  onPress={handleEnableNotifications}
                  style={styles.button}
                  icon="bell"
                >
                  Enable Notifications
                </Button>
              </View>
            ) : (
              <View>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Notification Preferences
                </Text>
                
                <List.Item
                  title="Stock Alerts"
                  description="Get notified when out-of-stock wishlist items become available"
                  left={(props) => <List.Icon {...props} icon="package-variant" />}
                  right={() => (
                    <Switch
                      value={stockAlerts}
                      onValueChange={setStockAlerts}
                      disabled={isLoading}
                    />
                  )}
                />
                
                <Divider />
                
                <List.Item
                  title="Price Drop Alerts"
                  description="Get notified when wishlist items go on sale"
                  left={(props) => <List.Icon {...props} icon="tag" />}
                  right={() => (
                    <Switch
                      value={priceDropAlerts}
                      onValueChange={setPriceDropAlerts}
                      disabled={isLoading}
                    />
                  )}
                />
                
                <Divider />
                
                <List.Item
                  title="Quiet Hours"
                  description="Pause notifications during night hours (10 PM - 8 AM)"
                  left={(props) => <List.Icon {...props} icon="sleep" />}
                  right={() => (
                    <Switch
                      value={quietHoursEnabled}
                      onValueChange={setQuietHoursEnabled}
                      disabled={isLoading}
                    />
                  )}
                />
                
                <View style={styles.buttonContainer}>
                  <Button
                    mode="contained"
                    onPress={savePreferences}
                    style={styles.saveButton}
                    disabled={isLoading}
                  >
                    Save Preferences
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={handleDisableNotifications}
                    style={styles.disableButton}
                    textColor={theme.colors.error}
                    disabled={isLoading}
                  >
                    Disable All Notifications
                  </Button>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Debug Info (Development Only) */}
        {__DEV__ && expoPushToken && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Debug Info
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                Push Token: {expoPushToken.slice(0, 50)}...
              </Text>
              <Text variant="bodySmall" style={styles.debugText}>
                Permission Status: {permissionStatus?.status}
              </Text>
            </Card.Content>
          </Card>
        )}
        
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
    opacity: 0.7,
  },
  statusSection: {
    alignItems: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  errorText: {
    marginBottom: 8,
    fontSize: 12,
  },
  button: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  disableButton: {
    borderColor: 'transparent',
  },
  debugText: {
    marginBottom: 4,
    fontFamily: 'monospace',
    fontSize: 10,
  },
});