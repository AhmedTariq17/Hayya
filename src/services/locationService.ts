import * as ExpoLocation from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Location } from '../types/prayer';

const LOCATION_CACHE_KEY = '@islamic_app_location_cache';
const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

interface CachedLocation extends Location {
  city?: string;
  country?: string;
  timestamp: number;
}

export class LocationService {
  private static locationWatcher: ExpoLocation.LocationSubscription | null = null;

  /**
   * Get current location with caching and improved accuracy
   */
  static async getCurrentLocation(): Promise<Location & { city?: string; country?: string }> {
    try {
      // Check cached location first
      const cached = await this.getCachedLocation();
      if (cached && Date.now() - cached.timestamp < LOCATION_CACHE_DURATION) {
        return {
          latitude: cached.latitude,
          longitude: cached.longitude,
          city: cached.city,
          country: cached.country,
        };
      }

      // Request permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Try to use last known location from cache even if expired
        if (cached) {
          console.warn('Using expired cached location due to permission denial');
          return {
            latitude: cached.latitude,
            longitude: cached.longitude,
            city: cached.city,
            country: cached.country,
          };
        }
        throw new Error('Location permission denied and no cached location available');
      }

      // Get location with highest accuracy
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });

      // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key required)
      let city: string | undefined = 'Your Location';
      let country: string | undefined = '';

      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`;
        const response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'IslamicApp/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          city = data.address?.city ||
                 data.address?.town ||
                 data.address?.village ||
                 data.address?.municipality ||
                 data.address?.suburb ||
                 'Your Location';
          country = data.address?.country || '';
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed, using coordinates only:', geocodeError);
      }

      const locationData: CachedLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city,
        country,
        timestamp: Date.now(),
      };

      // Cache the location
      await this.cacheLocation(locationData);

      return {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country,
      };
    } catch (error) {
      console.error('Error getting location:', error);

      // Try to use any cached location as fallback
      const cached = await this.getCachedLocation();
      if (cached) {
        console.warn('Using cached location due to error:', error);
        return {
          latitude: cached.latitude,
          longitude: cached.longitude,
          city: cached.city,
          country: cached.country,
        };
      }

      throw error;
    }
  }

  /**
   * Watch location updates for real-time tracking
   */
  static async watchLocation(
    callback: (location: Location & { city?: string; country?: string }) => void,
    options?: {
      accuracy?: ExpoLocation.Accuracy;
      distanceInterval?: number;
      timeInterval?: number;
    }
  ): Promise<void> {
    // Disable location watching on web to avoid subscription errors
    if (Platform.OS === 'web') {
      console.log('Location watching not supported on web platform');
      // Get location once instead
      const location = await this.getCurrentLocation();
      callback(location);
      return;
    }

    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Stop existing watcher
      this.stopWatchingLocation();

      this.locationWatcher = await ExpoLocation.watchPositionAsync(
        {
          accuracy: options?.accuracy || ExpoLocation.Accuracy.High,
          distanceInterval: options?.distanceInterval || 10, // Update every 10 meters
          timeInterval: options?.timeInterval || 5000, // Update every 5 seconds
        },
        async (location) => {
          // Use OpenStreetMap Nominatim for reverse geocoding
          let city: string | undefined = 'Your Location';
          let country: string | undefined = '';

          try {
            const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${location.coords.latitude}&lon=${location.coords.longitude}&format=json`;
            const response = await fetch(geocodeUrl, {
              headers: {
                'User-Agent': 'IslamicApp/1.0'
              }
            });

            if (response.ok) {
              const data = await response.json();
              city = data.address?.city ||
                     data.address?.town ||
                     data.address?.village ||
                     data.address?.municipality ||
                     data.address?.suburb ||
                     'Your Location';
              country = data.address?.country || '';
            }
          } catch (geocodeError) {
            console.warn('Geocoding failed in watch location:', geocodeError);
          }

          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city,
            country,
          };

          // Update cache
          await this.cacheLocation({
            ...locationData,
            timestamp: Date.now(),
          });

          callback(locationData);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      throw error;
    }
  }

  /**
   * Stop watching location
   */
  static stopWatchingLocation(): void {
    if (this.locationWatcher) {
      try {
        // The remove method might not exist on web platform
        if (typeof this.locationWatcher.remove === 'function') {
          this.locationWatcher.remove();
        } else if (typeof (this.locationWatcher as any).unsubscribe === 'function') {
          // Web fallback
          (this.locationWatcher as any).unsubscribe();
        }
      } catch (error) {
        console.warn('Error stopping location watcher:', error);
      }
      this.locationWatcher = null;
    }
  }

  /**
   * Request location permission with better UX
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      // Check current permission status first
      const { status: existingStatus } = await ExpoLocation.getForegroundPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      // Request permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationServicesEnabled(): Promise<boolean> {
    try {
      return await ExpoLocation.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get permission status without requesting
   */
  static async getPermissionStatus(): Promise<ExpoLocation.PermissionStatus> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return ExpoLocation.PermissionStatus.UNDETERMINED;
    }
  }

  /**
   * Cache location data
   */
  private static async cacheLocation(location: CachedLocation): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    } catch (error) {
      console.warn('Failed to cache location:', error);
    }
  }

  /**
   * Get cached location
   */
  private static async getCachedLocation(): Promise<CachedLocation | null> {
    try {
      const cached = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to get cached location:', error);
    }
    return null;
  }

  /**
   * Clear cached location
   */
  static async clearCachedLocation(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear cached location:', error);
    }
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Calculate bearing/direction from one point to another (for Qibla)
   */
  static calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const dLon = this.toRad(lon2 - lon1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);

    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

    const bearing = Math.atan2(y, x);
    return ((bearing * 180) / Math.PI + 360) % 360;
  }
}