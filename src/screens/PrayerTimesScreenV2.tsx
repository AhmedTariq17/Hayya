/**
 * Prayer Times Screen V2
 * Ultra-Premium Apple-level design with world-class UI/UX
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Dimensions,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { MotiView, AnimatePresence } from 'moti';

// Premium Components
import { PremiumCard } from '../components/premium/PremiumCard';
import { PremiumHeader } from '../components/premium/PremiumHeader';
import { PremiumButton } from '../components/premium/PremiumButton';
import { PremiumLoadingIndicator, SkeletonLoader } from '../components/premium/PremiumLoadingIndicator';
import {
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Callout,
  Subheadline,
  Footnote,
  Caption1,
  Caption2,
  ArabicText,
} from '../components/premium/PremiumText';

// Hooks and Services
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { PrayerTimesService } from '../services/prayerTimesService';
import { StatisticsService } from '../services/statisticsService';

// Theme and Utils
import { useTheme } from '../contexts/ThemeContext';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import {
  AppleColors,
  Spacing,
  Typography,
  BorderRadius,
  Elevation,
  Animations,
} from '../theme/appleDesignSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ==================== Premium Prayer Card Component ====================

interface PremiumPrayerCardProps {
  name: string;
  time: string;
  arabic: string;
  isNext: boolean;
  isPast: boolean;
  isEnabled: boolean;
  isCompleted: boolean;
  onToggleNotification: (enabled: boolean) => void;
  onToggleCompleted: (completed: boolean) => void;
  delay: number;
  progress?: number;
}

const PremiumPrayerCard: React.FC<PremiumPrayerCardProps> = React.memo(({
  name,
  time,
  arabic,
  isNext,
  isPast,
  isEnabled,
  isCompleted,
  onToggleNotification,
  onToggleCompleted,
  delay,
  progress = 0,
}) => {
  const { isDark } = useTheme();
  const { formatTime } = useTimeFormat();
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isNext) {
      // Subtle glow animation for next prayer
      glowOpacity.value = withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0.1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      );
    }
  }, [isNext]);

  const getPrayerIcon = (): string => {
    switch (name) {
      case 'Fajr': return 'moon-outline';
      case 'Sunrise': return 'sunny-outline';
      case 'Dhuhr': return 'sunny';
      case 'Asr': return 'partly-sunny';
      case 'Maghrib': return 'sunset';
      case 'Isha': return 'moon';
      default: return 'time-outline';
    }
  };

  const getPrayerGradient = (): string[] => {
    switch (name) {
      case 'Fajr': return ['#667eea', '#764ba2'];
      case 'Sunrise': return ['#f093fb', '#f5576c'];
      case 'Dhuhr': return ['#fa709a', '#fee140'];
      case 'Asr': return ['#30cfd0', '#330867'];
      case 'Maghrib': return ['#a8edea', '#fed6e3'];
      case 'Isha': return ['#2E3192', '#1BFFFF'];
      default: return AppleColors.gradients.premium;
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.98, { damping: 15 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const cardOpacity = isPast && !isCompleted ? 0.5 : 1;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.9 }}
      animate={{ opacity: cardOpacity, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        delay: delay,
        damping: 20,
      }}
    >
      <Animated.View style={animatedCardStyle}>
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <View style={styles.prayerCardContainer}>
            {/* Glow Effect for Next Prayer */}
            {isNext && (
              <Animated.View style={[styles.glowEffect, glowStyle]}>
                <LinearGradient
                  colors={[getPrayerGradient()[0], getPrayerGradient()[1], 'transparent'] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            )}

            <PremiumCard
              variant={isNext ? 'gradient' : 'elevated'}
              gradient={isNext ? getPrayerGradient() : undefined}
              style={[
                styles.prayerCard,
                isNext ? styles.nextPrayerCard : {},
              ]}
              blur={false}
            >
              <View style={styles.prayerCardContent}>
                {/* Icon Section */}
                <View style={styles.prayerIconSection}>
                  <LinearGradient
                    colors={isNext ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)'] as any : getPrayerGradient() as any}
                    style={[
                      styles.prayerIconContainer,
                      isNext && styles.nextPrayerIconContainer,
                    ]}
                  >
                    <Ionicons
                      name={getPrayerIcon() as any}
                      size={isNext ? 36 : 32}
                      color={isNext ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </LinearGradient>

                  {isNext && (
                    <View style={styles.liveIndicator}>
                      <MotiView
                        from={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{
                          type: 'timing',
                          duration: 1500,
                          loop: true,
                        }}
                        style={styles.liveIndicatorPulse}
                      />
                      <View style={styles.liveIndicatorDot} />
                    </View>
                  )}
                </View>

                {/* Prayer Info */}
                <View style={styles.prayerInfoSection}>
                  <View>
                    <Title2
                      weight={isNext ? 'bold' : 'semibold'}
                      color={isNext ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000')}
                    >
                      {name}
                    </Title2>
                    <ArabicText
                      variant="headline"
                      weight="medium"
                      color={isNext ? 'rgba(255,255,255,0.9)' : getPrayerGradient()[0]}
                      style={{ marginTop: 4 }}
                    >
                      {arabic}
                    </ArabicText>
                  </View>
                </View>

                {/* Time Section */}
                <View style={styles.prayerTimeSection}>
                  <Title1
                    weight="bold"
                    color={isNext ? '#FFFFFF' : getPrayerGradient()[0]}
                  >
                    {formatTime(time)}
                  </Title1>

                  {isNext && (
                    <Caption1 color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
                      Next Prayer
                    </Caption1>
                  )}
                </View>

                {/* Action Section */}
                {name !== 'Sunrise' && (
                  <View style={styles.prayerActionSection}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onToggleCompleted(!isCompleted);
                      }}
                      style={[
                        styles.completionButton,
                        isCompleted && styles.completionButtonActive,
                        isNext && styles.completionButtonNext,
                      ]}
                    >
                      <Ionicons
                        name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"}
                        size={32}
                        color={isCompleted ?
                          (isNext ? '#FFFFFF' : AppleColors.islamic.emerald[500]) :
                          (isNext ? 'rgba(255,255,255,0.6)' : AppleColors.semantic.text.secondary)
                        }
                      />
                    </TouchableOpacity>

                    <View style={styles.notificationToggle}>
                      <Ionicons
                        name={isEnabled ? "notifications" : "notifications-off-outline"}
                        size={20}
                        color={isNext ? 'rgba(255,255,255,0.8)' : AppleColors.semantic.text.secondary}
                        style={{ marginRight: 8 }}
                      />
                      <Switch
                        value={isEnabled}
                        onValueChange={(value) => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          onToggleNotification(value);
                        }}
                        trackColor={{
                          false: isNext ? 'rgba(255,255,255,0.3)' : (isDark ? '#3A3A3C' : '#E5E5EA'),
                          true: isNext ? 'rgba(255,255,255,0.6)' : getPrayerGradient()[0],
                        }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor={isNext ? 'rgba(255,255,255,0.3)' : (isDark ? '#3A3A3C' : '#E5E5EA')}
                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Progress Bar for Next Prayer */}
              {isNext && progress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%` },
                      ]}
                    />
                  </View>
                  <Caption2 color="rgba(255,255,255,0.8)" style={{ marginTop: 8 }}>
                    {Math.round(progress)}% time elapsed
                  </Caption2>
                </View>
              )}
            </PremiumCard>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </MotiView>
  );
});

// ==================== Main Screen Component ====================

interface PrayerTimesScreenV2Props {
  navigation: any;
}

const PrayerTimesScreenV2: React.FC<PrayerTimesScreenV2Props> = ({ navigation }) => {
  const { isDark } = useTheme();
  const { formatTime } = useTimeFormat();
  const {
    prayerTimes,
    loading,
    error,
    refresh,
    nextPrayer,
    location,
    calculationMethod,
    setCalculationMethod,
  } = usePrayerTimes();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<{ [key: string]: boolean }>({
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  });
  const [completedPrayers, setCompletedPrayers] = useState<{ [key: string]: boolean }>({
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false,
  });

  const scrollY = useSharedValue(0);

  // Load completed prayers on mount
  useEffect(() => {
    loadCompletedPrayers();
  }, []);

  const loadCompletedPrayers = async () => {
    try {
      const todayStats = await StatisticsService.getTodayStats();
      if (todayStats?.prayersCompleted) {
        const completed: { [key: string]: boolean } = {};
        ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(prayer => {
          completed[prayer] = todayStats.prayersCompleted.includes(prayer);
        });
        setCompletedPrayers(completed);
      }
    } catch (error) {
      console.error('Error loading completed prayers:', error);
    }
  };

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    await loadCompletedPrayers();
    setTimeout(() => setRefreshing(false), 1500);
  }, [refresh]);

  const handleToggleNotification = useCallback((prayer: string, enabled: boolean) => {
    setNotifications((prev) => ({ ...prev, [prayer]: enabled }));
  }, []);

  const handleTogglePrayerCompleted = useCallback(async (prayer: string, completed: boolean) => {
    try {
      setCompletedPrayers((prev) => ({ ...prev, [prayer]: completed }));

      if (completed) {
        await StatisticsService.markPrayerCompleted(prayer);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error marking prayer as completed:', error);
    }
  }, []);

  // Computed values
  const prayers = useMemo(() => {
    if (!prayerTimes?.timings) return [];
    return PrayerTimesService.getAllPrayerTimes(prayerTimes.timings);
  }, [prayerTimes]);

  const prayerStatuses = useMemo(() => {
    if (!prayers.length) return {};

    const now = new Date();
    const statuses: { [key: string]: { isPast: boolean; isNext: boolean } } = {};

    prayers.forEach((prayer) => {
      const [hours, minutes] = prayer.time.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      statuses[prayer.name] = {
        isPast: prayerTime < now,
        isNext: nextPrayer?.name === prayer.name,
      };
    });

    return statuses;
  }, [prayers, nextPrayer]);

  const hijriDate = useMemo(() => {
    if (!prayerTimes?.date?.hijri) return 'Loading...';
    const hijri = prayerTimes.date.hijri;
    return `${hijri.date} ${hijri.month.en} ${hijri.year}`;
  }, [prayerTimes]);

  const gregorianDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Loading state
  if (loading && !prayerTimes) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFFFFF' }]}>
        <PremiumHeader
          title="Prayer Times"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
          gradient
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonLoader lines={8} />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error && !prayerTimes) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFFFFF' }]}>
        <PremiumHeader
          title="Prayer Times"
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
          gradient
        />
        <View style={styles.errorContainer}>
          <PremiumCard variant="glass" style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={AppleColors.semantic.error}
              style={{ marginBottom: Spacing.md }}
            />
            <Title2 align="center" style={{ marginBottom: Spacing.sm }}>
              Unable to Load Prayer Times
            </Title2>
            <Body align="center" color={isDark ? '#999' : '#666'}>
              {error}
            </Body>
            <PremiumButton
              title="Try Again"
              onPress={handleRefresh}
              variant="gradient"
              size="medium"
              icon="refresh"
              style={{ marginTop: Spacing.lg, width: '100%' }}
            />
          </PremiumCard>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F5F5F7' }]}>
      {/* Animated Background Gradient */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: 0.5 }]}>
        <LinearGradient
          colors={isDark ?
            ['#000', '#1a1a2e', '#16213e'] :
            ['#FFFFFF', '#F5F5F7', '#E5E5EA']
          }
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <PremiumHeader
        title="Prayer Times"
        subtitle={location?.city || 'Loading location...'}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        gradient
        gradientColors={AppleColors.gradients.premium}
        scrollY={scrollY}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={AppleColors.islamic.emerald[500]}
          />
        }
      >
        {/* Hero Card - Current Prayer Status */}
        {nextPrayer && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
          >
            <LinearGradient
              colors={AppleColors.gradients.premium}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <Caption1 weight="semibold" color="rgba(255,255,255,0.9)">
                    CURRENTLY
                  </Caption1>
                  <View style={styles.locationBadge}>
                    <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                    <Caption2 color="#FFFFFF" style={{ marginLeft: 4 }}>
                      {location?.city || 'Current Location'}
                    </Caption2>
                  </View>
                </View>

                <View style={styles.heroMain}>
                  <View>
                    <Title1 weight="bold" color="#FFFFFF" style={{ fontSize: 42 }}>
                      {nextPrayer.name}
                    </Title1>
                    <ArabicText
                      variant="title1"
                      weight="bold"
                      color="rgba(255,255,255,0.95)"
                      style={{ marginTop: 8 }}
                    >
                      {nextPrayer.arabic}
                    </ArabicText>
                  </View>

                  <View style={styles.heroTimeContainer}>
                    <View style={styles.heroTimeCircle}>
                      <Title2 weight="bold" color="#FFFFFF">
                        {formatTime(nextPrayer.time)}
                      </Title2>
                    </View>
                    <Caption1 color="rgba(255,255,255,0.9)" style={{ marginTop: 8 }}>
                      {nextPrayer.timeUntil} remaining
                    </Caption1>
                  </View>
                </View>

                {/* Circular Progress */}
                <View style={styles.circularProgressContainer}>
                  <View style={styles.circularProgress}>
                    <View style={[styles.circularProgressFill, {
                      transform: [{ rotate: `${(nextPrayer.percentage / 100) * 360}deg` }]
                    }]} />
                  </View>
                  <Body weight="semibold" color="rgba(255,255,255,0.9)">
                    {Math.round(nextPrayer.percentage)}%
                  </Body>
                </View>
              </View>
            </LinearGradient>
          </MotiView>
        )}

        {/* Date Information Card */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 200 }}
        >
          <PremiumCard variant="elevated" style={styles.dateCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <View style={styles.dateIcon}>
                  <Ionicons name="calendar-outline" size={24} color={AppleColors.islamic.emerald[500]} />
                </View>
                <View>
                  <Caption1 color={isDark ? '#999' : '#666'}>
                    Gregorian Date
                  </Caption1>
                  <Subheadline weight="semibold">
                    {gregorianDate}
                  </Subheadline>
                </View>
              </View>
            </View>

            <View style={styles.dateDivider} />

            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <View style={styles.dateIcon}>
                  <Ionicons name="moon-outline" size={24} color={AppleColors.islamic.emerald[500]} />
                </View>
                <View>
                  <Caption1 color={isDark ? '#999' : '#666'}>
                    Islamic Date
                  </Caption1>
                  <Subheadline weight="semibold">
                    {hijriDate}
                  </Subheadline>
                </View>
              </View>
            </View>
          </PremiumCard>
        </MotiView>

        {/* Prayer Times List */}
        <View style={styles.prayersSection}>
          <View style={styles.sectionHeader}>
            <Title2 weight="bold">Today's Prayers</Title2>
            <TouchableOpacity>
              <Caption1 color={AppleColors.system.blue}>View Calendar</Caption1>
            </TouchableOpacity>
          </View>

          {prayers.map((prayer, index) => (
            <PremiumPrayerCard
              key={prayer.name}
              name={prayer.name}
              time={prayer.time}
              arabic={prayer.arabic}
              isNext={prayerStatuses[prayer.name]?.isNext || false}
              isPast={prayerStatuses[prayer.name]?.isPast || false}
              isEnabled={notifications[prayer.name as keyof typeof notifications] ?? true}
              isCompleted={completedPrayers[prayer.name as keyof typeof completedPrayers] ?? false}
              onToggleNotification={(enabled) => handleToggleNotification(prayer.name, enabled)}
              onToggleCompleted={(completed) => handleTogglePrayerCompleted(prayer.name, completed)}
              delay={300 + index * 100}
              progress={prayerStatuses[prayer.name]?.isNext ? nextPrayer?.percentage : 0}
            />
          ))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    width: '100%',
  },

  // Hero Card
  heroCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    ...Elevation.level5,
  },
  heroContent: {
    flex: 1,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  heroMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroTimeContainer: {
    alignItems: 'center',
  },
  heroTimeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  circularProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circularProgress: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  circularProgressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // Date Card
  dateCard: {
    marginBottom: Spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },
  dateRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: `${AppleColors.islamic.emerald[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dateDivider: {
    height: 1,
    backgroundColor: AppleColors.semantic.separator.nonOpaque,
    marginHorizontal: Spacing.lg,
  },

  // Prayer Cards
  prayersSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  prayerCardContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: BorderRadius.xl + 10,
    opacity: 0.3,
  },
  prayerCard: {
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  nextPrayerCard: {
    borderWidth: 0,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIconSection: {
    marginRight: Spacing.md,
    position: 'relative',
  },
  prayerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPrayerIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  liveIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIndicatorPulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  prayerInfoSection: {
    flex: 1,
    justifyContent: 'center',
  },
  prayerTimeSection: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  prayerActionSection: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionButton: {
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  completionButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  completionButtonNext: {
    // Styles for next prayer completion button
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});

// Assign nextPrayer to cards
const nextPrayer = null; // This will be passed from the parent

export default PrayerTimesScreenV2;