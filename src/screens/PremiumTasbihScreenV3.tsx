/**
 * Premium Tasbih Counter Screen V3
 * Ultra-Premium Design with Glass Morphism & Advanced Animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  Vibration,
  Platform,
  ScrollView as RNScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  FadeInUp,
  runOnJS,
  interpolateColor,
  withDelay,
  SlideInRight,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView, MotiText, AnimatePresence } from 'moti';
// Removed gesture handlers to eliminate square boundary

// Theme
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface DhikrOption {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  meaning: string;
  gradient: string[];
  icon: string;
  benefits: string[];
}

const dhikrOptions: DhikrOption[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    meaning: 'Declaring the perfection of Allah',
    gradient: ['#667EEA', '#764BA2'],
    icon: 'moon',
    benefits: ['Purifies the heart', 'Removes sins', 'Plants trees in Paradise'],
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is due to Allah',
    meaning: 'Expressing gratitude to Allah',
    gradient: ['#F093FB', '#F5576C'],
    icon: 'sunny',
    benefits: ['Increases blessings', 'Brings contentment', 'Fills the scales'],
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    meaning: 'Declaring Allah\'s supremacy',
    gradient: ['#4FACFE', '#00F2FE'],
    icon: 'star',
    benefits: ['Strengthens faith', 'Brings courage', 'Most beloved to Allah'],
  },
  {
    id: 'laailaha',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    meaning: 'Declaration of monotheism',
    gradient: ['#43E97B', '#38F9D7'],
    icon: 'heart',
    benefits: ['Key to Paradise', 'Heaviest on the scales', 'Renews faith'],
  },
  {
    id: 'istighfar',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    meaning: 'Seeking Allah\'s forgiveness',
    gradient: ['#FA709A', '#FEE140'],
    icon: 'water',
    benefits: ['Removes anxiety', 'Opens doors of rizq', 'Erases sins'],
  },
  {
    id: 'salawat',
    arabic: 'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    transliteration: 'Sallallahu Alaihi Wasallam',
    translation: 'Peace be upon the Prophet',
    meaning: 'Sending blessings upon Prophet Muhammad ﷺ',
    gradient: ['#FF9A9E', '#FECFEF'],
    icon: 'rose',
    benefits: ['Receives 10 blessings', 'Intercession on Judgment Day', 'Increases love'],
  },
];

const STORAGE_KEY = '@premium_tasbih_v3';
const PARTICLES_COUNT = 20;

// Particle Component for Visual Effects
const Particle: React.FC<{ delay: number; gradient: string[] }> = ({ delay, gradient }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-SCREEN_HEIGHT, {
          duration: 8000,
          easing: Easing.linear,
        }),
        -1
      )
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 2000 }),
        withTiming(-20, { duration: 2000 })
      ),
      -1
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  const randomLeft = Math.random() * SCREEN_WIDTH;
  const randomSize = Math.random() * 4 + 2;

  return (
    <Animated.View
      style={[
        styles.particle,
        animatedStyle,
        {
          left: randomLeft,
          width: randomSize,
          height: randomSize,
          backgroundColor: gradient[0],
        },
      ]}
    />
  );
};

const PremiumTasbihScreenV3: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrOptions[0]);
  const [goal, setGoal] = useState(33);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [showTapHint, setShowTapHint] = useState(true);

  // Sound ref for click sound
  const soundRef = useRef<Audio.Sound | null>(null);

  // Play click sound function
  const playClickSound = useCallback(async () => {
    if (!isSoundEnabled) return;

    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Create a simple click sound using a beep frequency
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3' },
        { shouldPlay: true, volume: 0.3 }
      );
      soundRef.current = sound;

      // Cleanup after sound finishes
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      // Silently fail - sound is optional enhancement
      console.log('Sound playback error (non-critical):', error);
    }
  }, [isSoundEnabled]);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Animation values
  const buttonScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const progressAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const backgroundColorAnimation = useSharedValue(0);

  // Start continuous animations
  useEffect(() => {
    // Pulse animation for the counter circle
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Glow animation
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );

    // Rotation animation for decorative elements
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1
    );

    // Hide tap hint after 3 seconds
    const timer = setTimeout(() => {
      setShowTapHint(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

    // Update background color based on progress
    backgroundColorAnimation.value = withTiming(count / goal, {
      duration: 500,
    });
  }, [count, totalCount, goal]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        setCount(data.count || 0);
        setTotalCount(data.totalCount || 0);
        setIsVibrationEnabled(data.vibrationEnabled !== false);
        setIsSoundEnabled(data.soundEnabled !== false);
        setGoal(data.goal || 33);
        setSavedSessions(data.sessions || []);
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
        soundEnabled: isSoundEnabled,
        goal,
        sessions: savedSessions,
        lastSaved: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleMainTap = useCallback(() => {
    // Increment count
    const newCount = count + 1;
    setCount(newCount);
    setTotalCount(totalCount + 1);

    // Play click sound
    playClickSound();

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

    // Animate the counter with more dramatic effect
    countScale.value = withSequence(
      withSpring(1.4, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );

    // Animate the button
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 20, stiffness: 300 })
    );

    // Ripple effects disabled to eliminate square boundary
    // rippleScale.value = 0;
    // rippleOpacity.value = 0.6;
    // rippleScale.value = withTiming(4, { duration: 800, easing: Easing.out(Easing.cubic) });
    // rippleOpacity.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });

    // Check if goal reached
    if (newCount >= goal) {
      setTimeout(() => {
        // Save session
        const newSession = {
          dhikr: selectedDhikr.transliteration,
          count: newCount,
          date: new Date().toISOString(),
        };
        setSavedSessions([...savedSessions, newSession]);

        Alert.alert(
          "Masha'Allah! 🌟",
          `You've completed ${goal} ${selectedDhikr.transliteration}!\n\n"${selectedDhikr.benefits[0]}"`,
          [
            {
              text: 'Continue',
              onPress: () => setCount(0),
              style: 'default',
            },
            {
              text: 'Change Dhikr',
              onPress: () => {
                setCount(0);
                const nextIndex = (dhikrOptions.findIndex(d => d.id === selectedDhikr.id) + 1) % dhikrOptions.length;
                setSelectedDhikr(dhikrOptions[nextIndex]);
              },
            },
            {
              text: 'New Goal',
              onPress: () => {
                setCount(0);
                // Cycle through goals: 33 -> 99 -> 100 -> 1000 -> 33
                const goals = [33, 99, 100, 1000];
                const currentIndex = goals.indexOf(goal);
                const nextGoal = goals[(currentIndex + 1) % goals.length];
                setGoal(nextGoal);
              },
              style: 'default',
            },
          ]
        );
      }, 500);
    }
  }, [count, totalCount, goal, selectedDhikr, isVibrationEnabled, savedSessions, playClickSound]);

  const handleReset = () => {
    Alert.alert(
      'Reset Counter',
      'Choose reset option:',
      [
        {
          text: 'Current Session',
          onPress: () => {
            setCount(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
        {
          text: 'All Progress',
          style: 'destructive',
          onPress: () => {
            setCount(0);
            setTotalCount(0);
            setSavedSessions([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const selectDhikr = (dhikr: DhikrOption) => {
    setSelectedDhikr(dhikr);
    setCount(0);
    setShowBenefits(true);
    setTimeout(() => {
      setShowBenefits(false);
    }, 3000);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Swipe handling removed to eliminate square boundary

  // Animated styles
  const animatedCounterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(buttonScale.value * pulseAnimation.value) }],
  }));

  const animatedRippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      progressAnimation.value,
      [0, 1],
      [-90, 270],
      'clamp'
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowAnimation.value,
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundColorAnimation.value,
      [0, 0.5, 1],
      [theme.background.primary, selectedDhikr.gradient[0] + '20', selectedDhikr.gradient[1] + '30']
    );
    return { backgroundColor };
  });

  const animatedRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  const percentage = Math.round((count / goal) * 100);

  return (
    <Animated.View style={[styles.container, animatedBackgroundStyle]}>
      {/* Animated Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedBackgroundStyle]}>
        <LinearGradient
          colors={isDark ?
            ['#0A0A0A', '#1A1A1A', '#0A0A0A'] :
            [selectedDhikr.gradient[0] + '10', selectedDhikr.gradient[1] + '05', '#FFFFFF']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating Particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {[...Array(PARTICLES_COUNT)].map((_, index) => (
          <Particle
            key={index}
            delay={index * 200}
            gradient={selectedDhikr.gradient}
          />
        ))}
      </View>

      {/* Decorative Rotating Element */}
      <Animated.View style={[styles.decorativeElement, animatedRotateStyle]} pointerEvents="none">
        <LinearGradient
          colors={[selectedDhikr.gradient[0] + '20', 'transparent']}
          style={styles.decorativeGradient}
        />
      </Animated.View>

      {/* Minimal Header */}
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <RNScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Counter Area - Pure invisible touch handling */}
        <View
          style={{
            marginVertical: SPACING.lg,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            borderWidth: 0,
          }}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleMainTap}
          onResponderTerminationRequest={() => false}
        >
            {/* Visual Elements */}
            {/* Ripple disabled to eliminate square boundary */}

            {/* Glow disabled to test for square boundary */}

            {/* Progress Ring */}
            <View style={styles.progressRing}>
              <Animated.View style={[styles.progressRingFill, animatedProgressStyle]}>
                <LinearGradient
                  colors={selectedDhikr.gradient as unknown as readonly [string, string]}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
            </View>

            {/* Counter Circle with Glass Effect */}
            <Animated.View style={[styles.counterCircle, animatedButtonStyle]}>
              <BlurView
                intensity={100}
                tint={isDark ? 'dark' : 'light'}
                style={styles.counterBlur}
              >
                <LinearGradient
                  colors={isDark ?
                    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] :
                    ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.counterGradient}
                >
                  <Animated.View style={animatedCounterStyle}>
                    <Text style={[styles.countNumber, { color: selectedDhikr.gradient[0] }]}>
                      {count}
                    </Text>
                  </Animated.View>

                  <View style={styles.goalContainer}>
                    <Text style={[styles.goalText, { color: theme.text.secondary }]}>
                      Goal: {goal}
                    </Text>
                  </View>

                  <View style={[styles.percentageContainer, {
                    backgroundColor: selectedDhikr.gradient[0] + '20'
                  }]}>
                    <Text style={[styles.percentageText, { color: selectedDhikr.gradient[0] }]}>
                      {percentage}%
                    </Text>
                  </View>

                  {/* Arabic Text */}
                  <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 400, delay: 200 }}
                    style={styles.arabicContainer}
                  >
                    <Text style={[styles.arabicText, { color: selectedDhikr.gradient[1] }]}>
                      {selectedDhikr.arabic}
                    </Text>
                  </MotiView>
                </LinearGradient>
              </BlurView>
            </Animated.View>

            {/* Tap Hint */}
            {showTapHint && (
              <MotiView
                from={{ opacity: 1 }}
                animate={{ opacity: showTapHint ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: 'timing',
                  duration: 500,
                }}
                style={styles.tapHint}
              >
                <Text style={[styles.tapHintText, { color: '#FFFFFF' }]}>
                  TAP ANYWHERE TO COUNT
                </Text>
              </MotiView>
            )}
        </View>

        {/* Benefits Display */}
        <AnimatePresence>
          {showBenefits && (
            <MotiView
              from={{
                opacity: 0,
                translateY: 50,
                scale: 0.8,
                translateX: 0
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
                translateX: 0
              }}
              exit={{
                opacity: 0,
                translateY: 30,
                scale: 0.85,
                translateX: 0
              }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
              exitTransition={{
                type: 'timing',
                duration: 400,
              }}
              style={[styles.benefitsCard, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)',
                position: 'relative',
                zIndex: 10,
              }]}
            >
              <LinearGradient
                colors={[selectedDhikr.gradient[0] + '15', 'transparent'] as readonly [string, string]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60 }}
              />
              <Text style={[styles.benefitTitle, { color: selectedDhikr.gradient[0] }]}>
                Benefits of {selectedDhikr.transliteration}
              </Text>
              {selectedDhikr.benefits.map((benefit, index) => (
                <MotiView
                  key={index}
                  from={{
                    opacity: 0,
                    translateX: -30,
                    scale: 0.95
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                    scale: 1
                  }}
                  transition={{
                    delay: index * 100 + 200,
                    type: 'timing',
                    duration: 300
                  }}
                >
                  <Text style={[styles.benefitText, { color: theme.text.secondary }]}>
                    • {benefit}
                  </Text>
                </MotiView>
              ))}
            </MotiView>
          )}
        </AnimatePresence>

        {/* Dhikr Selection */}
        <MotiView
          animate={{
            opacity: showBenefits ? 0.2 : 1,
            translateY: showBenefits ? 40 : 0,
            scale: showBenefits ? 0.92 : 1,
          }}
          transition={{
            type: 'timing',
            duration: showBenefits ? 350 : 450,
          }}
          style={styles.dhikrSelection}
        >
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Select Dhikr
          </Text>
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dhikrScrollContent}
          >
            {dhikrOptions.map((dhikr, index) => (
              <MotiView
                key={dhikr.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{
                  opacity: showBenefits ? 0.3 : 1,
                  translateY: showBenefits ? 10 : 0,
                  scale: showBenefits ? 0.98 : 1,
                }}
                transition={{
                  delay: showBenefits ? 0 : index * 30,
                  type: 'timing',
                  duration: showBenefits ? 300 : 400,
                }}
              >
                <TouchableOpacity
                  onPress={() => selectDhikr(dhikr)}
                  style={[
                    styles.dhikrCard,
                    selectedDhikr.id === dhikr.id && styles.dhikrCardSelected,
                  ]}
                >
                  <LinearGradient
                    colors={(selectedDhikr.id === dhikr.id ? dhikr.gradient :
                      isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] :
                      ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']) as unknown as readonly [string, string]}
                    style={styles.dhikrCardGradient}
                  >
                    <Ionicons
                      name={dhikr.icon as any}
                      size={26}
                      color={selectedDhikr.id === dhikr.id ? '#FFFFFF' : dhikr.gradient[0]}
                    />
                    <Text style={[
                      styles.dhikrCardText,
                      { color: selectedDhikr.id === dhikr.id ? '#FFFFFF' : theme.text.primary }
                    ]}>
                      {dhikr.transliteration}
                    </Text>
                    <Text style={[
                      styles.dhikrCardSubtext,
                      { color: selectedDhikr.id === dhikr.id ? 'rgba(255,255,255,0.8)' : theme.text.secondary }
                    ]}>
                      {dhikr.translation}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </MotiView>
            ))}
          </RNScrollView>
        </MotiView>

        {/* Stats Cards */}
        <MotiView
          animate={{
            opacity: showBenefits ? 0.3 : 1,
            translateY: showBenefits ? 35 : 0,
            scale: showBenefits ? 0.94 : 1,
          }}
          transition={{
            type: 'timing',
            duration: showBenefits ? 350 : 450,
          }}
          style={styles.statsContainer}
        >
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={[styles.statCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
            }]}
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={styles.statBlur}>
              <Ionicons name="today-outline" size={24} color={selectedDhikr.gradient[0]} />
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Session
              </Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {count}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={[styles.statCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
            }]}
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={styles.statBlur}>
              <Ionicons name="trophy-outline" size={24} color={selectedDhikr.gradient[1]} />
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Total
              </Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {totalCount.toLocaleString()}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[styles.statCard, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
            }]}
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={styles.statBlur}>
              <Ionicons name="flag-outline" size={24} color={COLORS.accent.coral} />
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Goal
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const goals = [33, 99, 100, 1000];
                  const currentIndex = goals.indexOf(goal);
                  const nextGoal = goals[(currentIndex + 1) % goals.length];
                  setGoal(nextGoal);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.statValue, { color: COLORS.accent.coral }]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </MotiView>

        {/* Milestones */}
        <View style={styles.milestonesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Milestones
          </Text>
          <View style={styles.milestones}>
            {[Math.floor(goal / 3), Math.floor(goal * 2 / 3), goal].map((milestone, index) => (
              <Animated.View
                key={milestone}
                entering={ZoomIn.delay(index * 100).springify()}
                style={[
                  styles.milestoneItem,
                  count >= milestone && styles.milestoneItemActive,
                  { borderColor: count >= milestone ? selectedDhikr.gradient[0] : theme.text.tertiary + '30' }
                ]}
              >
                <LinearGradient
                  colors={(count >= milestone ? selectedDhikr.gradient :
                    isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] :
                    ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']) as unknown as readonly [string, string]}
                  style={styles.milestoneGradient}
                >
                  {count >= milestone ? (
                    <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.milestoneNumber, { color: theme.text.secondary }]}>
                      {milestone}
                    </Text>
                  )}
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Settings
          </Text>

          <TouchableOpacity
            style={[styles.settingRow, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
            }]}
            onPress={() => {
              setIsVibrationEnabled(!isVibrationEnabled);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={COLORS.accent.purpleGradient}
                style={styles.settingIcon}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                Vibration
              </Text>
            </View>
            <View style={[styles.settingToggle, {
              backgroundColor: isVibrationEnabled ? COLORS.primary.main : theme.text.tertiary + '30'
            }]}>
              <View style={[styles.settingToggleThumb, {
                transform: [{ translateX: isVibrationEnabled ? 20 : 0 }]
              }]} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingRow, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)'
            }]}
            onPress={() => {
              setIsSoundEnabled(!isSoundEnabled);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.settingLeft}>
              <LinearGradient
                colors={COLORS.accent.skyGradient}
                style={styles.settingIcon}
              >
                <Ionicons name="volume-high-outline" size={20} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                Sound Effects
              </Text>
            </View>
            <View style={[styles.settingToggle, {
              backgroundColor: isSoundEnabled ? COLORS.primary.main : theme.text.tertiary + '30'
            }]}>
              <View style={[styles.settingToggleThumb, {
                transform: [{ translateX: isSoundEnabled ? 20 : 0 }]
              }]} />
            </View>
          </TouchableOpacity>
        </View>

      </RNScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    borderRadius: 10,
    bottom: -10,
  },
  decorativeElement: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    left: -SCREEN_WIDTH * 0.25,
    top: -SCREEN_WIDTH * 0.5,
  },
  decorativeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.75,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  counterSection: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: SPACING.lg,
    backgroundColor: 'transparent',
  },
  ripple: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: SCREEN_WIDTH * 0.375,
  },
  glowEffect: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.425,
  },
  progressRing: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_WIDTH * 0.65,
    borderRadius: SCREEN_WIDTH * 0.325,
    borderWidth: 10,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  progressRingFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.325,
    borderWidth: 10,
    borderColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  progressGradient: {
    width: '100%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.325,
  },
  counterCircle: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    overflow: 'hidden',
    // Shadow removed to eliminate potential square boundary
  },
  counterBlur: {
    flex: 1,
  },
  counterGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  countNumber: {
    fontSize: 64,
    fontWeight: 'bold' as any,
    lineHeight: 72,
  },
  goalContainer: {
    marginTop: SPACING.xs,
  },
  goalText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
  },
  percentageContainer: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    minWidth: 60,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  arabicContainer: {
    marginTop: SPACING.md,
    minHeight: 45,
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 32,
    fontFamily: 'System',
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  tapHintText: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    letterSpacing: 0.5,
  },
  benefitsCard: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  benefitTitle: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    marginBottom: SPACING.md,
    zIndex: 1,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    lineHeight: 22,
    marginTop: SPACING.xs,
    paddingLeft: SPACING.xs,
  },
  dhikrSelection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  dhikrScrollContent: {
    paddingRight: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  dhikrCard: {
    width: 150,
    height: 110,
    marginRight: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  dhikrCardSelected: {
    ...SHADOWS.lg,
    transform: [{ scale: 1.02 }],
  },
  dhikrCardGradient: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dhikrCardText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  dhikrCardSubtext: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  statCard: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    height: 100,
    ...SHADOWS.sm,
  },
  statBlur: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    marginTop: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    marginTop: 4,
  },
  milestonesContainer: {
    marginBottom: SPACING.lg,
  },
  milestones: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: SPACING.lg,
  },
  milestoneItem: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 3,
    overflow: 'hidden',
  },
  milestoneItemActive: {
    ...SHADOWS.md,
  },
  milestoneGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneNumber: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  settingsContainer: {
    marginBottom: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.xs,
    height: 64,
    ...SHADOWS.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  settingToggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
    justifyContent: 'center',
  },
  settingToggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
});

export default PremiumTasbihScreenV3;