import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
// import { useAuth } from '@/hooks/useAuth'; // avoid circular usage here

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
  permissionStatus: NotificationPermissionStatus | null;
  notification: Notifications.Notification | null;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  triggerLocalTestNotification: (opts?: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => Promise<boolean>;
}

export function useNotifications(isAuthenticated?: boolean): NotificationHook {
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
    permissionStatus,
    notification,
    error,
    requestPermissions,
    triggerLocalTestNotification,
  };
}