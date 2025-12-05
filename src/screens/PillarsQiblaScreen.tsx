/**
 * Ultra-Premium Qibla Screen
 * World-class 3D compass with stunning animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  FadeIn,
  FadeInDown,
  ZoomIn,
  SlideInUp,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, Line, Text as SvgText, G, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import QiblaService from '../services/qiblaService';

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
import { PillarsCard } from '../components/ui/PillarsCard';
import { BackButton } from '../components/ui/BackButton';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH * 0.85, 320);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// Use QiblaService for accurate calculations
const calculateQibla = (latitude: number, longitude: number): number => {
  return QiblaService.calculateQiblaDirection(latitude, longitude);
};

const CompassRing: React.FC<{
  rotation: any; // SharedValue type
  qiblaDirection: number;
  isDark: boolean;
}> = ({ rotation, qiblaDirection, isDark }) => {
  const theme = getPillarsTheme(isDark);

  const animatedProps = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const mainDirections = ['N', 'E', 'S', 'W'];

  return (
    <AnimatedSvg
      width={COMPASS_SIZE}
      height={COMPASS_SIZE}
      style={[styles.compass, animatedProps]}
    >
      <Defs>
        <SvgGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={PillarsColors.gold[400]} stopOpacity="1" />
          <Stop offset="100%" stopColor={PillarsColors.gold[600]} stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={PillarsColors.navy[400]} stopOpacity="1" />
          <Stop offset="100%" stopColor={PillarsColors.navy[600]} stopOpacity="1" />
        </SvgGradient>
      </Defs>

      {/* Outer Ring */}
      <Circle
        cx={COMPASS_SIZE / 2}
        cy={COMPASS_SIZE / 2}
        r={COMPASS_SIZE / 2 - 10}
        stroke={isDark ? PillarsColors.gold[500] : PillarsColors.navy[500]}
        strokeWidth="2"
        fill="none"
        opacity={0.3}
      />

      {/* Inner Decorative Ring */}
      <Circle
        cx={COMPASS_SIZE / 2}
        cy={COMPASS_SIZE / 2}
        r={COMPASS_SIZE / 2 - 30}
        stroke={isDark ? PillarsColors.gold[600] : PillarsColors.navy[600]}
        strokeWidth="1"
        fill="none"
        opacity={0.2}
      />

      {/* Degree Marks */}
      {Array.from({ length: 72 }).map((_, i) => {
        const angle = i * 5;
        const isMain = angle % 90 === 0;
        const isMajor = angle % 30 === 0;
        const innerRadius = COMPASS_SIZE / 2 - (isMain ? 25 : isMajor ? 20 : 15);
        const outerRadius = COMPASS_SIZE / 2 - 10;

        const x1 = COMPASS_SIZE / 2 + innerRadius * Math.cos((angle - 90) * Math.PI / 180);
        const y1 = COMPASS_SIZE / 2 + innerRadius * Math.sin((angle - 90) * Math.PI / 180);
        const x2 = COMPASS_SIZE / 2 + outerRadius * Math.cos((angle - 90) * Math.PI / 180);
        const y2 = COMPASS_SIZE / 2 + outerRadius * Math.sin((angle - 90) * Math.PI / 180);

        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={
              isMain
                ? PillarsColors.gold[500]
                : isMajor
                ? isDark ? PillarsColors.gold[400] : PillarsColors.navy[400]
                : isDark ? PillarsColors.glass.white[30] : PillarsColors.glass.black[20]
            }
            strokeWidth={isMain ? 2 : isMajor ? 1.5 : 1}
            opacity={isMain ? 1 : isMajor ? 0.7 : 0.4}
          />
        );
      })}

      {/* Direction Labels */}
      {directions.map((dir, i) => {
        const angle = i * 45;
        const radius = COMPASS_SIZE / 2 - 45;
        const x = COMPASS_SIZE / 2 + radius * Math.cos((angle - 90) * Math.PI / 180);
        const y = COMPASS_SIZE / 2 + radius * Math.sin((angle - 90) * Math.PI / 180);
        const isMain = mainDirections.includes(dir);

        return (
          <G key={dir}>
            <Circle
              cx={x}
              cy={y}
              r={isMain ? 18 : 14}
              fill={
                dir === 'N'
                  ? PillarsColors.gold[500]
                  : isDark
                  ? PillarsColors.glass.white[10]
                  : PillarsColors.glass.black[10]
              }
            />
            <SvgText
              x={x}
              y={y + 5}
              fontSize={isMain ? 16 : 12}
              fontWeight={isMain ? '700' : '500'}
              fill={
                dir === 'N'
                  ? '#FFFFFF'
                  : isDark
                  ? '#FFFFFF'
                  : PillarsColors.navy[700]
              }
              textAnchor="middle"
            >
              {dir}
            </SvgText>
          </G>
        );
      })}

      {/* Qibla Indicator */}
      <G transform={`rotate(${qiblaDirection}, ${COMPASS_SIZE / 2}, ${COMPASS_SIZE / 2})`}>
        {/* Qibla Line */}
        <Line
          x1={COMPASS_SIZE / 2}
          y1={COMPASS_SIZE / 2}
          x2={COMPASS_SIZE / 2}
          y2={30}
          stroke={PillarsColors.gold[500]}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Kaaba Icon */}
        <G transform={`translate(${COMPASS_SIZE / 2 - 15}, 15)`}>
          <Path
            d="M15 5L5 10L15 15L25 10L15 5Z M5 10V20L15 25L25 20V10 M15 15V25"
            stroke={PillarsColors.gold[500]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </G>
    </AnimatedSvg>
  );
};

const PillarsQiblaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [permission, setPermission] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [distance, setDistance] = useState(0);

  const compassRotation = useSharedValue(0);
  const needleRotation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const magnetometerSubscription = useRef<any>(null);

  // Use QiblaService for accurate distance calculation
  const calculateDistance = (lat1: number, lon1: number): number => {
    return QiblaService.calculateDistanceToKaaba(lat1, lon1);
  };

  useEffect(() => {
    requestPermissions();

    // Glow animation
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );

    // Pulse animation
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    return () => {
      // Clean up compass monitoring
      QiblaService.stopCompassMonitoring();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to calculate Qibla direction.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      setPermission(true);
      await getCurrentLocation();
      // startMagnetometer will be called after location is set
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);

      const qibla = calculateQibla(loc.coords.latitude, loc.coords.longitude);
      setQiblaDirection(qibla);

      const dist = calculateDistance(loc.coords.latitude, loc.coords.longitude);
      setDistance(dist);

      setLoading(false);

      // Start magnetometer after location is obtained
      startMagnetometerWithLocation(loc);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
      setLoading(false);
    }
  };

  const startMagnetometerWithLocation = async (loc: Location.LocationObject) => {
    try {
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Compass not available on this device.');
        return;
      }

      // Use QiblaService for accurate compass monitoring
      QiblaService.startCompassMonitoring(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        (compassData) => {
          // Update heading
          setHeading(compassData.heading);

          // Rotate compass (negative for correct orientation)
          compassRotation.value = withSpring(-compassData.heading, {
            damping: 20,
            stiffness: 100,
          });

          // Calculate needle rotation for Qibla
          // qiblaHeading is the relative direction to Qibla
          needleRotation.value = withSpring(compassData.qiblaHeading, {
            damping: 20,
            stiffness: 100,
          });

          // Calculate accuracy based on alignment
          let acc = 0;
          if (compassData.isAligned) {
            acc = 100;
          } else {
            // Calculate accuracy based on how close we are to alignment
            const alignmentAngle = compassData.qiblaHeading;
            const diff = Math.min(Math.abs(alignmentAngle), Math.abs(360 - alignmentAngle));
            acc = Math.max(0, 100 - (diff / 180) * 100);
          }
          setAccuracy(Math.round(acc));

          // Haptic feedback when aligned
          if (compassData.isAligned) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            if (Platform.OS === 'android') {
              Vibration.vibrate(100);
            }
          }
        }
      );
    } catch (error) {
      console.error('Compass error:', error);
      Alert.alert('Error', 'Failed to start compass. Please try again.');
    }
  };

  const calibrateCompass = async () => {
    setCalibrating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Calibrate Compass',
      'Move your phone in a figure-8 pattern slowly for 5 seconds.',
      [{ text: 'Start', onPress: async () => {
        try {
          await QiblaService.calibrateCompass();
          setCalibrating(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Success', 'Compass calibration complete!');

          // Restart compass monitoring with calibrated values
          if (location) {
            startMagnetometerWithLocation(location);
          }
        } catch (error) {
          setCalibrating(false);
          Alert.alert('Error', 'Calibration failed. Please try again.');
        }
      }}]
    );
  };

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      glowAnimation.value,
      [0, 1],
      [0.3, 0.8],
      Extrapolation.CLAMP
    ),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const accuracyColor = useDerivedValue(() => {
    if (accuracy > 90) return PillarsColors.semantic.success;
    if (accuracy > 70) return PillarsColors.gold[500];
    if (accuracy > 50) return PillarsColors.semantic.warning;
    return PillarsColors.semantic.error;
  });

  const accuracyStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(accuracyColor.value, { duration: 300 }),
  }));

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={PillarsColors.gold[500]} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Initializing Compass...
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.background.primary }]}>
        <MaterialCommunityIcons
          name="compass-off"
          size={64}
          color={theme.text.tertiary}
        />
        <Text style={[styles.errorTitle, { color: theme.text.primary }]}>
          Permission Required
        </Text>
        <Text style={[styles.errorText, { color: theme.text.secondary }]}>
          Please enable location permission to use the Qibla compass.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestPermissions}
        >
          <Text style={styles.retryButtonText}>Enable Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Premium Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950], PillarsColors.navy[950]] as any
              : [PillarsColors.navy[100], PillarsColors.gold[50], PillarsColors.navy[100]] as any
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Animated Background Pattern */}
        <Animated.View style={[styles.backgroundPattern, glowStyle]}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
        </Animated.View>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />

          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Qibla Compass
          </Text>

          <TouchableOpacity
            style={styles.calibrateButton}
            onPress={calibrateCompass}
            disabled={calibrating}
          >
            <MaterialCommunityIcons
              name={calibrating ? 'loading' : 'compass-rose'}
              size={24}
              color={theme.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Location Info Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.locationInfo}
        >
          <LinearGradient
            colors={[
              isDark ? PillarsColors.glass.navy[10] : PillarsColors.glass.white[80],
              isDark ? PillarsColors.glass.navy[10] : PillarsColors.glass.white[60],
            ] as any}
            style={styles.locationGradient}
          >
            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.locationBlur}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={PillarsColors.gold[500]}
                  />
                </View>
                <Text style={[styles.locationTitle, { color: theme.text.primary }]}>
                  Current Location
                </Text>
              </View>
              {location && (
                <>
                  <Text style={[styles.coordinates, { color: theme.text.secondary }]}>
                    {location.coords.latitude.toFixed(4)}°, {location.coords.longitude.toFixed(4)}°
                  </Text>
                  <View style={styles.distanceBadge}>
                    <FontAwesome5
                      name="kaaba"
                      size={14}
                      color={PillarsColors.gold[600]}
                    />
                    <Text style={[styles.distanceValue, { color: PillarsColors.gold[600] }]}>
                      {calculateDistance(location.coords.latitude, location.coords.longitude).toLocaleString()} km away
                    </Text>
                  </View>
                </>
              )}
            </BlurView>
          </LinearGradient>
        </Animated.View>

        {/* Main Compass */}
        <View style={styles.compassContainer}>
          {/* Outer Ring Shadow */}
          <View style={[styles.compassShadow, {
            shadowColor: PillarsColors.gold[500],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }]} />

          {/* Glow Effect */}
          <Animated.View style={[styles.compassGlow, pulseStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                isDark ? PillarsColors.glass.gold[20] : PillarsColors.glass.gold[40],
                'transparent',
              ] as any}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Compass */}
          <CompassRing
            rotation={compassRotation}
            qiblaDirection={qiblaDirection}
            isDark={isDark}
          />

          {/* Center Needle */}
          <Animated.View
            style={[styles.centerNeedle, { transform: [{ rotate: `${needleRotation.value}deg` }] }]}
          >
            <View style={styles.needle}>
              <View style={[styles.needleTop, { backgroundColor: PillarsColors.gold[500] }]} />
              <View style={[styles.needleBottom, { backgroundColor: PillarsColors.navy[500] }]} />
            </View>
          </Animated.View>

          {/* Center Dot */}
          <View style={styles.centerDot}>
            <View style={[styles.centerDotInner, { backgroundColor: PillarsColors.gold[500] }]} />
          </View>
        </View>

        {/* Direction Instruction Card */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.directionContainer}
        >
          <LinearGradient
            colors={[
              accuracy > 90
                ? 'rgba(76, 175, 80, 0.1)'
                : isDark ? PillarsColors.glass.gold[10] : PillarsColors.glass.gold[10],
              accuracy > 90
                ? 'rgba(76, 175, 80, 0.05)'
                : isDark ? PillarsColors.glass.gold[10] : PillarsColors.glass.gold[10],
            ] as any}
            style={styles.directionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.directionText, {
              color: accuracy > 90 ? PillarsColors.semantic.success : PillarsColors.gold[600]
            }]}>
              {QiblaService.getPrayerDirectionText((qiblaDirection - heading + 360) % 360)}
            </Text>
            <View style={styles.directionAngle}>
              <View style={[styles.angleBadge, {
                backgroundColor: accuracy > 90
                  ? 'rgba(76, 175, 80, 0.2)'
                  : PillarsColors.glass.gold[20]
              }]}>
                <Text style={[styles.angleText, {
                  color: accuracy > 90 ? PillarsColors.semantic.success : PillarsColors.gold[700]
                }]}>
                  {Math.round((qiblaDirection - heading + 360) % 360)}°
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Accuracy Indicator */}
        <Animated.View
          entering={SlideInUp.delay(200).springify()}
          style={styles.accuracyContainer}
        >
          <View style={styles.accuracyHeader}>
            <Text style={[styles.accuracyLabel, { color: theme.text.secondary }]}>
              Alignment Accuracy
            </Text>
            <View style={[styles.accuracyBadge, {
              backgroundColor: accuracy > 90
                ? 'rgba(76, 175, 80, 0.2)'
                : accuracy > 70
                ? PillarsColors.glass.gold[20]
                : 'rgba(244, 67, 54, 0.2)'
            }]}>
              <Text style={[styles.accuracyValue, {
                color: accuracy > 90
                  ? PillarsColors.semantic.success
                  : accuracy > 70
                  ? PillarsColors.gold[600]
                  : PillarsColors.semantic.error
              }]}>
                {accuracy}%
              </Text>
            </View>
          </View>
          <View style={styles.accuracyBarContainer}>
            <View style={[styles.accuracyBarBg, {
              backgroundColor: isDark ? PillarsColors.glass.black[20] : PillarsColors.glass.black[10]
            }]}>
              <Animated.View
                style={[
                  styles.accuracyBarFill,
                  accuracyStyle,
                  { width: `${accuracy}%` },
                ]}
              >
                <LinearGradient
                  colors={[
                    accuracy > 90
                      ? PillarsColors.semantic.success
                      : PillarsColors.gold[400],
                    accuracy > 90
                      ? '#2E7D32'
                      : PillarsColors.gold[600],
                  ] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
              {/* Accuracy Markers */}
              <View style={styles.accuracyMarkers}>
                <View style={[styles.accuracyMarker, { left: '25%' }]} />
                <View style={[styles.accuracyMarker, { left: '50%' }]} />
                <View style={[styles.accuracyMarker, { left: '75%' }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Compass Details Toggle */}
        <TouchableOpacity
          style={[styles.detailsButton, { backgroundColor: theme.background.card }]}
          onPress={() => setShowDetails(!showDetails)}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={showDetails ? PillarsColors.gold[500] : theme.text.tertiary}
          />
          <Text style={[styles.detailsButtonText, { color: theme.text.secondary }]}>
            {showDetails ? 'Hide' : 'Show'} Compass Details
          </Text>
        </TouchableOpacity>

        {/* Compass Information Panel */}
        {showDetails && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.detailsPanel, { backgroundColor: theme.background.card }]}
          >
            <Text style={[styles.detailsTitle, { color: PillarsColors.gold[500] }]}>
              Compass Information
            </Text>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Current Location:
              </Text>
              <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
                {location ? `${location.coords.latitude.toFixed(6)}°, ${location.coords.longitude.toFixed(6)}°` : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Qibla Direction (True):
              </Text>
              <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
                {qiblaDirection.toFixed(2)}°
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Current Heading:
              </Text>
              <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
                {heading.toFixed(2)}°
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Relative Qibla:
              </Text>
              <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
                {((qiblaDirection - heading + 360) % 360).toFixed(2)}°
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Distance to Kaaba:
              </Text>
              <Text style={[styles.detailsValue, { color: theme.text.primary }]}>
                {distance} km
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={[styles.detailsLabel, { color: theme.text.secondary }]}>
                Direction Instruction:
              </Text>
              <Text style={[styles.detailsValue, { color: PillarsColors.gold[500] }]}>
                {QiblaService.getPrayerDirectionText((qiblaDirection - heading + 360) % 360)}
              </Text>
            </View>
            <Text style={[styles.debugNote, { color: theme.text.tertiary }]}>
              Note: Qibla calculations use the great circle path method for maximum accuracy.
            </Text>
          </Animated.View>
        )}

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <PillarsCard
            variant="gradient"
            gradient={
              isDark
                ? [PillarsColors.navy[900], PillarsColors.black[900]] as any
                : [PillarsColors.gold[50], PillarsColors.navy[50]] as any
            }
            style={styles.infoCard}
            padding={PillarsSpacing.md}
          >
            <View style={styles.infoContent}>
              <MaterialCommunityIcons
                name="compass-outline"
                size={24}
                color={PillarsColors.gold[500]}
              />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
                  Direction
                </Text>
                <Text style={[styles.infoValue, { color: PillarsColors.gold[500] }]}>
                  {Math.round(qiblaDirection)}°
                </Text>
              </View>
            </View>
          </PillarsCard>

          <PillarsCard
            variant="gradient"
            gradient={
              isDark
                ? [PillarsColors.navy[900], PillarsColors.black[900]] as any
                : [PillarsColors.navy[50], PillarsColors.gold[50]] as any
            }
            style={styles.infoCard}
            padding={PillarsSpacing.md}
          >
            <View style={styles.infoContent}>
              <MaterialCommunityIcons
                name="rotate-3d-variant"
                size={24}
                color={PillarsColors.navy[500]}
              />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
                  Heading
                </Text>
                <Text style={[styles.infoValue, { color: PillarsColors.navy[500] }]}>
                  {Math.round(heading)}°
                </Text>
              </View>
            </View>
          </PillarsCard>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: PillarsSpacing.md,
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: PillarsLayout.screenPadding * 2,
  },
  errorTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
    marginTop: PillarsSpacing.lg,
    marginBottom: PillarsSpacing.sm,
  },
  errorText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: PillarsSpacing.xl,
  },
  retryButton: {
    paddingVertical: PillarsSpacing.md,
    paddingHorizontal: PillarsSpacing.xl,
    backgroundColor: PillarsColors.gold[500],
    borderRadius: PillarsBorderRadius.full,
  },
  retryButtonText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  patternCircle1: {
    position: 'absolute',
    top: 100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PillarsColors.gold[500],
    opacity: 0.05,
  },
  patternCircle2: {
    position: 'absolute',
    bottom: 150,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: PillarsColors.navy[500],
    opacity: 0.05,
  },
  patternCircle3: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: PillarsColors.gold[400],
    opacity: 0.03,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PillarsLayout.screenPadding,
    paddingVertical: PillarsSpacing.lg,
  },
  headerTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
  },
  calibrateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PillarsColors.glass.black[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    paddingHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.xl,
  },
  locationCard: {
    backgroundColor: PillarsColors.glass.white[5],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.xs,
  },
  locationText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordinates: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '500',
    marginTop: PillarsSpacing.xs,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: PillarsSpacing.sm,
    paddingTop: PillarsSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: PillarsColors.glass.black[10],
  },
  distanceLabel: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
  },
  distanceValue: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
  },
  locationGradient: {
    borderRadius: PillarsBorderRadius.xl,
    overflow: 'hidden',
    ...PillarsShadows.sm,
  },
  locationBlur: {
    padding: PillarsSpacing.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
    marginBottom: PillarsSpacing.md,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PillarsColors.glass.gold[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
    backgroundColor: PillarsColors.glass.gold[10],
    paddingHorizontal: PillarsSpacing.md,
    paddingVertical: PillarsSpacing.sm,
    borderRadius: PillarsBorderRadius.full,
    alignSelf: 'flex-start',
  },
  compassContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassShadow: {
    position: 'absolute',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: 'transparent',
  },
  compassGlow: {
    position: 'absolute',
    width: COMPASS_SIZE + 60,
    height: COMPASS_SIZE + 60,
    borderRadius: (COMPASS_SIZE + 60) / 2,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (COMPASS_SIZE + 60) / 2,
  },
  compass: {
    position: 'relative',
  },
  centerNeedle: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    width: 4,
    height: 60,
    position: 'relative',
  },
  needleTop: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 30,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  needleBottom: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 30,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  centerDot: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PillarsColors.glass.black[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  directionContainer: {
    paddingHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.xl,
  },
  directionGradient: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.xl,
    alignItems: 'center',
    ...PillarsShadows.sm,
  },
  directionText: {
    fontSize: PillarsTypography.fontSize.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: PillarsSpacing.sm,
    letterSpacing: 0.5,
  },
  directionAngle: {
    marginTop: PillarsSpacing.xs,
  },
  angleBadge: {
    paddingHorizontal: PillarsSpacing.lg,
    paddingVertical: PillarsSpacing.sm,
    borderRadius: PillarsBorderRadius.full,
  },
  angleText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accuracyContainer: {
    paddingHorizontal: PillarsLayout.screenPadding * 2,
    marginBottom: PillarsSpacing.xl,
  },
  accuracyLabel: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: PillarsSpacing.sm,
  },
  accuracyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  accuracyBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  accuracyValue: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  accuracyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PillarsSpacing.md,
  },
  accuracyBadge: {
    paddingHorizontal: PillarsSpacing.md,
    paddingVertical: PillarsSpacing.xs,
    borderRadius: PillarsBorderRadius.full,
  },
  accuracyBarContainer: {
    width: '100%',
  },
  accuracyMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  accuracyMarker: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: PillarsColors.glass.white[20],
  },
  infoCards: {
    flexDirection: 'row',
    paddingHorizontal: PillarsLayout.screenPadding,
    gap: PillarsSpacing.md,
    marginBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  infoCard: {
    flex: 1,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PillarsSpacing.xs,
    marginHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.md,
    paddingVertical: PillarsSpacing.sm,
    paddingHorizontal: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.sm,
    ...PillarsShadows.sm,
  },
  detailsButtonText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
  },
  detailsPanel: {
    marginHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.xl,
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    ...PillarsShadows.md,
  },
  detailsTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: PillarsSpacing.sm,
    paddingVertical: PillarsSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: PillarsColors.glass.black[10],
  },
  detailsLabel: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  detailsValue: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  debugNote: {
    fontSize: PillarsTypography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: PillarsSpacing.sm,
    textAlign: 'center',
    lineHeight: PillarsTypography.fontSize.xs * 1.5,
  },
});

export default PillarsQiblaScreen;