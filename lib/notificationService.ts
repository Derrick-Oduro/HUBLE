import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type AppSettings = {
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  autoBackup: boolean;
  analytics: boolean;
};

const SETTINGS_STORAGE_KEY = "appSettings";
const DAILY_REMINDER_ID_KEY = "notifications:dailyReminderId";
const WEEKLY_RECAP_ID_KEY = "notifications:weeklyRecapId";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  notifications: true,
  sound: true,
  vibration: true,
  autoBackup: false,
  analytics: true,
};

type NotificationPermissionResponse = {
  granted?: boolean;
  status?: string;
};

type NotificationRequest = {
  content: {
    title: string;
    body: string;
    sound?: boolean;
  };
  trigger: Record<string, unknown>;
};

type NotificationsModule = {
  AndroidImportance?: {
    DEFAULT: number;
  };
  setNotificationHandler?: (handler: {
    handleNotification: () => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }) => void;
  setNotificationChannelAsync?: (
    channelId: string,
    channel: Record<string, unknown>,
  ) => Promise<void>;
  getPermissionsAsync: () => Promise<NotificationPermissionResponse>;
  requestPermissionsAsync: () => Promise<NotificationPermissionResponse>;
  scheduleNotificationAsync: (request: NotificationRequest) => Promise<string>;
  cancelScheduledNotificationAsync: (notificationId: string) => Promise<void>;
};

let handlerConfigured = false;

const getNotificationsModule = (): NotificationsModule | null => {
  try {
    // Optional dependency: the app still works if expo-notifications is not installed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("expo-notifications") as NotificationsModule;
  } catch {
    return null;
  }
};

const hasPermission = (permission: NotificationPermissionResponse): boolean => {
  return Boolean(permission?.granted || permission?.status === "granted");
};

const cancelStoredReminder = async (
  notifications: NotificationsModule,
  storageKey: string,
): Promise<void> => {
  const storedId = await AsyncStorage.getItem(storageKey);
  if (!storedId) {
    return;
  }

  try {
    await notifications.cancelScheduledNotificationAsync(storedId);
  } catch {
    // No-op if ID no longer exists.
  } finally {
    await AsyncStorage.removeItem(storageKey);
  }
};

const scheduleDailyReminder = async (
  notifications: NotificationsModule,
): Promise<string> => {
  return notifications.scheduleNotificationAsync({
    content: {
      title: "Keep your streak alive",
      body: "Take one action in HUBLE today to protect your momentum.",
      sound: true,
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
};

const scheduleWeeklyRecap = async (
  notifications: NotificationsModule,
): Promise<string> => {
  return notifications.scheduleNotificationAsync({
    content: {
      title: "Your weekly recap is ready",
      body: "Open HUBLE to review your focus trend and plan next week.",
      sound: true,
    },
    trigger: {
      weekday: 1,
      hour: 19,
      minute: 0,
      repeats: true,
    },
  });
};

export const loadAppSettings = async (): Promise<AppSettings> => {
  try {
    const rawSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!rawSettings) {
      return DEFAULT_APP_SETTINGS;
    }

    const parsed = JSON.parse(rawSettings) as Partial<AppSettings>;
    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

export const ensureNotificationInfrastructure = async (): Promise<boolean> => {
  const notifications = getNotificationsModule();
  if (!notifications) {
    return false;
  }

  if (!handlerConfigured && notifications.setNotificationHandler) {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  if (
    Platform.OS === "android" &&
    notifications.setNotificationChannelAsync &&
    notifications.AndroidImportance
  ) {
    await notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: notifications.AndroidImportance.DEFAULT,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#8B5CF6",
    });
  }

  return true;
};

export const ensureNotificationPermission = async (
  requestPermission = true,
): Promise<boolean> => {
  const notifications = getNotificationsModule();
  if (!notifications) {
    return false;
  }

  const currentPermission = await notifications.getPermissionsAsync();
  if (hasPermission(currentPermission)) {
    return true;
  }

  if (!requestPermission) {
    return false;
  }

  const requestedPermission = await notifications.requestPermissionsAsync();
  return hasPermission(requestedPermission);
};

export const syncNotificationSchedules = async (
  notificationsEnabled: boolean,
  options?: {
    requestPermission?: boolean;
  },
): Promise<boolean> => {
  const notifications = getNotificationsModule();
  if (!notifications) {
    return false;
  }

  await ensureNotificationInfrastructure();

  await cancelStoredReminder(notifications, DAILY_REMINDER_ID_KEY);
  await cancelStoredReminder(notifications, WEEKLY_RECAP_ID_KEY);

  if (!notificationsEnabled) {
    return true;
  }

  const permissionGranted = await ensureNotificationPermission(
    options?.requestPermission !== false,
  );
  if (!permissionGranted) {
    return false;
  }

  const [dailyId, weeklyId] = await Promise.all([
    scheduleDailyReminder(notifications),
    scheduleWeeklyRecap(notifications),
  ]);

  await AsyncStorage.multiSet([
    [DAILY_REMINDER_ID_KEY, dailyId],
    [WEEKLY_RECAP_ID_KEY, weeklyId],
  ]);

  return true;
};

export const bootstrapNotificationSchedules = async (): Promise<void> => {
  const settings = await loadAppSettings();
  await syncNotificationSchedules(settings.notifications, {
    requestPermission: false,
  });
};
