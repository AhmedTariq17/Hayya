/**
 * Location Settings Screen
 * Manage prayer location settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  PillarsTypography,
  PillarsLayout,
  getPillarsTheme,
} from '../theme/pillarsTheme';
import { BackButton } from '../components/ui/BackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  isActive?: boolean;
}

const LocationSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const [currentLocation, setCurrentLocation] = useState<SavedLocation | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useGPS, setUseGPS] = useState(true);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // Popular cities for quick selection
  const popularCities = [
    { name: 'Mecca', latitude: 21.4225, longitude: 39.8262, country: 'Saudi Arabia' },
    { name: 'Medina', latitude: 24.5247, longitude: 39.5692, country: 'Saudi Arabia' },
    { name: 'Istanbul', latitude: 41.0082, longitude: 28.9784, country: 'Turkey' },
    { name: 'Cairo', latitude: 30.0444, longitude: 31.2357, country: 'Egypt' },
    { name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom' },
    { name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'United States' },
    { name: 'Dubai', latitude: 25.2048, longitude: 55.2708, country: 'UAE' },
    { name: 'Toronto', latitude: 43.6532, longitude: -79.3832, country: 'Canada' },
  ];

  useEffect(() => {
    loadSavedLocations();
    if (useGPS) {
      getCurrentLocation();
    }
  }, []);

  const loadSavedLocations = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedLocations');
      if (saved) {
        setSavedLocations(JSON.parse(saved));
      }

      const current = await AsyncStorage.getItem('currentLocation');
      if (current) {
        setCurrentLocation(JSON.parse(current));
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get current location');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      const newLocation: SavedLocation = {
        name: 'Current Location',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: `${address.city}, ${address.region}, ${address.country}`,
        isActive: true,
      };

      setCurrentLocation(newLocation);
      await AsyncStorage.setItem('currentLocation', JSON.stringify(newLocation));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Location updated successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const selectLocation = async (location: SavedLocation) => {
    setCurrentLocation({ ...location, isActive: true });
    await AsyncStorage.setItem('currentLocation', JSON.stringify({ ...location, isActive: true }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Success', `Location set to ${location.name}`);
  };

  const addNewLocation = async () => {
    if (!newLocationName.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    // In a real app, you would geocode the location name here
    Alert.alert('Info', 'Location search API would be integrated here');
    setShowAddLocation(false);
    setNewLocationName('');
  };

  const deleteLocation = (index: number) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = [...savedLocations];
            updated.splice(index, 1);
            setSavedLocations(updated);
            await AsyncStorage.setItem('savedLocations', JSON.stringify(updated));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950]]
              : [PillarsColors.gold[50], PillarsColors.white]
          }
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <View style={styles.headerTop}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              Location Settings
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Current Location Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.currentLocationCard, { backgroundColor: theme.background.card }]}
        >
          <LinearGradient
            colors={PillarsColors.gradients.navyGold as any}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.currentLocationContent}>
            <View style={styles.locationIcon}>
              <MaterialCommunityIcons name="map-marker" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.currentLocationLabel}>Current Location</Text>
              {currentLocation ? (
                <>
                  <Text style={styles.currentLocationName}>{currentLocation.name}</Text>
                  {currentLocation.address && (
                    <Text style={styles.currentLocationAddress}>{currentLocation.address}</Text>
                  )}
                  <Text style={styles.coordinates}>
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </Text>
                </>
              ) : (
                <Text style={styles.noLocation}>No location set</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={getCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="refresh" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* GPS Toggle */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.gpsToggleCard, { backgroundColor: theme.background.card }]}
        >
          <View style={styles.gpsToggleContent}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={PillarsColors.gold[500]} />
            <Text style={[styles.gpsToggleText, { color: theme.text.primary }]}>
              Use GPS for automatic location
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              { backgroundColor: useGPS ? PillarsColors.gold[500] : theme.divider }
            ]}
            onPress={() => {
              setUseGPS(!useGPS);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!useGPS) {
                getCurrentLocation();
              }
            }}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: useGPS ? 20 : 0 }] }
              ]}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Popular Cities */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Popular Cities
          </Text>
          <View style={styles.citiesGrid}>
            {popularCities.map((city, index) => (
              <Animated.View
                key={city.name}
                entering={FadeInDown.delay(300 + index * 50).springify()}
              >
                <TouchableOpacity
                  style={[styles.cityCard, { backgroundColor: theme.background.card }]}
                  onPress={() => selectLocation(city)}
                >
                  <Text style={[styles.cityName, { color: theme.text.primary }]}>
                    {city.name}
                  </Text>
                  <Text style={[styles.countryName, { color: theme.text.secondary }]}>
                    {city.country}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Saved Locations */}
        {savedLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Saved Locations
            </Text>
            {savedLocations.map((location, index) => (
              <Animated.View
                key={`${location.name}-${index}`}
                entering={FadeInDown.delay(500 + index * 50).springify()}
                style={[styles.savedLocationItem, { backgroundColor: theme.background.card }]}
              >
                <TouchableOpacity
                  style={styles.savedLocationContent}
                  onPress={() => selectLocation(location)}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color={PillarsColors.gold[500]}
                  />
                  <Text style={[styles.savedLocationName, { color: theme.text.primary }]}>
                    {location.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteLocation(index)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Add Location Button */}
        <TouchableOpacity
          style={styles.addLocationButton}
          onPress={() => setShowAddLocation(true)}
        >
          <LinearGradient
            colors={[`${PillarsColors.gold[500]}20`, `${PillarsColors.gold[500]}10`] as any}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="add-circle-outline" size={24} color={PillarsColors.gold[500]} />
          <Text style={[styles.addLocationText, { color: PillarsColors.gold[500] }]}>
            Add Custom Location
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Location Modal (simplified) */}
      {showAddLocation && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
              Add Location
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background.primary, color: theme.text.primary }]}
              placeholder="Enter city or address"
              placeholderTextColor={theme.text.tertiary}
              value={newLocationName}
              onChangeText={setNewLocationName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddLocation(false);
                  setNewLocationName('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text.secondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addNewLocation}
              >
                <LinearGradient
                  colors={PillarsColors.gradients.navyGold as any}
                  style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: PillarsSpacing.xl,
  },
  headerContent: {
    paddingHorizontal: PillarsLayout.screenPadding,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.md,
  },
  headerTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
  },
  scrollContent: {
    padding: PillarsLayout.screenPadding,
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  currentLocationCard: {
    borderRadius: PillarsBorderRadius.lg,
    overflow: 'hidden',
    marginBottom: PillarsSpacing.lg,
    ...PillarsShadows.md,
  },
  currentLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.lg,
  },
  locationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PillarsColors.glass.white[20],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  currentLocationLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentLocationName: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  currentLocationAddress: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  noLocation: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  refreshButton: {
    position: 'absolute',
    top: PillarsSpacing.md,
    right: PillarsSpacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PillarsColors.glass.white[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.xl,
    ...PillarsShadows.sm,
  },
  gpsToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  gpsToggleText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  toggleButton: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PillarsSpacing.sm,
  },
  cityCard: {
    paddingVertical: PillarsSpacing.sm,
    paddingHorizontal: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.sm,
    marginRight: PillarsSpacing.sm,
    marginBottom: PillarsSpacing.sm,
    ...PillarsShadows.xs,
  },
  cityName: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
  },
  countryName: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  savedLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.sm,
    ...PillarsShadows.sm,
  },
  savedLocationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: PillarsSpacing.sm,
  },
  savedLocationName: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    padding: PillarsSpacing.xs,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    gap: PillarsSpacing.sm,
    borderWidth: 1,
    borderColor: `${PillarsColors.gold[500]}30`,
  },
  addLocationText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - PillarsSpacing.xl * 2,
    padding: PillarsSpacing.xl,
    borderRadius: PillarsBorderRadius.lg,
    ...PillarsShadows.lg,
  },
  modalTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.lg,
  },
  input: {
    height: 48,
    paddingHorizontal: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.sm,
    fontSize: PillarsTypography.fontSize.md,
    marginBottom: PillarsSpacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: PillarsSpacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PillarsBorderRadius.full,
  },
  cancelButtonText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: PillarsBorderRadius.full,
    overflow: 'hidden',
  },
  addButtonText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default LocationSettingsScreen;