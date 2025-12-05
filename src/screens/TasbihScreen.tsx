import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  withRepeat,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../components/common/GlassCard';
import { ArabicText } from '../components/common/AnimatedText';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';
import { StatisticsService } from '../services/statisticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  targetCount: number;
}

const dhikrOptions: DhikrOption[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    targetCount: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    targetCount: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    targetCount: 34,
  },
  {
    id: 'laailahaillallah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    targetCount: 100,
  },
];

const TASBIH_STORAGE_KEY = '@tasbih_data';

const TasbihScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrOptions[0]);
  const [todayCount, setTodayCount] = useState(0);
  const [goal, setGoal] = useState(dhikrOptions[0].targetCount);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const scrollY = useSharedValue(0);

  // Animation values
  const buttonScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Progress animation
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(count / goal, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [count, goal]);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData();
  }, [count, totalCount, todayCount, selectedDhikr, lastResetDate]);

  // Check if we need to reset daily count
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
      setTodayCount(0);
      setLastResetDate(today);
    }
  }, []);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(TASBIH_STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        setCount(data.count || 0);
        setTotalCount(data.totalCount || 0);
        setTodayCount(data.todayCount || 0);

        // Reset daily count if it's a new day
        const today = new Date().toDateString();
        if (data.lastResetDate !== today) {
          setTodayCount(0);
          setLastResetDate(today);
        } else {
          setLastResetDate(data.lastResetDate || today);
        }

        // Find and set selected dhikr and its goal
        const savedDhikr = dhikrOptions.find(d => d.id === data.selectedDhikrId);
        if (savedDhikr) {
          setSelectedDhikr(savedDhikr);
          setGoal(savedDhikr.targetCount);
        }
      }
    } catch (error) {
      console.error('Error loading tasbih data:', error);
    }
  };

  const saveData = async () => {
    try {
      const data = {
        count,
        totalCount,
        todayCount,
        goal,
        selectedDhikrId: selectedDhikr.id,
        lastResetDate,
        lastSaved: new Date().toISOString(),
      };
      await AsyncStorage.setItem(TASBIH_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tasbih data:', error);
    }
  };

  const handleTap = async () => {
    const newCount = count + 1;

    // Haptic feedback
    if (newCount % 33 === 0 || newCount === goal) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Button animation
    buttonScale.value = withSequence(
      withSpring(0.85, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    // Count animation
    countScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.5;
    rippleScale.value = withTiming(2.5, { duration: 800, easing: Easing.out(Easing.cubic) });
    rippleOpacity.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Rotation animation
    rotation.value = withSequence(
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withSpring(0, { damping: 10, stiffness: 200 })
    );

    setCount(newCount);
    setTotalCount(totalCount + 1);
    setTodayCount(todayCount + 1);

    // Update statistics service
    try {
      await StatisticsService.incrementTasbih(1);
    } catch (error) {
      console.error('Error updating statistics:', error);
    }

    // Reset after goal is reached
    if (newCount >= goal) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Masha\'Allah! 🎉',
          `You've completed ${goal} ${selectedDhikr.transliteration}!`,
          [{ text: 'Continue', onPress: () => setCount(0) }]
        );
      }, 500);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Counter',
      'Choose what to reset:',
      [
        {
          text: 'Current Session',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCount(0);
            countScale.value = withSequence(
              withSpring(0.8, { damping: 8 }),
              withSpring(1, { damping: 10 })
            );
          }
        },
        {
          text: 'All Counts',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setCount(0);
            setTotalCount(0);
            setTodayCount(0);
            countScale.value = withSequence(
              withSpring(0.8, { damping: 8 }),
              withSpring(1, { damping: 10 })
            );
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDhikrSelect = (dhikr: DhikrOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDhikr(dhikr);
    setGoal(dhikr.targetCount);
    setCount(0); // Reset count when switching dhikr
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const animatedCountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progressValue.value, [0, 1], [0, 1], { extrapolateRight: 'clamp' }) },
    ],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.primary.softGradient as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Digital Tasbih</Text>
            <Text style={styles.subtitle}>Remember Allah</Text>
          </View>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
        </View>

        {/* Counter Circle */}
        <View style={styles.counterSection}>
          <View style={styles.counterContainer}>
            {/* Ripple Effect */}
            <Animated.View style={[styles.ripple, animatedRippleStyle]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>

            {/* Progress Circle */}
            <View style={styles.progressCircle}>
              <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
                <LinearGradient
                  colors={[COLORS.secondary.lightGold, COLORS.secondary.gold] as any}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>

            {/* Inner Counter */}
            <View style={styles.innerCircle}>
              <Animated.View style={animatedCountStyle}>
                <Text style={styles.counterText}>{count}</Text>
              </Animated.View>
              <Text style={styles.counterLabel}>out of {goal}</Text>
            </View>
          </View>

          {/* Milestone Indicators */}
          <View style={styles.milestonesContainer}>
            {(() => {
              // Dynamic milestones based on goal
              const milestones = goal === 100
                ? [25, 50, 75, 100]
                : goal === 34
                ? [11, 22, 34]
                : [11, 22, 33]; // For 33 count dhikr

              return milestones.map((milestone, index) => (
                <Animated.View
                  key={`${selectedDhikr.id}-${milestone}`}
                  entering={FadeIn.delay(200 + index * 100).springify()}
                  style={styles.milestone}
                >
                  <View
                    style={[
                      styles.milestoneDot,
                      count >= milestone && styles.milestoneDotActive,
                    ]}
                  >
                    {count >= milestone && (
                      <Ionicons name="checkmark" size={12} color={COLORS.text.inverse} />
                    )}
                  </View>
                  <Text style={styles.milestoneText}>{milestone}</Text>
                </Animated.View>
              ));
            })()}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ flex: 1 }}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>{todayCount}</Text>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(350).springify()} style={{ flex: 1 }}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{totalCount}</Text>
            </GlassCard>
          </Animated.View>
        </View>

        {/* Selected Dhikr */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <GlassCard style={styles.dhikrCard}>
            <ArabicText fontSize={36} style={styles.dhikrArabic}>
              {selectedDhikr.arabic}
            </ArabicText>
            <Text style={styles.dhikrTransliteration}>
              {selectedDhikr.transliteration}
            </Text>
            <Text style={styles.dhikrTranslation}>
              {selectedDhikr.translation}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Dhikr Options */}
        <View style={styles.dhikrOptions}>
          {dhikrOptions.map((dhikr, index) => (
            <Animated.View
              key={dhikr.id}
              entering={FadeInDown.delay(500 + index * 100).springify()}
            >
              <TouchableOpacity
                onPress={() => handleDhikrSelect(dhikr)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dhikrOption,
                    selectedDhikr.id === dhikr.id && styles.dhikrOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dhikrOptionText,
                      selectedDhikr.id === dhikr.id && styles.dhikrOptionTextActive,
                    ]}
                  >
                    {dhikr.transliteration}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Tap Button */}
        <View style={styles.buttonContainer}>
          <AnimatedTouchable
            style={[styles.tapButton, animatedButtonStyle]}
            onPress={handleTap}
            activeOpacity={1}
          >
            <LinearGradient
              colors={[COLORS.secondary.lightGold, COLORS.secondary.gold] as any}
              style={styles.tapButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.tapButtonText}>TAP</Text>
            </LinearGradient>
          </AnimatedTouchable>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.round,
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  resetButton: {
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.round,
  },
  counterSection: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  counterContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  progressCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    overflow: 'hidden',
  },
  innerCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xl,
  },
  counterText: {
    fontSize: 80,
    fontWeight: TYPOGRAPHY.fontWeight.black as any,
    color: COLORS.primary.main,
  },
  counterLabel: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: SPACING.xl,
  },
  milestone: {
    alignItems: 'center',
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  milestoneDotActive: {
    backgroundColor: COLORS.secondary.gold,
  },
  milestoneText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.secondary.gold,
  },
  dhikrCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dhikrArabic: {
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  dhikrTransliteration: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  dhikrTranslation: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  dhikrOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  dhikrOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: SPACING.xs,
  },
  dhikrOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dhikrOptionText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.text.inverse,
  },
  dhikrOptionTextActive: {
    color: COLORS.primary.main,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  tapButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  tapButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapButtonText: {
    fontSize: TYPOGRAPHY.fontSize.largeTitle,
    fontWeight: TYPOGRAPHY.fontWeight.black as any,
    color: COLORS.text.inverse,
    letterSpacing: 4,
  },
});

export default TasbihScreen;
