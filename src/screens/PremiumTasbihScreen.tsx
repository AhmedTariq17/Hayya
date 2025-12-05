import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  FadeInDown,
  ZoomIn,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Components
import { PremiumHeader } from '../components/common/PremiumHeader';
import { PremiumCard } from '../components/common/PremiumCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { IslamicPattern } from '../components/common/IslamicPattern';

// Theme
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COUNTER_SIZE = SCREEN_WIDTH * 0.6;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface PremiumTasbihScreenProps {
  navigation: any;
}

interface DhikrOption {
  id: string;
  text: string;
  translation: string;
  target: number;
  color: string;
}

interface Statistics {
  totalCount: number;
  todayCount: number;
  streak: number;
  lastUpdated: string;
}

const DHIKR_OPTIONS: DhikrOption[] = [
  {
    id: 'subhanallah',
    text: 'سُبْحَانَ اللَّهِ',
    translation: 'Glory be to Allah',
    target: 33,
    color: COLORS.primary.main,
  },
  {
    id: 'alhamdulillah',
    text: 'الْحَمْدُ لِلَّهِ',
    translation: 'Praise be to Allah',
    target: 33,
    color: COLORS.secondary.gold,
  },
  {
    id: 'allahuakbar',
    text: 'اللَّهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    target: 34,
    color: COLORS.accent.teal,
  },
  {
    id: 'lailahaillallah',
    text: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    translation: 'There is no god but Allah',
    target: 100,
    color: COLORS.accent.purple,
  },
  {
    id: 'astaghfirullah',
    text: 'أَسْتَغْفِرُ اللَّهَ',
    translation: 'I seek forgiveness from Allah',
    target: 100,
    color: COLORS.accent.coral,
  },
];

const PremiumTasbihScreen: React.FC<PremiumTasbihScreenProps> = ({ navigation }) => {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrOption>(DHIKR_OPTIONS[0]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalCount: 0,
    todayCount: 0,
    streak: 0,
    lastUpdated: new Date().toDateString(),
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);

  // Animations
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const progressRotation = useSharedValue(0);
  const numberScale = useSharedValue(1);
  const particleAnimations = Array.from({ length: 6 }, () => ({
    translateY: useSharedValue(0),
    opacity: useSharedValue(0),
    scale: useSharedValue(1),
  }));

  useEffect(() => {
    loadStatistics();
    loadSettings();
  }, []);

  useEffect(() => {
    // Animate progress circle
    const progress = count / selectedDhikr.target;
    progressRotation.value = withTiming(progress * 360, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [count, selectedDhikr]);

  const loadStatistics = async () => {
    try {
      const saved = await AsyncStorage.getItem('tasbih_stats');
      if (saved) {
        const stats = JSON.parse(saved);
        const today = new Date().toDateString();

        if (stats.lastUpdated !== today) {
          // New day, reset today count
          stats.todayCount = 0;
          stats.lastUpdated = today;
        }

        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const vibration = await AsyncStorage.getItem('tasbih_vibration');
      const sound = await AsyncStorage.getItem('tasbih_sound');

      if (vibration !== null) setVibrationEnabled(JSON.parse(vibration));
      if (sound !== null) setSoundEnabled(JSON.parse(sound));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveStatistics = async (newStats: Statistics) => {
    try {
      await AsyncStorage.setItem('tasbih_stats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  };

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);

    // Haptic feedback
    if (vibrationEnabled) {
      if (newCount === selectedDhikr.target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (newCount % 10 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Animations
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    numberScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.8;
    rippleScale.value = withTiming(1.5, { duration: 600 });
    rippleOpacity.value = withTiming(0, { duration: 600 });

    // Particle effect on milestones
    if (newCount % 10 === 0) {
      triggerParticleEffect();
    }

    // Check if target reached
    if (newCount === selectedDhikr.target) {
      handleTargetReached();
    }

    // Update statistics
    const today = new Date().toDateString();
    const newStats = {
      ...statistics,
      totalCount: statistics.totalCount + 1,
      todayCount: statistics.todayCount + 1,
      lastUpdated: today,
    };
    setStatistics(newStats);
    saveStatistics(newStats);
  };

  const triggerParticleEffect = () => {
    particleAnimations.forEach((particle, index) => {
      const angle = (index * 60) * (Math.PI / 180);
      const distance = 80;

      particle.translateY.value = 0;
      particle.opacity.value = 1;
      particle.scale.value = 1;

      particle.translateY.value = withTiming(-distance, { duration: 800 });
      particle.opacity.value = withTiming(0, { duration: 800 });
      particle.scale.value = withSequence(
        withTiming(1.5, { duration: 200 }),
        withTiming(0, { duration: 600 })
      );
    });
  };

  const handleTargetReached = () => {
    Alert.alert(
      'Target Reached!',
      `Congratulations! You have completed ${selectedDhikr.target} ${selectedDhikr.translation}`,
      [
        { text: 'Continue', onPress: () => {} },
        { text: 'Reset', onPress: handleReset, style: 'destructive' },
      ]
    );
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCount(0);
    progressRotation.value = withTiming(0, { duration: 300 });

    scale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 8 })
    );
  };

  const handleDhikrSelect = (dhikr: DhikrOption) => {
    Haptics.selectionAsync();
    setSelectedDhikr(dhikr);
    setCount(0);
    progressRotation.value = 0;
  };

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const numberScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => {
    const rotation = progressRotation.value;
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const CircularProgress = () => {
    const radius = COUNTER_SIZE / 2 - 20;
    const circumference = 2 * Math.PI * radius;
    const progress = count / selectedDhikr.target;

    return (
      <Svg width={COUNTER_SIZE} height={COUNTER_SIZE} style={styles.progressSvg}>
        {/* Background Circle */}
        <Circle
          cx={COUNTER_SIZE / 2}
          cy={COUNTER_SIZE / 2}
          r={radius}
          stroke={COLORS.neutral.lightGray}
          strokeWidth="12"
          fill="none"
        />

        {/* Progress Circle */}
        <AnimatedCircle
          cx={COUNTER_SIZE / 2}
          cy={COUNTER_SIZE / 2}
          r={radius}
          stroke={selectedDhikr.color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${COUNTER_SIZE / 2} ${COUNTER_SIZE / 2})`}
        />
      </Svg>
    );
  };

  const DhikrCard = ({ dhikr, index }: { dhikr: DhikrOption; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <PremiumCard
        style={selectedDhikr.id === dhikr.id ? [styles.dhikrCard, styles.selectedDhikrCard] : styles.dhikrCard}
        gradient={[`${dhikr.color}15`, `${dhikr.color}08`]}
        scaleFeedback
        haptic
        onPress={() => handleDhikrSelect(dhikr)}
        borderGradient={selectedDhikr.id === dhikr.id}
      >
        <View style={[styles.dhikrIndicator, { backgroundColor: dhikr.color }]} />
        <View style={styles.dhikrContent}>
          <Text style={styles.dhikrArabic}>{dhikr.text}</Text>
          <Text style={styles.dhikrTranslation}>{dhikr.translation}</Text>
          <Text style={styles.dhikrTarget}>Target: {dhikr.target}</Text>
        </View>
        {selectedDhikr.id === dhikr.id && (
          <Ionicons name="checkmark-circle" size={24} color={dhikr.color} />
        )}
      </PremiumCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <IslamicPattern
          type="arabesque"
          size={SCREEN_WIDTH * 1.5}
          color={selectedDhikr.color}
          opacity={0.05}
        />
      </View>

      <PremiumHeader
        title="Digital Tasbih"
        subtitle="Keep track of your dhikr"
        showBackButton
        navigation={navigation}
        rightIcon="stats-chart"
        onRightPress={() => setShowStats(!showStats)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Card */}
        {showStats && (
          <Animated.View entering={FadeInDown.springify()}>
            <PremiumCard style={styles.statsCard} glowEffect>
              <LinearGradient
                colors={[COLORS.accent.purple + '10', COLORS.accent.purpleLight + '05']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.statsTitle}>Your Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.totalCount.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Count</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.todayCount}</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{statistics.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Counter Container */}
        <Animated.View entering={ZoomIn.springify()} style={styles.counterContainer}>
          <View style={styles.counterWrapper}>
            {/* Ripple Effect */}
            <Animated.View style={[styles.ripple, rippleStyle]}>
              <LinearGradient
                colors={[selectedDhikr.color + '40', selectedDhikr.color + '10', 'transparent']}
                style={styles.rippleGradient}
              />
            </Animated.View>

            {/* Progress Circle */}
            <View style={styles.progressCircle}>
              <CircularProgress />
            </View>

            {/* Counter Button */}
            <Animated.View style={[styles.counterButton, scaleStyle]}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleIncrement}
                style={styles.counterTouchable}
              >
                <LinearGradient
                  colors={[selectedDhikr.color, selectedDhikr.color + 'DD']}
                  style={styles.counterGradient}
                >
                  <View style={styles.counterInner}>
                    <Animated.Text style={[styles.counterNumber, numberScaleStyle]}>
                      {count}
                    </Animated.Text>
                    <Text style={styles.counterTarget}>/ {selectedDhikr.target}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Particle Effects */}
            {particleAnimations.map((particle, index) => {
              const angle = (index * 60) * (Math.PI / 180);
              const particleStyle = useAnimatedStyle(() => ({
                position: 'absolute',
                transform: [
                  { translateX: Math.cos(angle) * particle.translateY.value },
                  { translateY: Math.sin(angle) * particle.translateY.value },
                  { scale: particle.scale.value },
                ],
                opacity: particle.opacity.value,
              }));

              return (
                <Animated.View key={index} style={particleStyle}>
                  <MaterialCommunityIcons name="star" size={20} color={selectedDhikr.color} />
                </Animated.View>
              );
            })}
          </View>

          {/* Current Dhikr Display */}
          <PremiumCard style={styles.currentDhikrCard} elevation="lg">
            <Text style={styles.currentDhikrArabic}>{selectedDhikr.text}</Text>
            <Text style={styles.currentDhikrTranslation}>{selectedDhikr.translation}</Text>
          </PremiumCard>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AnimatedButton
            title="Reset"
            variant="secondary"
            size="medium"
            icon="refresh"
            onPress={() => {
              Alert.alert('Reset Counter', 'Are you sure you want to reset the counter?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', onPress: handleReset, style: 'destructive' },
              ]);
            }}
            style={styles.actionButton}
          />
          <AnimatedButton
            title={vibrationEnabled ? 'Vibration On' : 'Vibration Off'}
            variant={vibrationEnabled ? 'success' : 'outline'}
            size="medium"
            icon={vibrationEnabled ? 'phone-portrait' : 'phone-portrait-outline'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const newValue = !vibrationEnabled;
              setVibrationEnabled(newValue);
              AsyncStorage.setItem('tasbih_vibration', JSON.stringify(newValue));
            }}
            style={styles.actionButton}
          />
        </View>

        {/* Dhikr Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dhikr</Text>
          {DHIKR_OPTIONS.map((dhikr, index) => (
            <DhikrCard key={dhikr.id} dhikr={dhikr} index={index} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: -SCREEN_WIDTH * 0.25,
    opacity: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statsCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.accent.purple,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  counterContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xxl,
  },
  counterWrapper: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  ripple: {
    position: 'absolute',
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
  },
  rippleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: COUNTER_SIZE / 2,
  },
  progressCircle: {
    position: 'absolute',
  },
  progressSvg: {
    transform: [{ rotate: '-90deg' }],
  },
  counterButton: {
    width: COUNTER_SIZE - 60,
    height: COUNTER_SIZE - 60,
    borderRadius: (COUNTER_SIZE - 60) / 2,
    ...SHADOWS.premium,
  },
  counterTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: (COUNTER_SIZE - 60) / 2,
  },
  counterGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (COUNTER_SIZE - 60) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterInner: {
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 72,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
  },
  counterTarget: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  currentDhikrCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
  },
  currentDhikrArabic: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  currentDhikrTranslation: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  dhikrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  selectedDhikrCard: {
    borderWidth: 2,
  },
  dhikrIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
  },
  dhikrContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  dhikrArabic: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  dhikrTranslation: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  dhikrTarget: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.tertiary,
  },
});

export default PremiumTasbihScreen;
