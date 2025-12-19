import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import PillarsTabBar from '../components/navigation/PillarsTabBar';
import { useTheme } from '../contexts/ThemeContext';
import { PillarsColors, getPillarsTheme } from '../theme/pillarsTheme';

// Screens
import PillarsHomeScreen from '../screens/PillarsHomeScreen';
import PillarsPrayerTimesScreen from '../screens/PillarsPrayerTimesScreen';
import PillarsQiblaScreen from '../screens/PillarsQiblaScreen';
import PillarsSettingsScreen from '../screens/PillarsSettingsScreen';

// Additional Screens
import PremiumTasbihScreenV3 from '../screens/PremiumTasbihScreenV3';
import AdjustPrayerTimesScreen from '../screens/AdjustPrayerTimesScreen';
import LocationSettingsScreen from '../screens/LocationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <PillarsTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={PillarsHomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="PrayerTimes"
        component={PillarsPrayerTimesScreen}
        options={{
          tabBarLabel: 'Prayer',
        }}
      />
      <Tab.Screen
        name="Qibla"
        component={PillarsQiblaScreen}
        options={{
          tabBarLabel: 'Qibla',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={PillarsSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator (for modals and full-screen views)
const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Tasbih" component={PremiumTasbihScreenV3} />
      <Stack.Screen name="AdjustPrayerTimes" component={AdjustPrayerTimesScreen} />
      <Stack.Screen name="LocationSettings" component={LocationSettingsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;