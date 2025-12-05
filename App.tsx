/**
 * Hayya - Your Spiritual Companion
 * Powered by Expo
 */

import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/contexts/ThemeContext';
import {TimeFormatProvider} from './src/contexts/TimeFormatContext';
import {LoadingProvider} from './src/contexts/LoadingContext';
import MainNavigator from './src/navigation/MainNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import networkService from './src/services/networkService';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    // Request notification permissions on app start
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();

    // Monitor network connectivity
    const unsubscribe = networkService.subscribe((isConnected) => {
      console.log('Network status:', isConnected ? 'Connected' : 'Disconnected');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <TimeFormatProvider>
            <LoadingProvider>
              <NavigationContainer>
                <MainNavigator />
              </NavigationContainer>
            </LoadingProvider>
          </TimeFormatProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
