import { scheduleLocalNotification } from '#/utils/notifications';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { Button, View } from 'react-native';

async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export default function NotifyButton() {
  const handlePress = async () => {
    await ensurePermission();

    await scheduleLocalNotification(
      '📣Your movie is starting soon 📣',
      'Please buy some popcorn D:.',
      {},
      3,
    );
  };

  return (
    <View style={{ padding: 16 }}>
      <Button
        title="Notify 3s"
        onPress={handlePress}
      />
    </View>
  );
}
