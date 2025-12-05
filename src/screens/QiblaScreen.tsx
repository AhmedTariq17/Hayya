import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ExpoLocation from 'expo-location';
import * as Sensors from 'expo-sensors';
const { Magnetometer } = Sensors;
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Line, Text as SvgText, G } from 'react-native-svg';

// Components
import { PremiumCard } from '../components/premium/PremiumCard';
import { PremiumHeader } from '../components/premium/PremiumHeader';
import {
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Callout,
  Subheadline,
  Caption1,
  Caption2,
  ArabicText,
} from '../components/premium/PremiumText';

// Theme
import { useTheme } from '../contexts/ThemeContext';
import {
  AppleColors,
  Spacing,
  Typography,
  BorderRadius,
  Elevation,
} from '../theme/appleDesignSystem';

// Services
import { LocationService } from '../services/locationService';
import { PrayerTimesService } from '../services/prayerTimesService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.75, 320); // More balanced size with max limit

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const QiblaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();

  // State
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [heading, setHeading] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [city, setCity] = useState<string>('');

  // Animation values
  const compassRotation = useSharedValue(0);
  const needleRotation = useSharedValue(0);
  const accuracy = useSharedValue(0);
  const scrollY = useSharedValue(0);

  // Refs
  const subscription = useRef<any>(null);
  const lastHaptic = useRef(0);

  // Kaaba coordinates
  const KAABA_LATITUDE = 21.4225;
  const KAABA_LONGITUDE = 39.8262;

  useEffect(() => {
    initializeQibla();

    return () => {
      if (subscription.current) {
        subscription.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Update compass rotation based on heading
    compassRotation.value = withSpring(-heading, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });

    // Update needle rotation to always point to Qibla
    if (qiblaDirection !== 0) {
      const adjustedQibla = (qiblaDirection - heading + 360) % 360;
      needleRotation.value = withSpring(adjustedQibla, {
        damping: 15,
        stiffness: 100,
        mass: 1,
      });

      // Haptic feedback when pointing to Qibla (within 5 degrees)
      if (Math.abs(adjustedQibla) < 5 || Math.abs(adjustedQibla - 360) < 5) {
        const now = Date.now();
        if (now - lastHaptic.current > 1000) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHaptic.current = now;
        }
        accuracy.value = withTiming(1, { duration: 300 });
      } else {
        accuracy.value = withTiming(0, { duration: 300 });
      }
    }
  }, [heading, qiblaDirection]);

  const initializeQibla = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get location permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission is required to find Qibla direction');
      }

      // Get current location
      const locationData = await LocationService.getCurrentLocation();
      setLocation(locationData);
      setCity(locationData.city || 'Your Location');

      // Calculate Qibla direction
      const qibla = PrayerTimesService.calculateQiblaDirection(
        locationData.latitude,
        locationData.longitude
      );
      setQiblaDirection(qibla);

      // Calculate distance to Kaaba
      const dist = LocationService.calculateDistance(
        locationData.latitude,
        locationData.longitude,
        KAABA_LATITUDE,
        KAABA_LONGITUDE
      );
      setDistance(`${Math.round(dist).toLocaleString()} km`);

      // Start magnetometer
      await startMagnetometer();

      setLoading(false);
    } catch (err: any) {
      console.error('Error initializing Qibla:', err);
      setError(err.message || 'Failed to initialize Qibla compass');
      setLoading(false);
    }
  };

  const startMagnetometer = async () => {
    try {
      // Check if magnetometer is available
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Magnetometer is not available on this device');
      }

      // Set update interval
      Magnetometer.setUpdateInterval(100);

      // Subscribe to magnetometer updates
      subscription.current = Magnetometer.addListener((data) => {
        setMagnetometerData(data);

        // Calculate heading from magnetometer data
        let angle = Math.atan2(data.y, data.x);
        angle = angle * (180 / Math.PI);
        angle = angle + 90;
        angle = (angle + 360) % 360;

        setHeading(Math.round(angle));
      });
    } catch (err: any) {
      console.error('Magnetometer error:', err);
      setError('Compass is not available on this device');
    }
  };

  const handleCalibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Calibrate Compass',
      'Move your device in a figure-8 pattern to calibrate the compass for accurate readings.',
      [{ text: 'OK' }]
    );
  };

  const animatedCompassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const animatedNeedleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needleRotation.value}deg` }],
  }));

  const animatedAccuracyStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolate(
      accuracy.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ) === 1 ? AppleColors.system.green : 'transparent',
    borderColor: interpolate(
      accuracy.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    ) === 1 ? AppleColors.system.green : AppleColors.islamic.emerald[500],
  }));

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <PremiumHeader
          title="Qibla"
          subtitle="Finding direction..."
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
          gradient
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppleColors.islamic.emerald[500]} />
          <Body style={{ marginTop: Spacing.md }}>Initializing compass...</Body>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
        <PremiumHeader
          title="Qibla"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
          gradient
        />
        <View style={styles.errorContainer}>
          <PremiumCard variant="elevated" style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={AppleColors.system.red}
              style={{ marginBottom: Spacing.md }}
            />
            <Title2 align="center" style={{ marginBottom: Spacing.sm }}>
              Unable to Find Qibla
            </Title2>
            <Body align="center" color={isDark ? '#999' : '#666'}>
              {error}
            </Body>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeQibla}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </PremiumCard>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]}>
      <PremiumHeader
        title="Qibla"
        subtitle={city}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="compass-outline"
        onRightPress={handleCalibrate}
        gradient
        gradientColors={AppleColors.gradients.premium}
        scrollY={scrollY}
      />

      <View style={styles.content}>
        {/* Location Info Cards */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.infoContainer}
        >
          {/* Qibla Information Card */}
          <PremiumCard variant="glass" blur style={styles.mainInfoCard}>
            <View style={styles.qiblaInfoContent}>
              <MaterialCommunityIcons
                name="mosque"
                size={32}
                color={AppleColors.islamic.emerald[500]}
                style={{ marginBottom: Spacing.xs }}
              />
              <Title2 weight="bold" color={AppleColors.islamic.emerald[500]}>
                {Math.round(qiblaDirection)}°
              </Title2>
              <Caption1 color={isDark ? '#AAA' : '#666'}>
                Prayer Direction
              </Caption1>
            </View>
          </PremiumCard>

          {/* Distance and Location Info */}
          <View style={styles.secondaryInfoRow}>
            <PremiumCard variant="flat" style={styles.secondaryInfoCard}>
              <View style={styles.secondaryInfoItem}>
                <Ionicons name="location-outline" size={18} color={AppleColors.islamic.emerald[500]} />
                <View style={{ marginLeft: Spacing.xs }}>
                  <Subheadline weight="semibold">
                    {distance}
                  </Subheadline>
                  <Caption2 color={isDark ? '#999' : '#666'}>
                    to Makkah
                  </Caption2>
                </View>
              </View>
            </PremiumCard>

            <PremiumCard variant="flat" style={styles.secondaryInfoCard}>
              <View style={styles.secondaryInfoItem}>
                <Ionicons name="compass" size={18} color={isDark ? '#AAA' : '#666'} />
                <View style={{ marginLeft: Spacing.xs }}>
                  <Subheadline weight="semibold">
                    {heading}°
                  </Subheadline>
                  <Caption2 color={isDark ? '#999' : '#666'}>
                    Device Facing
                  </Caption2>
                </View>
              </View>
            </PremiumCard>
          </View>
        </Animated.View>

        {/* Compass */}
        <Animated.View
          entering={FadeIn.delay(200).springify()}
          style={styles.compassContainer}
        >
          <View style={styles.compass}>
            {/* Compass Background */}
            <LinearGradient
              colors={isDark ? ['#1C1C1E', '#000'] : ['#FFFFFF', '#F2F2F7']}
              style={styles.compassBackground}
            />

            {/* Animated Compass */}
            <Animated.View style={[styles.compassSvgContainer, animatedCompassStyle]}>
              <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox="0 0 360 360">
                {/* Compass Circle */}
                <Circle
                  cx="180"
                  cy="180"
                  r="175"
                  stroke={isDark ? '#333' : '#E5E5EA'}
                  strokeWidth="2"
                  fill="none"
                />

                {/* Degree Markings */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
                  <G key={degree}>
                    <Line
                      x1="180"
                      y1="10"
                      x2="180"
                      y2="30"
                      stroke={isDark ? '#666' : '#999'}
                      strokeWidth={degree % 90 === 0 ? "3" : "1"}
                      transform={`rotate(${degree} 180 180)`}
                    />
                    {degree % 90 === 0 && (
                      <SvgText
                        x="180"
                        y="50"
                        fontSize="16"
                        fontWeight="bold"
                        fill={isDark ? '#FFF' : '#000'}
                        textAnchor="middle"
                        transform={`rotate(${degree} 180 180) rotate(${-degree} 180 45)`}
                      >
                        {degree === 0 ? 'N' : degree === 90 ? 'E' : degree === 180 ? 'S' : 'W'}
                      </SvgText>
                    )}
                  </G>
                ))}

                {/* Inner Circle */}
                <Circle
                  cx="180"
                  cy="180"
                  r="100"
                  stroke={isDark ? '#333' : '#E5E5EA'}
                  strokeWidth="1"
                  fill="none"
                />
              </Svg>
            </Animated.View>

            {/* Qibla Needle (stays fixed while compass rotates) */}
            <Animated.View style={[styles.needleContainer, animatedNeedleStyle]}>
              <View style={styles.needleWrapper}>
                {/* Kaaba Icon at the tip */}
                <View style={styles.kaabaIconContainer}>
                  <LinearGradient
                    colors={[AppleColors.islamic.emerald[600], AppleColors.islamic.emerald[400]]}
                    style={styles.kaabaIconGradient}
                  >
                    <MaterialCommunityIcons name="mosque" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                {/* Needle Line */}
                <View style={styles.needle}>
                  <LinearGradient
                    colors={[AppleColors.islamic.emerald[600], AppleColors.islamic.emerald[400]]}
                    style={styles.needleGradient}
                    start={{ x: 0.5, y: 1 }}
                    end={{ x: 0.5, y: 0 }}
                  />
                </View>
              </View>
            </Animated.View>

            {/* Center Dot */}
            <Animated.View style={[styles.centerDot, animatedAccuracyStyle]} />
          </View>

          {/* Kaaba Label */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.kaabaLabel}
          >
            <View style={styles.kaabaLabelContent}>
              <ArabicText variant="title3" weight="semibold" color={AppleColors.islamic.emerald[500]}>
                الكعبة المشرفة
              </ArabicText>
              <Caption2 color={isDark ? '#AAA' : '#666'}>
                The Holy Kaaba • Makkah, Saudi Arabia
              </Caption2>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Calibration Tip */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.calibrationTip}
        >
          <TouchableOpacity
            style={styles.calibrationButton}
            onPress={handleCalibrate}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isDark ? ['#1C1C1E', '#2C2C2E'] : ['#F2F2F7', '#E5E5EA']}
              style={styles.calibrationGradient}
            />
            <View style={styles.calibrationContent}>
              <View style={styles.calibrationIcon}>
                <Ionicons
                  name="sync"
                  size={18}
                  color={AppleColors.islamic.emerald[500]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Subheadline weight="semibold" color={isDark ? '#FFF' : '#000'}>
                  Compass Calibration
                </Subheadline>
                <Caption2 color={isDark ? '#AAA' : '#666'}>
                  Tap here if the compass seems inaccurate
                </Caption2>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#666' : '#C7C7CC'}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: 100, // Adjusted to prevent overlap with header
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: AppleColors.islamic.emerald[500],
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.callout,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: Spacing.md,
  },
  mainInfoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  qiblaInfoContent: {
    alignItems: 'center',
  },
  secondaryInfoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryInfoCard: {
    flex: 1,
    padding: Spacing.md,
  },
  secondaryInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compass: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassBackground: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    ...Elevation.level3,
  },
  compassSvgContainer: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  needleContainer: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleWrapper: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    width: 3,
    height: COMPASS_SIZE * 0.35,
    position: 'absolute',
    top: COMPASS_SIZE * 0.15,
  },
  needleGradient: {
    flex: 1,
    borderRadius: 1.5,
  },
  kaabaIconContainer: {
    position: 'absolute',
    top: COMPASS_SIZE * 0.08,
    zIndex: 10,
  },
  kaabaIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Elevation.level2,
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    position: 'absolute',
  },
  kaabaLabel: {
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  kaabaLabelContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  calibrationTip: {
    marginTop: 'auto',
    marginBottom: Spacing.lg,
  },
  calibrationButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  calibrationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  calibrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingVertical: Spacing.md + 4,
  },
  calibrationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppleColors.islamic.emerald[500] + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
});

export default QiblaScreen;