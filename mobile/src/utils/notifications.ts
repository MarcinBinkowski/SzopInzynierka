import { SchedulableTriggerInputTypes, scheduleNotificationAsync, setNotificationHandler } from 'expo-notifications';

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, unknown>,
  delay: number
): Promise<string> {
  try {
    const notificationId = await scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: { 
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delay,
        repeats: false  
      },
    });
    return notificationId;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw error;
  }
}