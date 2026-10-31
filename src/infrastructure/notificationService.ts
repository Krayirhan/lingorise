import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { dailyReminderMessages, isOwnedDailyReminder } from "../domain/notifications/dailyReminders";
import { Locale } from "../domain/models/locale";

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

let operationQueue: Promise<unknown> = Promise.resolve();
function queueOperation<T>(operation: () => Promise<T>): Promise<T> {
  const result = operationQueue.then(operation, operation);
  operationQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function cancelReminders(Notifications: NotificationsModule): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled.filter(isOwnedDailyReminder)
    .map(item => Notifications.cancelScheduledNotificationAsync(item.identifier)));
}

export function scheduleDailyReminder(locale: Locale = "tr", askPermission = true): Promise<boolean> {
  return queueOperation(async () => {
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
    const permission = current.granted || !askPermission ? current : await Notifications.requestPermissionsAsync();
    if (!permission.granted) return false;

    await cancelReminders(Notifications);
    try {
      for (const message of dailyReminderMessages(locale)) {
        await Notifications.scheduleNotificationAsync({
          identifier: message.identifier,
          content: { title: message.title, body: message.body, data: { kind: "daily-reminder" } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: message.weekday,
            hour: 19, minute: 0, ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}) },
        });
      }
    } catch (error) {
      await cancelReminders(Notifications);
      throw error;
    }
    return true;
  } catch (error) {
    // Expo Go and a device can reject a native notification call; never surface that
    // failure as an uncaught app error or leave the reminder toggle marked enabled.
    console.warn("Daily reminder could not be scheduled", error);
    return false;
  }
  });
}

export function cancelDailyReminder(): Promise<void> {
  return queueOperation(async () => {
  try {
    const Notifications = getNotifications();
    if (!Notifications) return;
    await cancelReminders(Notifications);
  } catch (error) {
    console.warn("Daily reminder could not be cancelled", error);
  }
  });
}
