/**
 * Tasbih Counter Screen V2
 * Enhanced with better tap functionality and beautiful UI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
  Vibration,
  Platform,
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
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';

// Components
import { PremiumCard } from '../components/premium/PremiumCard';
import { PremiumHeader } from '../components/premium/PremiumHeader';
import {
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Caption1,
  Caption2,
  ArabicText,
} from '../components/premium/PremiumText';

// Theme
import { useTheme } from '../contexts/ThemeContext';
import {
  AppleColors,
  Spacing,
  BorderRadius,
  Elevation,
  Typography,
} from '../theme/appleDesignSystem';
import { getTheme } from '../theme/themeConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  color: string;
}

const dhikrOptions: DhikrOption[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    color: '#667eea',
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    color: '#f093fb',
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    color: '#4facfe',
  },
  {
    id: 'laailaha',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    color: '#43e97b',
  },
];

const STORAGE_KEY = '@tasbih_counter_v2';

const TasbihScreenV2: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrOptions[0]);
  const [goal] = useState(99);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

  // Animation values
  const buttonScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  // Load saved data
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever count changes
  useEffect(() => {
    saveData();
    // Update progress animation
    progressAnimation.value = withTiming(count / goal, {
      duration: 500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [count, totalCount]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        setCount(data.count || 0);
        setTotalCount(data.totalCount || 0);
        setIsVibrationEnabled(data.vibrationEnabled !== false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      const data = {
        count,
        totalCount,
        vibrationEnabled: isVibrationEnabled,
        lastSaved: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleMainTap = () => {
    // Increment count
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount(totalCount + 1);

    // Haptic feedback
    if (isVibrationEnabled) {
      if (newCount === goal) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (newCount % 33 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    // Animate the counter
    countScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );

    // Animate the button
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 20, stiffness: 300 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.4;
    rippleScale.value = withTiming(3, { duration: 600, easing: Easing.out(Easing.cubic) });
    rippleOpacity.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });

    // Check if goal reached
    if (newCount >= goal) {
      setTimeout(() => {
        Alert.alert(
          "Masha'Allah! 🎉",
          `You've completed ${goal} ${selectedDhikr.transliteration}!`,
          [
            {
              text: 'Continue',
              onPress: () => setCount(0),
              style: 'default',
            },
            {
              text: 'Reset',
              onPress: () => {
                setCount(0);
                setTotalCount(0);
              },
              style: 'destructive',
            },
          ]
        );
      }, 500);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Counter',
      'What would you like to reset?',
      [
        {
          text: 'Current Count',
          onPress: () => {
            setCount(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
        {
          text: 'All Counts',
          style: 'destructive',
          onPress: () => {
            setCount(0);
            setTotalCount(0);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const selectDhikr = (dhikr: DhikrOption) => {
    setSelectedDhikr(dhikr);
    setCount(0); // Reset count when changing dhikr
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const animatedCounterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progressAnimation.value,
      [0, 1],
      [0, 360],
      'clamp'
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const percentage = Math.round((count / goal) * 100);

  return (
    <View style={[styles.container, {
      backgroundColor: theme.background.primary
    }]}>
      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? [theme.background.primary, theme.background.secondary] : [theme.background.primary, theme.background.secondary]}
        style={StyleSheet.absoluteFillObject}
      />

      <PremiumHeader
        title="Tasbih"
        subtitle="Digital Counter"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="refresh"
        onRightPress={handleReset}
        transparent
        blur
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Counter Display */}
        <View style={styles.counterSection}>
          <TouchableWithoutFeedback
            onPress={handleMainTap}
          >
            <View style={styles.mainTapArea}>
              <View style={styles.counterContainer}>
              {/* Ripple Effect */}
              <Animated.View style={[styles.ripple, animatedRippleStyle]}>
                <LinearGradient
                  colors={[selectedDhikr.color, 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>

              {/* Progress Ring */}
              <View style={styles.progressRing}>
                <Animated.View style={[styles.progressRingFill, animatedProgressStyle]}>
                  <LinearGradient
                    colors={[selectedDhikr.color, `${selectedDhikr.color}50`]}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>

              {/* Counter Circle */}
              <Animated.View style={[styles.counterCircle, animatedButtonStyle]}>
                <LinearGradient
                  colors={isDark ?
                    ['rgba(40,40,40,0.95)', 'rgba(30,30,30,0.95)'] :
                    ['rgba(255,255,255,0.95)', 'rgba(245,245,245,0.95)']}
                  style={styles.counterCircleGradient}
                >
                  <Animated.View style={animatedCounterStyle}>
                    <Title1 style={styles.countNumber} color={selectedDhikr.color}>
                      {count}
                    </Title1>
                  </Animated.View>
                  <Caption1 color={theme.text.secondary}>
                    of {goal}
                  </Caption1>
                  <View style={[styles.percentageContainer, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }]}>
                    <Caption2 color={selectedDhikr.color} weight="semibold">
                      {percentage}%
                    </Caption2>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Tap Instruction */}
              <MotiView
                from={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: 'timing',
                  duration: 1500,
                  loop: true,
                  repeatReverse: true,
                }}
                style={styles.tapHint}
              >
                <Caption1 color={theme.text.tertiary}>
                  TAP ANYWHERE TO COUNT
                </Caption1>
              </MotiView>
            </View>
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* Selected Dhikr Display */}
        <PremiumCard variant="elevated" style={styles.dhikrDisplay}>
          <ArabicText
            variant="title1"
            color={selectedDhikr.color}
            style={styles.arabicText}
          >
            {selectedDhikr.arabic}
          </ArabicText>
          <Headline weight="semibold">
            {selectedDhikr.transliteration}
          </Headline>
          <Caption1 color={theme.text.secondary}>
            {selectedDhikr.translation}
          </Caption1>
        </PremiumCard>

        {/* Dhikr Options */}
        <View style={styles.dhikrOptions}>
          {dhikrOptions.map((dhikr, index) => (
            <MotiView
              key={dhikr.id}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => selectDhikr(dhikr)}
                style={[
                  styles.dhikrOption,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  },
                  selectedDhikr.id === dhikr.id && {
                    backgroundColor: dhikr.color,
                  },
                ]}
              >
                <Caption2
                  color={selectedDhikr.id === dhikr.id ? '#FFFFFF' : dhikr.color}
                  weight="semibold"
                >
                  {dhikr.transliteration}
                </Caption2>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <PremiumCard variant="flat" style={styles.statCard}>
            <Caption1 color={theme.text.secondary}>
              Session
            </Caption1>
            <Title2 color={theme.islamic.primary}>
              {count}
            </Title2>
          </PremiumCard>

          <PremiumCard variant="flat" style={styles.statCard}>
            <Caption1 color={theme.text.secondary}>
              Total
            </Caption1>
            <Title2 color={theme.islamic.primary}>
              {totalCount.toLocaleString()}
            </Title2>
          </PremiumCard>
        </View>

        {/* Milestones */}
        <View style={styles.milestones}>
          {[33, 66, 99].map((milestone) => (
            <View key={milestone} style={styles.milestoneItem}>
              <View
                style={[
                  styles.milestoneDot,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  },
                  count >= milestone && {
                    backgroundColor: theme.islamic.primary,
                  },
                ]}
              >
                {count >= milestone && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Caption2 color={theme.text.tertiary}>
                {milestone}
              </Caption2>
            </View>
          ))}
        </View>

        {/* Settings */}
        <PremiumCard variant="flat" style={styles.settingsCard}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setIsVibrationEnabled(!isVibrationEnabled)}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={theme.text.secondary}
              />
              <Body style={{ marginLeft: Spacing.md }}>
                Vibration
              </Body>
            </View>
            <Ionicons
              name={isVibrationEnabled ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isVibrationEnabled ? theme.islamic.primary : theme.text.tertiary}
            />
          </TouchableOpacity>
        </PremiumCard>
      </ScrollView>
    </View>
  );
};

const ScrollView = Animated.ScrollView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120, // Account for PremiumHeader (56 + insets.top + padding)
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  counterSection: {
    marginVertical: Spacing.xl,
  },
  mainTapArea: {
    width: '100%',
    alignItems: 'center',
  },
  counterContainer: {
    width: SCREEN_WIDTH - Spacing.md * 2,
    height: SCREEN_WIDTH - Spacing.md * 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH / 2,
  },
  progressRing: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: SCREEN_WIDTH / 2,
    borderWidth: 8,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH / 2,
    overflow: 'hidden',
  },
  progressGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  counterCircle: {
    width: '70%',
    height: '70%',
    borderRadius: SCREEN_WIDTH / 2,
    ...Elevation.level5,
    overflow: 'hidden',
  },
  counterCircleGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    lineHeight: 72,
  },
  percentageContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: BorderRadius.full,
  },
  tapHint: {
    position: 'absolute',
    bottom: -30,
    alignSelf: 'center',
  },
  dhikrDisplay: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  arabicText: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  dhikrOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dhikrOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    margin: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  milestoneItem: {
    alignItems: 'center',
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  settingsCard: {
    padding: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TasbihScreenV2;