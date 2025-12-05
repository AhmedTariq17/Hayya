import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PrayerTimesService } from '../services/prayerTimesService';
import { LocationService } from '../services/locationService';
import { PrayerTimesData } from '../types/prayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NextPrayerInfo {
  name: string;
  time: string;
  arabic: string;
  timeUntil: string;
  percentage: number;
}

interface UsePrayerTimesResult {
  prayerTimes: PrayerTimesData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  nextPrayer: NextPrayerInfo | null;
  location: { city?: string; country?: string } | null;
  calculationMethod: number;
  setCalculationMethod: (method: number) => Promise<void>;
}

const CALCULATION_METHOD_KEY = '@islamic_app_calculation_method';
const UPDATE_INTERVAL = 60000; // Update every minute

export const usePrayerTimes = (): UsePrayerTimesResult => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [location, setLocation] = useState<{ city?: string; country?: string } | null>(null);
  const [calculationMethod, setCalculationMethodState] = useState<number>(2); // ISNA default
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const fetchPrayerTimes = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Check if location services are enabled
      const locationEnabled = await LocationService.isLocationServicesEnabled();
      if (!locationEnabled) {
        throw new Error('Please enable location services to get accurate prayer times');
      }

      // Get current location with city name
      const locationData = await LocationService.getCurrentLocation();
      setLocation({ city: locationData.city, country: locationData.country });

      // Get saved calculation method
      const savedMethod = await AsyncStorage.getItem(CALCULATION_METHOD_KEY);
      const method = savedMethod ? parseInt(savedMethod, 10) : calculationMethod;

      // Fetch prayer times
      const times = await PrayerTimesService.getPrayerTimesByCoordinates(
        locationData.latitude,
        locationData.longitude,
        method
      );

      setPrayerTimes(times);

      // Calculate next prayer with detailed info
      if (times && times.timings) {
        const next = PrayerTimesService.getNextPrayer(times.timings);
        setNextPrayer(next);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load prayer times';
      console.error('Error fetching prayer times:', err);
      setError(errorMessage);

      // If location permission is denied, show specific message
      if (errorMessage.includes('permission')) {
        setError('Location permission required. Please enable it in your device settings.');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [calculationMethod]);

  const setCalculationMethod = useCallback(async (method: number) => {
    try {
      await AsyncStorage.setItem(CALCULATION_METHOD_KEY, method.toString());
      setCalculationMethodState(method);
      await fetchPrayerTimes();
    } catch (error) {
      console.error('Error saving calculation method:', error);
    }
  }, [fetchPrayerTimes]);

  const updateNextPrayer = useCallback(() => {
    if (prayerTimes && prayerTimes.timings) {
      const next = PrayerTimesService.getNextPrayer(prayerTimes.timings);
      setNextPrayer(next);
    }
  }, [prayerTimes]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to foreground, refresh prayer times
        fetchPrayerTimes(true);
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [fetchPrayerTimes]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      // Load saved calculation method
      const savedMethod = await AsyncStorage.getItem(CALCULATION_METHOD_KEY);
      if (savedMethod) {
        setCalculationMethodState(parseInt(savedMethod, 10));
      }

      // Fetch prayer times
      await fetchPrayerTimes();
    };

    loadInitialData();
  }, []);

  // Update next prayer every minute
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      updateNextPrayer();
    }, UPDATE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateNextPrayer]);

  // Watch for location updates
  useEffect(() => {
    let mounted = true;

    const watchLocation = async () => {
      try {
        await LocationService.watchLocation(
          async (newLocation) => {
            if (!mounted) return;

            // Update location info
            setLocation({ city: newLocation.city, country: newLocation.country });

            // Check if location has changed significantly (> 1km)
            if (prayerTimes && prayerTimes.meta) {
              const oldLat = prayerTimes.meta.latitude;
              const oldLon = prayerTimes.meta.longitude;
              const distance = LocationService.calculateDistance(
                oldLat,
                oldLon,
                newLocation.latitude,
                newLocation.longitude
              );

              if (distance > 1) {
                // Location has changed significantly, update prayer times
                await fetchPrayerTimes(true);
              }
            }
          },
          {
            distanceInterval: 1000, // Update every 1km
            timeInterval: 300000, // Check every 5 minutes
          }
        );
      } catch (error) {
        console.error('Error watching location:', error);
      }
    };

    watchLocation();

    return () => {
      mounted = false;
      LocationService.stopWatchingLocation();
    };
  }, [prayerTimes, fetchPrayerTimes]);

  return {
    prayerTimes,
    loading,
    error,
    refresh: fetchPrayerTimes,
    nextPrayer,
    location,
    calculationMethod,
    setCalculationMethod,
  };
};