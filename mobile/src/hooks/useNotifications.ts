import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
// import { Platform } from 'react-native';
// import { useAuth } from '@/hooks/useAuth'; // avoid circular usage here
import { shopInstance } from '@/api/shop-mutator';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface NotificationHook {
  expoPushToken: string | null;
  permissionStatus: NotificationPermissionStatus | null;
  notification: Notifications.Notification | null;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
  triggerLocalTestNotification: (opts?: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => Promise<boolean>;
}

export function useNotifications(isAuthenticated?: boolean): NotificationHook {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Check initial permission status
    checkPermissionStatus();

    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification tap
      const notificationData = response.notification.request.content.data as any;
      console.log('Notification tapped:', notificationData);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-register token when user is authenticated and has permissions
    if (isAuthenticated && permissionStatus?.granted && !expoPushToken) {
      // Register token (includes getting Expo token and sending to backend)
      registerToken();
    }
  }, [isAuthenticated, permissionStatus?.granted]);

  const checkPermissionStatus = async () => {
    try {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      setPermissionStatus({
        granted: status === 'granted',
        canAskAgain,
        status,
      });
    } catch (err: any) {
      setError(`Failed to check permission status: ${String(err)}`);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      
      const newPermissionStatus = {
        granted: status === 'granted',
        canAskAgain,
        status,
      };
      
      setPermissionStatus(newPermissionStatus);

      if (status !== 'granted') {
        setError('Permission to send notifications was denied');
        return false;
      }

      return true;
    } catch (err: any) {
      setError(`Failed to request permissions: ${String(err)}`);
      return false;
    }
  };

  const getExpoPushToken = async (): Promise<string | null> => {
    try {
      if (!Device.isDevice) {
        setError('Push notifications only work on physical devices');
        return null;
      }

      // Check permissions first
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Permission to send notifications was denied');
        return null;
      }

      // Get push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '6b6c7aef-b4b1-4a8d-aed3-c55f0b62b827', // Replace with your Expo project ID
      });

      return token.data;
    } catch (err: any) {
      setError(`Failed to get push token: ${String(err)}`);
      return null;
    }
  };

  const registerToken = async (): Promise<boolean> => {
    try {
      const token = await getExpoPushToken();
      if (!token) {
        return false;
      }

      // Send token to backend
      await shopInstance({
        url: '/api/catalog/notifications/preferences/register_token/',
        method: 'POST',
        data: { push_token: token },
      });

      setExpoPushToken(token);
      setError(null);
      return true;
      
    } catch (err: any) {
      setError(`Failed to register token: ${String(err)}`);
      return false;
    }
  };

  const unregisterToken = async (): Promise<boolean> => {
    try {
      await shopInstance({
        url: '/api/catalog/notifications/preferences/unregister_token/',
        method: 'POST',
      });
      setExpoPushToken(null);
      return true;
      
    } catch (err: any) {
      setError(`Failed to unregister token: ${String(err)}`);
      return false;
    }
  };

  const triggerLocalTestNotification = async (opts?: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }): Promise<boolean> => {
    try {
      // Ensure we have (simulator-friendly) permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const req = await Notifications.requestPermissionsAsync();
        if (req.status !== 'granted') {
          setError('Permission not granted for notifications');
          return false;
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: opts?.title ?? 'Test notification',
          body: opts?.body ?? 'This is a locally scheduled test notification.',
          data: opts?.data ?? { source: 'local-test' },
        },
        trigger: null, // deliver immediately
      });

      return true;
    } catch (err: any) {
      setError(`Failed to trigger local notification: ${String(err)}`);
      return false;
    }
  };

  return {
    expoPushToken,
    permissionStatus,
    notification,
    error,
    requestPermissions,
    registerToken,
    unregisterToken,
    triggerLocalTestNotification,
  };
}