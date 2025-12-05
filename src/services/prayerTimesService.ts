import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerTimesData } from '../types/prayer';
import * as Notifications from 'expo-notifications';

const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';
const PRAYER_TIMES_CACHE_KEY = '@islamic_app_prayer_times_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

interface CachedPrayerTimes {
  data: PrayerTimesData;
  timestamp: number;
  latitude: number;
  longitude: number;
  date: string;
}

interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
  notification?: boolean;
}

export class PrayerTimesService {
  private static notificationIds: { [key: string]: string } = {};

  /**
   * Get prayer times by coordinates with caching and automatic adjustment
   */
  static async getPrayerTimesByCoordinates(
    latitude: number,
    longitude: number,
    method: number = 2, // ISNA method by default
    adjustment?: {
      fajr?: number;
      dhuhr?: number;
      asr?: number;
      maghrib?: number;
      isha?: number;
    }
  ): Promise<PrayerTimesData> {
    try {
      // Check cache first
      const cached = await this.getCachedPrayerTimes(latitude, longitude);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }

      // Use current date in DD-MM-YYYY format
      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      const dateString = `${day}-${month}-${year}`;
      const url = `${ALADHAN_API_BASE}/timings/${dateString}`;

      const response = await axios.get(url, {
        params: {
          latitude: parseFloat(latitude.toFixed(4)),  // Round to 4 decimal places
          longitude: parseFloat(longitude.toFixed(4)), // Round to 4 decimal places
          method,
          // Removed extra parameters that cause 400 errors
          // timezonestring and school parameters removed
        },
        timeout: 10000,
      });

      if (response.data && response.data.data) {
        const prayerData = response.data.data;

        // Ensure meta data is included
        if (!prayerData.meta) {
          prayerData.meta = {
            latitude,
            longitude,
          };
        }

        // Cache the data
        await this.cachePrayerTimes({
          data: prayerData,
          timestamp: Date.now(),
          latitude,
          longitude,
          date: new Date().toISOString().split('T')[0],
        });

        return prayerData;
      }

      throw new Error('Invalid response from prayer times API');
    } catch (error) {
      console.error('Error fetching prayer times:', error);

      // Try to use cached data as fallback
      const cached = await this.getCachedPrayerTimes(latitude, longitude);
      if (cached) {
        console.warn('Using cached prayer times due to API error');
        return cached.data;
      }

      throw error;
    }
  }

  /**
   * Get prayer times by city with better error handling
   */
  static async getPrayerTimesByCity(
    city: string,
    country: string,
    method: number = 2,
  ): Promise<PrayerTimesData> {
    try {
      // Use current date in DD-MM-YYYY format
      const today = new Date();
      const dateString = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      const url = `${ALADHAN_API_BASE}/timingsByCity/${dateString}`;

      const response = await axios.get(url, {
        params: {
          city,
          country,
          method,
          // Removed extra parameters that cause 400 errors
        },
        timeout: 10000,
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from prayer times API');
    } catch (error) {
      console.error('Error fetching prayer times by city:', error);
      throw error;
    }
  }

  /**
   * Get prayer times for a specific date
   */
  static async getPrayerTimesForDate(
    latitude: number,
    longitude: number,
    date: Date,
    method: number = 2
  ): Promise<PrayerTimesData> {
    try {
      // Use date in DD-MM-YYYY format
      const dateString = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      const url = `${ALADHAN_API_BASE}/timings/${dateString}`;

      const response = await axios.get(url, {
        params: {
          latitude: parseFloat(latitude.toFixed(4)),  // Round to 4 decimal places
          longitude: parseFloat(longitude.toFixed(4)), // Round to 4 decimal places
          method,
          // Removed extra parameters that cause 400 errors
        },
        timeout: 10000,
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }

      throw new Error('Invalid response from prayer times API');
    } catch (error) {
      console.error('Error fetching prayer times for date:', error);
      throw error;
    }
  }

  /**
   * Get calculation methods with more detailed info
   */
  static getCalculationMethods() {
    return [
      { id: 0, name: 'Shia Ithna-Ashari', region: 'Shia', fajr: 16, isha: 14 },
      { id: 1, name: 'University of Islamic Sciences, Karachi', region: 'Pakistan', fajr: 18, isha: 18 },
      { id: 2, name: 'Islamic Society of North America (ISNA)', region: 'North America', fajr: 15, isha: 15 },
      { id: 3, name: 'Muslim World League (MWL)', region: 'World', fajr: 18, isha: 17 },
      { id: 4, name: 'Umm al-Qura, Makkah', region: 'Saudi Arabia', fajr: 18.5, isha: '90 min' },
      { id: 5, name: 'Egyptian General Authority of Survey', region: 'Egypt', fajr: 19.5, isha: 17.5 },
      { id: 7, name: 'Institute of Geophysics, University of Tehran', region: 'Iran', fajr: 17.7, isha: 14 },
      { id: 8, name: 'Gulf Region', region: 'Gulf', fajr: 19.5, isha: '90 min' },
      { id: 9, name: 'Kuwait', region: 'Kuwait', fajr: 18, isha: 17.5 },
      { id: 10, name: 'Qatar', region: 'Qatar', fajr: 18, isha: '90 min' },
      { id: 11, name: 'Majlis Ugama Islam Singapura, Singapore', region: 'Singapore', fajr: 20, isha: 18 },
      { id: 12, name: 'Union Organization islamic de France', region: 'France', fajr: 12, isha: 12 },
      { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey', region: 'Turkey', fajr: 18, isha: 17 },
      { id: 14, name: 'Spiritual Administration of Muslims of Russia', region: 'Russia', fajr: 16, isha: 15 },
      { id: 15, name: 'Moonsighting', region: 'Global', fajr: 18, isha: 18 },
      { id: 16, name: 'Dubai', region: 'UAE', fajr: 18.2, isha: 18.2 },
    ];
  }

  /**
   * Get next prayer time with more details
   */
  static getNextPrayer(prayerTimes: any): {
    name: string;
    time: string;
    arabic: string;
    timeUntil: string;
    percentage: number;
  } | null {
    if (!prayerTimes) return null;

    const now = new Date();
    const prayers: PrayerTime[] = [
      { name: 'Fajr', time: prayerTimes.Fajr, arabic: 'الفجر' },
      { name: 'Sunrise', time: prayerTimes.Sunrise, arabic: 'الشروق' },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr, arabic: 'الظهر' },
      { name: 'Asr', time: prayerTimes.Asr, arabic: 'العصر' },
      { name: 'Maghrib', time: prayerTimes.Maghrib, arabic: 'المغرب' },
      { name: 'Isha', time: prayerTimes.Isha, arabic: 'العشاء' },
    ];

    let nextPrayer: PrayerTime | null = null;
    let previousPrayer: PrayerTime | null = null;
    let nextPrayerTime: Date | null = null;
    let previousPrayerTime: Date | null = null;

    for (let i = 0; i < prayers.length; i++) {
      const [hours, minutes] = prayers[i].time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      if (prayerTime > now && !nextPrayer) {
        nextPrayer = prayers[i];
        nextPrayerTime = prayerTime;
        if (i > 0) {
          previousPrayer = prayers[i - 1];
          const [prevHours, prevMinutes] = previousPrayer.time.split(':');
          previousPrayerTime = new Date();
          previousPrayerTime.setHours(parseInt(prevHours, 10), parseInt(prevMinutes, 10), 0, 0);
        }
        break;
      }
    }

    // If no prayer is left today, next prayer is tomorrow's Fajr
    if (!nextPrayer) {
      nextPrayer = prayers[0];
      const [hours, minutes] = nextPrayer.time.split(':');
      nextPrayerTime = new Date();
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
      nextPrayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Previous prayer is Isha
      previousPrayer = prayers[prayers.length - 1];
      const [prevHours, prevMinutes] = previousPrayer.time.split(':');
      previousPrayerTime = new Date();
      previousPrayerTime.setHours(parseInt(prevHours, 10), parseInt(prevMinutes, 10), 0, 0);
    }

    if (!nextPrayer || !nextPrayerTime) return null;

    // Calculate time until next prayer
    const timeUntilMs = nextPrayerTime.getTime() - now.getTime();
    const hours = Math.floor(timeUntilMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeUntil = `${hours}h ${minutes}m`;

    // Calculate percentage progress between prayers
    let percentage = 0;
    if (previousPrayerTime && nextPrayerTime) {
      const totalTime = nextPrayerTime.getTime() - previousPrayerTime.getTime();
      const elapsed = now.getTime() - previousPrayerTime.getTime();
      percentage = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
    }

    return {
      name: nextPrayer.name,
      time: nextPrayer.time,
      arabic: nextPrayer.arabic,
      timeUntil,
      percentage,
    };
  }

  /**
   * Get all prayer times with Arabic names
   */
  static getAllPrayerTimes(prayerTimes: any): PrayerTime[] {
    if (!prayerTimes) return [];

    return [
      { name: 'Fajr', time: prayerTimes.Fajr, arabic: 'الفجر' },
      { name: 'Sunrise', time: prayerTimes.Sunrise, arabic: 'الشروق' },
      { name: 'Dhuhr', time: prayerTimes.Dhuhr, arabic: 'الظهر' },
      { name: 'Asr', time: prayerTimes.Asr, arabic: 'العصر' },
      { name: 'Maghrib', time: prayerTimes.Maghrib, arabic: 'المغرب' },
      { name: 'Isha', time: prayerTimes.Isha, arabic: 'العشاء' },
    ];
  }

  /**
   * Schedule prayer notifications
   */
  static async schedulePrayerNotifications(
    prayerTimes: any,
    enabledPrayers: { [key: string]: boolean } = {}
  ): Promise<void> {
    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      const prayers = this.getAllPrayerTimes(prayerTimes);

      for (const prayer of prayers) {
        if (prayer.name === 'Sunrise') continue; // Skip sunrise notification

        const isEnabled = enabledPrayers[prayer.name.toLowerCase()] !== false;
        if (!isEnabled) continue;

        const [hours, minutes] = prayer.time.split(':');
        const prayerTime = new Date();
        prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        // Schedule notification if prayer time is in the future
        if (prayerTime > new Date()) {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.name} Prayer Time`,
              body: `It's time for ${prayer.name} (${prayer.arabic}) prayer`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              vibrate: [0, 250, 250, 250],
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: prayerTime,
            } as Notifications.DateTriggerInput,
          });

          this.notificationIds[prayer.name] = identifier;
        }
      }
    } catch (error) {
      console.error('Error scheduling prayer notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Cache prayer times
   */
  private static async cachePrayerTimes(data: CachedPrayerTimes): Promise<void> {
    try {
      await AsyncStorage.setItem(PRAYER_TIMES_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache prayer times:', error);
    }
  }

  /**
   * Get cached prayer times
   */
  private static async getCachedPrayerTimes(
    latitude: number,
    longitude: number
  ): Promise<CachedPrayerTimes | null> {
    try {
      const cached = await AsyncStorage.getItem(PRAYER_TIMES_CACHE_KEY);
      if (cached) {
        const data: CachedPrayerTimes = JSON.parse(cached);

        // Check if cached data is for the same location (within 0.01 degrees)
        if (
          Math.abs(data.latitude - latitude) < 0.01 &&
          Math.abs(data.longitude - longitude) < 0.01
        ) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to get cached prayer times:', error);
    }
    return null;
  }

  /**
   * Check if cache is still valid
   */
  private static isCacheValid(cached: CachedPrayerTimes): boolean {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // Cache is valid if it's from today and less than 1 hour old
    return (
      cached.date === today &&
      now - cached.timestamp < CACHE_DURATION
    );
  }

  /**
   * Clear cached prayer times
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PRAYER_TIMES_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear prayer times cache:', error);
    }
  }

  /**
   * Calculate Qibla direction from current location
   */
  static calculateQiblaDirection(latitude: number, longitude: number): number {
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLon = 39.8262;

    const dLon = this.toRad(kaabaLon - longitude);
    const lat1Rad = this.toRad(latitude);
    const lat2Rad = this.toRad(kaabaLat);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  }

  /**
   * Convert degrees to radians
   */
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}