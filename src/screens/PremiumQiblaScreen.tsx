import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, G, Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

// Components
import { PremiumHeader } from '../components/common/PremiumHeader';
import { PremiumCard } from '../components/common/PremiumCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { IslamicPattern } from '../components/common/IslamicPattern';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Theme
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COMPASS_SIZE = SCREEN_WIDTH * 0.75;
const KAABA_DIRECTION = 45; // Mock direction in degrees

interface PremiumQiblaScreenProps {
  navigation: any;
}

const PremiumQiblaScreen: React.FC<PremiumQiblaScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [qiblaDirection, setQiblaDirection] = useState(KAABA_DIRECTION);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState('6,732 km');
  const [accuracy, setAccuracy] = useState<'high' | 'medium' | 'low'>('high');

  // Animations
  const compassRotation = useSharedValue(0);
  const needleRotation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0.3);
  const calibrationProgress = useSharedValue(0);

  useEffect(() => {
    initializeQibla();

    // Start pulse animation
    pulseAnimation.value = withRepeat(
      withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Glow animation
    glowAnimation.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const initializeQibla = async () => {
    try {
      setLoading(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to find Qibla direction.');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      // Calculate Qibla direction (simplified)
      // In production, use proper calculation
      setQiblaDirection(KAABA_DIRECTION);

      // Simulate compass heading updates
      startCompassSimulation();

      setLoading(false);
    } catch (error) {
      console.error('Error initializing Qibla:', error);
      Alert.alert('Error', 'Failed to initialize Qibla finder. Please try again.');
      setLoading(false);
    }
  };

  const startCompassSimulation = () => {
    // In production, use actual magnetometer/compass
    let angle = 0;
    const interval = setInterval(() => {
      angle = (angle + 1) % 360;
      setCurrentHeading(angle);

      // Smooth rotation
      compassRotation.value = withSpring(-angle, {
        damping: 20,
        stiffness: 100,
      });

      // Update needle to always point to Qibla
      const relativeAngle = qiblaDirection - angle;
      needleRotation.value = withSpring(relativeAngle, {
        damping: 15,
        stiffness: 80,
      });
    }, 100);

    return () => clearInterval(interval);
  };

  const handleCalibrate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCalibrating(true);

    // Animate calibration progress
    calibrationProgress.value = 0;
    calibrationProgress.value = withTiming(1, {
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
    });

    // Simulate calibration
    setTimeout(() => {
      setCalibrating(false);
      setAccuracy('high');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Calibration Complete', 'Compass has been calibrated successfully!');
    }, 3000);
  };

  const handleARMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'AR Mode',
      'AR Qibla Finder uses your camera to show Qibla direction in real-world view. This feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const compassRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const needleRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${needleRotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
  }));

  const calibrationProgressStyle = useAnimatedStyle(() => ({
    width: `${calibrationProgress.value * 100}%`,
  }));

  const CompassRose = () => (
    <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
      <Defs>
        <RadialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={COLORS.primary.light} stopOpacity="0.2" />
          <Stop offset="100%" stopColor={COLORS.primary.main} stopOpacity="0.05" />
        </RadialGradient>
      </Defs>

      {/* Background Circle */}
      <Circle
        cx={COMPASS_SIZE / 2}
        cy={COMPASS_SIZE / 2}
        r={COMPASS_SIZE / 2 - 10}
        fill="url(#compassGradient)"
        stroke={COLORS.primary.main}
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Degree Markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => {
        const isCardinal = degree % 90 === 0;
        const angle = (degree - 90) * (Math.PI / 180);
        const outerRadius = COMPASS_SIZE / 2 - 15;
        const innerRadius = isCardinal ? outerRadius - 20 : outerRadius - 10;

        return (
          <G key={degree}>
            <Line
              x1={COMPASS_SIZE / 2 + Math.cos(angle) * innerRadius}
              y1={COMPASS_SIZE / 2 + Math.sin(angle) * innerRadius}
              x2={COMPASS_SIZE / 2 + Math.cos(angle) * outerRadius}
              y2={COMPASS_SIZE / 2 + Math.sin(angle) * outerRadius}
              stroke={isCardinal ? COLORS.primary.main : COLORS.primary.light}
              strokeWidth={isCardinal ? '3' : '1'}
            />
          </G>
        );
      })}

      {/* Cardinal Direction Labels */}
      {['N', 'E', 'S', 'W'].map((dir, index) => {
        const angle = (index * 90 - 90) * (Math.PI / 180);
        const labelRadius = COMPASS_SIZE / 2 - 40;
        const x = COMPASS_SIZE / 2 + Math.cos(angle) * labelRadius;
        const y = COMPASS_SIZE / 2 + Math.sin(angle) * labelRadius;

        return (
          <SvgText
            key={dir}
            x={x}
            y={y + 5}
            fontSize="18"
            fontWeight="bold"
            fill={COLORS.primary.main}
            textAnchor="middle"
          >
            {dir}
          </SvgText>
        );
      })}

      {/* Center Circle */}
      <Circle
        cx={COMPASS_SIZE / 2}
        cy={COMPASS_SIZE / 2}
        r={15}
        fill={COLORS.background.primary}
        stroke={COLORS.primary.main}
        strokeWidth="2"
      />
    </Svg>
  );

  const QiblaNeedle = () => {
    const needleLength = COMPASS_SIZE / 2 - 50;
    return (
      <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} style={styles.needleContainer}>
        <Defs>
          <SvgLinearGradient id="needleGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={COLORS.secondary.lightGold} stopOpacity="1" />
            <Stop offset="1" stopColor={COLORS.secondary.darkGold} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Qibla Direction Needle */}
        <Path
          d={`M ${COMPASS_SIZE / 2} ${COMPASS_SIZE / 2 - needleLength}
              L ${COMPASS_SIZE / 2 + 12} ${COMPASS_SIZE / 2 - 20}
              L ${COMPASS_SIZE / 2} ${COMPASS_SIZE / 2 - 30}
              L ${COMPASS_SIZE / 2 - 12} ${COMPASS_SIZE / 2 - 20}
              Z`}
          fill="url(#needleGradient)"
          stroke={COLORS.secondary.darkGold}
          strokeWidth="1"
        />

        {/* Back Needle */}
        <Path
          d={`M ${COMPASS_SIZE / 2} ${COMPASS_SIZE / 2 + 20}
              L ${COMPASS_SIZE / 2 + 8} ${COMPASS_SIZE / 2}
              L ${COMPASS_SIZE / 2 - 8} ${COMPASS_SIZE / 2}
              Z`}
          fill={COLORS.neutral.mediumGray}
        />

        {/* Center Dot */}
        <Circle
          cx={COMPASS_SIZE / 2}
          cy={COMPASS_SIZE / 2}
          r={8}
          fill={COLORS.secondary.gold}
          stroke={COLORS.background.primary}
          strokeWidth="2"
        />
      </Svg>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>Finding Qibla direction...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.primary.main + '10', COLORS.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <IslamicPattern type="star" size={SCREEN_WIDTH} color={COLORS.primary.main} opacity={0.05} />
      </View>

      <PremiumHeader
        title="Qibla Finder"
        subtitle="Find the direction of Kaaba"
        showBackButton
        navigation={navigation}
        rightIcon="information-circle-outline"
        onRightPress={() => {
          Alert.alert(
            'Qibla Finder',
            'Point your device flat and align the golden needle with North (N) to find the Qibla direction.',
            [{ text: 'Got it' }]
          );
        }}
      />

      <SafeAreaView style={styles.content} edges={['bottom']}>
        {/* Compass Container */}
        <View style={styles.compassContainer}>
          {/* Glow Effect */}
          <Animated.View style={[styles.compassGlow, glowStyle]}>
            <LinearGradient
              colors={[COLORS.secondary.gold + '30', COLORS.secondary.gold + '10', 'transparent']}
              style={styles.glowGradient}
            />
          </Animated.View>

          {/* Animated Compass */}
          <Animated.View style={[styles.compass, compassRotationStyle]}>
            <CompassRose />
          </Animated.View>

          {/* Qibla Needle */}
          <Animated.View style={[styles.needle, needleRotationStyle, pulseStyle]}>
            <QiblaNeedle />
          </Animated.View>

          {/* Direction Indicator */}
          <View style={styles.directionIndicator}>
            <Text style={styles.directionDegrees}>{Math.round(currentHeading)}°</Text>
            <Text style={styles.directionLabel}>Current Heading</Text>
          </View>
        </View>

        {/* Qibla Info Card */}
        <PremiumCard style={styles.infoCard} gradient={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="compass" size={32} color={COLORS.primary.main} />
              <Text style={styles.infoLabel}>Qibla Direction</Text>
              <Text style={styles.infoValue}>{qiblaDirection}°</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={32} color={COLORS.accent.coral} />
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{distance}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Ionicons
                name={accuracy === 'high' ? 'checkmark-circle' : 'warning'}
                size={32}
                color={accuracy === 'high' ? COLORS.semantic.success : COLORS.semantic.warning}
              />
              <Text style={styles.infoLabel}>Accuracy</Text>
              <Text style={styles.infoValue}>{accuracy.toUpperCase()}</Text>
            </View>
          </View>
        </PremiumCard>

        {/* Calibration Card */}
        {calibrating && (
          <PremiumCard style={styles.calibrationCard} gradient={[COLORS.accent.sky + '20', COLORS.accent.sky + '10']}>
            <View style={styles.calibrationContent}>
              <LoadingSpinner />
              <Text style={styles.calibrationText}>Calibrating compass...</Text>
              <View style={styles.calibrationProgress}>
                <Animated.View style={[styles.calibrationProgressFill, calibrationProgressStyle]}>
                  <LinearGradient
                    colors={[COLORS.accent.sky, COLORS.accent.skyLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                </Animated.View>
              </View>
              <Text style={styles.calibrationInstructions}>
                Move your device in a figure-8 pattern
              </Text>
            </View>
          </PremiumCard>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AnimatedButton
            title="Calibrate"
            variant="secondary"
            size="medium"
            icon="sync-outline"
            onPress={handleCalibrate}
            style={styles.actionButton}
            disabled={calibrating}
          />
          <AnimatedButton
            title="AR Mode"
            variant="premium"
            size="medium"
            icon="camera-outline"
            onPress={handleARMode}
            style={styles.actionButton}
            glowEffect
          />
        </View>

        {/* Location Info */}
        {location && (
          <PremiumCard style={styles.locationCard}>
            <View style={styles.locationContent}>
              <Ionicons name="navigate-circle" size={24} color={COLORS.primary.main} />
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>Your Location</Text>
                <Text style={styles.locationValue}>
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </Text>
              </View>
            </View>
          </PremiumCard>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: COLORS.text.secondary,
  },
  backgroundPattern: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xxl,
    height: COMPASS_SIZE + 100,
  },
  compassGlow: {
    position: 'absolute',
    width: COMPASS_SIZE + 100,
    height: COMPASS_SIZE + 100,
    borderRadius: (COMPASS_SIZE + 100) / 2,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (COMPASS_SIZE + 100) / 2,
  },
  compass: {
    position: 'absolute',
  },
  needle: {
    position: 'absolute',
  },
  needleContainer: {
    position: 'absolute',
  },
  directionIndicator: {
    position: 'absolute',
    top: -50,
    alignItems: 'center',
  },
  directionDegrees: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary.main,
  },
  directionLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  infoCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.neutral.gray,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    marginTop: 4,
  },
  calibrationCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  calibrationContent: {
    alignItems: 'center',
  },
  calibrationText: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  calibrationProgress: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: RADIUS.sm,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  calibrationProgressFill: {
    height: '100%',
  },
  calibrationInstructions: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
  },
  locationCard: {
    padding: SPACING.md,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  locationLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
  },
  locationValue: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.text.primary,
    marginTop: 2,
  },
});

export default PremiumQiblaScreen;
