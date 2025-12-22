/**
 * Notification Service
 * Handles all app notifications including prayer reminders
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';
const SCHEDULED_NOTIFICATIONS_KEY = '@scheduled_notifications';

interface NotificationSettings {
  prayerReminders: boolean;
  adhanSound: boolean;
  vibration: boolean;
  reminderMinutes: number; // Minutes before prayer
  jumuahReminder: boolean;
  dailyReminders: boolean;
}

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    prayerReminders: true,
    adhanSound: false,
    vibration: true,
    reminderMinutes: 10,
    jumuahReminder: true,
    dailyReminders: true,
  };

  private constructor() {
    this.initializeNotifications();
    this.loadSettings();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification settings
   */
  private async initializeNotifications() {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request permissions
    await this.requestPermissions();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get push token for remote notifications (if needed in future)
      if (Platform.OS !== 'web') {
        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Push notification token:', token.data);
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Load notification settings from storage
   */
  private async loadSettings() {
    try {
      const savedSettings = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  /**
   * Save notification settings to storage
   */
  async saveSettings(settings: Partial<NotificationSettings>) {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Get current notification settings
   */
  getSettings(): NotificationSettings {
    return this.settings;
  }

  /**
   * Schedule prayer notification
   */
  async schedulePrayerNotification(prayer: PrayerTime, date: Date) {
    try {
      if (!this.settings.prayerReminders) {
        return;
      }

      // Cancel any existing notification for this prayer
      await this.cancelPrayerNotification(prayer.name);

      // Calculate notification time (X minutes before prayer)
      const notificationTime = new Date(date);
      notificationTime.setMinutes(notificationTime.getMinutes() - this.settings.reminderMinutes);

      // Don't schedule if time has passed
      if (notificationTime <= new Date()) {
        return;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer.name} Prayer Time`,
          body: `${prayer.name} prayer will begin in ${this.settings.reminderMinutes} minutes`,
          data: { prayer: prayer.name, type: 'prayer_reminder' },
          sound: this.settings.adhanSound ? 'adhan.wav' : 'default',
          vibrate: this.settings.vibration ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          type: 'date',
          date: notificationTime,
        } as any,
      });

      // Save scheduled notification ID
      await this.saveScheduledNotification(prayer.name, identifier);

      console.log(`Scheduled notification for ${prayer.name} at ${notificationTime.toLocaleTimeString()}`);
    } catch (error) {
      console.error('Error scheduling prayer notification:', error);
    }
  }

  /**
   * Schedule all prayer notifications for the day
   */
  async scheduleDailyPrayers(prayers: PrayerTime[]) {
    try {
      if (!this.settings.prayerReminders) {
        await this.cancelAllPrayerNotifications();
        return;
      }

      const today = new Date();

      for (const prayer of prayers) {
        // Parse prayer time
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerDate = new Date(today);
        prayerDate.setHours(hours, minutes, 0, 0);

        // Schedule notification
        await this.schedulePrayerNotification(prayer, prayerDate);
      }

      console.log('Scheduled all prayer notifications for today');
    } catch (error) {
      console.error('Error scheduling daily prayers:', error);
    }
  }

  /**
   * Schedule Jumu'ah (Friday prayer) reminder
   */
  async scheduleJumuahReminder() {
    try {
      if (!this.settings.jumuahReminder) {
        return;
      }

      const now = new Date();
      const friday = new Date();

      // Find next Friday
      const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
      friday.setDate(friday.getDate() + daysUntilFriday);
      friday.setHours(11, 30, 0, 0); // Set to 11:30 AM

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Jumu'ah Prayer Reminder",
          body: "Don't forget to prepare for Jumu'ah prayer",
          data: { type: 'jumuah_reminder' },
          sound: 'default',
        },
        trigger: {
          type: 'date',
          date: friday,
        } as any,
      });

      console.log('Scheduled Jumu\'ah reminder');
    } catch (error) {
      console.error('Error scheduling Jumu\'ah reminder:', error);
    }
  }

  /**
   * Cancel a specific prayer notification
   */
  async cancelPrayerNotification(prayerName: string) {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      const notificationId = scheduledNotifications[prayerName];

      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        delete scheduledNotifications[prayerName];
        await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledNotifications));
      }
    } catch (error) {
      console.error('Error canceling prayer notification:', error);
    }
  }

  /**
   * Cancel all prayer notifications
   */
  async cancelAllPrayerNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
      console.log('Canceled all prayer notifications');
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Save scheduled notification ID
   */
  private async saveScheduledNotification(prayerName: string, identifier: string) {
    try {
      const scheduledNotifications = await this.getScheduledNotifications();
      scheduledNotifications[prayerName] = identifier;
      await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledNotifications));
    } catch (error) {
      console.error('Error saving scheduled notification:', error);
    }
  }

  /**
   * Get scheduled notifications
   */
  private async getScheduledNotifications(): Promise<Record<string, string>> {
    try {
      const saved = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return {};
    }
  }

  /**
   * Send immediate test notification
   */
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Prayer notifications are working correctly!',
          data: { type: 'test' },
        },
        trigger: null, // Immediate notification
      });
      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  async checkNotificationStatus(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }
}

export default NotificationService.getInstance();