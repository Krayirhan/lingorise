import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

const CHANNEL_ID = "lingorise-daily-reminder";
type NotificationsModule = typeof import("expo-notifications");

function getNotifications(): NotificationsModule | null {
  // In SDK 53+, Expo Go Android throws during expo-notifications module startup
  // because the module registers a remote push-token listener. Do not load the
  // module at all in Expo Go; the app remains fully testable through its QR code.
  if (isRunningInExpoGo()) return null;
  return require("expo-notifications") as NotificationsModule;
}

function configureNotificationHandler(Notifications: NotificationsModule): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function scheduleDailyReminder(hour = 19): Promise<boolean> {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return false;
    configureNotificationHandler(Notifications);

    // Android 13+ shows its notification permission prompt only after a channel exists.
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Günlük pratik hatırlatıcıları",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return false;

    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bahçen seni bekliyor 🌱",
        body: "Bugünkü kısa pratiğinle serini koru.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
    return true;
  } catch (error) {
    // Expo Go and a device can reject a native notification call; never surface that
    // failure as an uncaught app error or leave the reminder toggle marked enabled.
    console.warn("Daily reminder could not be scheduled", error);
    return false;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Daily reminder could not be cancelled", error);
  }
}
