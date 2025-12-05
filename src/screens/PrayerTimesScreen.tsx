/**
 * Prayer Times Screen
 * Apple-level quality implementation with premium UI/UX
 * Features: Real-time countdown, progress indicators, location display, calculation methods, notifications
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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

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
import { getTheme } from '../theme/themeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== Types ====================

interface PrayerTimeCardProps {
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

// ==================== Prayer Time Card Component ====================

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = React.memo(({
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
  const theme = getTheme(isDark);
  const { formatTime } = useTimeFormat();
  const scale = useSharedValue(1);

  const getPrayerIcon = (): string => {
    switch (name) {
      case 'Fajr': return 'partly-sunny-outline';
      case 'Sunrise': return 'sunny-outline';
      case 'Dhuhr': return 'sunny';
      case 'Asr': return 'cloudy-outline';
      case 'Maghrib': return 'moon-outline';
      case 'Isha': return 'moon';
      default: return 'time-outline';
    }
  };

  const getPrayerColor = (): string => {
    switch (name) {
      case 'Fajr': return '#7C3AED'; // Purple
      case 'Sunrise': return '#F59E0B'; // Amber
      case 'Dhuhr': return '#EF4444'; // Red
      case 'Asr': return '#F97316'; // Orange
      case 'Maghrib': return '#8B5CF6'; // Violet
      case 'Isha': return '#3B82F6'; // Blue
      default: return AppleColors.islamic.emerald[500];
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleNotification(value);
  };

  const color = getPrayerColor();
  const opacity = isPast ? 0.5 : 1;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={animatedStyle}>
      <PremiumCard
        variant={isNext ? 'glass' : 'elevated'}
        elevation="level2"
        blur={isNext}
        blurIntensity={isNext ? 60 : 0}
        style={[
          styles.prayerCard,
          ...(isNext ? [{
            borderWidth: 2,
            borderColor: color,
            backgroundColor: isDark ? `${color}15` : `${color}10`,
          }] : []),
        ]}
        animated={false}
      >
        <View style={styles.prayerCardContent}>
          {/* Left Section: Icon and Name */}
          <View style={styles.prayerLeft}>
            <View style={[styles.prayerIconContainer, { backgroundColor: `${color}20` }]}>
              <Ionicons name={getPrayerIcon() as any} size={32} color={color} />
            </View>

            <View style={styles.prayerInfo}>
              <Headline color={isPast ? theme.text.tertiary : theme.text.primary}>
                {name}
              </Headline>
              <ArabicText
                variant="headline"
                weight="medium"
                color={isPast ? theme.text.tertiary : color}
                style={{ marginTop: 2 }}
              >
                {arabic}
              </ArabicText>
            </View>
          </View>

          {/* Right Section: Time and Toggle */}
          <View style={styles.prayerRight}>
            <View style={styles.timeContainer}>
              {isNext && (
                <View style={[styles.nextBadge, { backgroundColor: color }]}>
                  <Caption2 weight="bold" color="#FFFFFF">
                    NEXT
                  </Caption2>
                </View>
              )}
              <Title2 color={isPast ? theme.text.tertiary : color}>
                {formatTime(time)}
              </Title2>
            </View>

            {name !== 'Sunrise' && (
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onToggleCompleted(!isCompleted);
                  }}
                  style={[
                    styles.checkboxContainer,
                    isCompleted && { backgroundColor: AppleColors.islamic.emerald[500] }
                  ]}
                >
                  {isCompleted && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <Switch
                  value={isEnabled}
                  onValueChange={handleToggle}
                  trackColor={{
                    false: isDark ? '#3A3A3C' : '#E5E5EA',
                    true: color,
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={isDark ? '#3A3A3C' : '#E5E5EA'}
                  style={{ opacity, marginLeft: Spacing.sm }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Progress Bar for Next Prayer */}
        {isNext && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: color,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </PremiumCard>
    </Animated.View>
  );
});

PrayerTimeCard.displayName = 'PrayerTimeCard';

// ==================== Main Screen Component ====================

interface PrayerTimesScreenProps {
  navigation: any;
}

const PrayerTimesScreen: React.FC<PrayerTimesScreenProps> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
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

  // ==================== Effects ====================

  useEffect(() => {
    // Request notification permissions on mount
    const requestPermissions = async () => {
      const hasPermission = await PrayerTimesService.requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications to receive prayer time reminders.',
          [{ text: 'OK' }]
        );
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    // Schedule notifications when prayer times or notification settings change
    if (prayerTimes?.timings) {
      PrayerTimesService.schedulePrayerNotifications(prayerTimes.timings, notifications);
    }
  }, [prayerTimes, notifications]);

  // Load today's completed prayers
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

  // ==================== Handlers ====================

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setRefreshing(false);
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
        // If unchecking, we'd need to implement a method to unmark a prayer
        // For now, we'll just update the local state
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error marking prayer as completed:', error);
    }
  }, []);

  const handleCalculationMethodPress = useCallback(() => {
    const methods = PrayerTimesService.getCalculationMethods();

    if (Platform.OS === 'ios') {
      const options = methods.map(m => m.name);
      options.push('Cancel');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: 'Select Calculation Method',
        },
        (buttonIndex) => {
          if (buttonIndex < methods.length) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCalculationMethod(methods[buttonIndex].id);
          }
        }
      );
    } else {
      // For Android, navigate to a selection screen or show a custom modal
      // For now, show an alert with the most common methods
      Alert.alert(
        'Calculation Method',
        'Select your preferred calculation method:',
        methods.slice(0, 5).map(m => ({
          text: m.name,
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setCalculationMethod(m.id);
          },
        }) as any).concat([{ text: 'Cancel', style: 'cancel' }] as any)
      );
    }
  }, [setCalculationMethod]);

  const handleLocationPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Location Services',
      'Prayer times are automatically calculated based on your current location. Make sure location services are enabled for accurate times.',
      [{ text: 'OK' }]
    );
  }, []);

  // ==================== Computed Values ====================

  const prayers = useMemo(() => {
    if (!prayerTimes?.timings) return [];
    return PrayerTimesService.getAllPrayerTimes(prayerTimes.timings);
  }, [prayerTimes]);

  const currentMethodName = useMemo(() => {
    const methods = PrayerTimesService.getCalculationMethods();
    const method = methods.find(m => m.id === calculationMethod);
    return method?.name || 'Islamic Society of North America (ISNA)';
  }, [calculationMethod]);

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

  // Determine which prayers have passed
  const prayerStatuses = useMemo(() => {
    if (!prayers.length) return {};

    const now = new Date();
    const statuses: { [key: string]: { isPast: boolean; isNext: boolean } } = {};

    prayers.forEach((prayer, index) => {
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

  // ==================== Error State ====================

  if (error && !prayerTimes) {
    return (
      <View style={styles.container}>
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
            <Body align="center" color={theme.text.secondary}>
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

  // ==================== Loading State ====================

  if (loading && !prayerTimes) {
    return (
      <View style={styles.container}>
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

  // ==================== Main Content ====================

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
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
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={AppleColors.islamic.emerald[500]}
            colors={[AppleColors.islamic.emerald[500]]}
          />
        }
      >
        {/* Next Prayer Countdown Card */}
        {nextPrayer && (
          <Animated.View entering={FadeIn.delay(100).springify()}>
            <PremiumCard
              variant="gradient"
              gradient={AppleColors.gradients.premium}
              style={styles.nextPrayerCard}
            >
              <View style={styles.nextPrayerContent}>
                <Caption1 weight="semibold" color="rgba(255,255,255,0.8)">
                  NEXT PRAYER
                </Caption1>

                <View style={styles.nextPrayerMain}>
                  <View style={styles.nextPrayerLeft}>
                    <Title1 weight="bold" color="#FFFFFF">
                      {nextPrayer.name}
                    </Title1>
                    <ArabicText
                      variant="title2"
                      weight="semibold"
                      color="rgba(255,255,255,0.9)"
                    >
                      {nextPrayer.arabic}
                    </ArabicText>
                  </View>

                  <View style={styles.nextPrayerRight}>
                    <Title1 weight="bold" color="#FFFFFF">
                      {formatTime(nextPrayer.time)}
                    </Title1>
                    <Caption1 color="rgba(255,255,255,0.8)">
                      in {nextPrayer.timeUntil}
                    </Caption1>
                  </View>
                </View>

                {/* Progress Indicator */}
                <View style={styles.countdownProgress}>
                  <View style={styles.countdownProgressBar}>
                    <View
                      style={[
                        styles.countdownProgressFill,
                        { width: `${nextPrayer.percentage}%` },
                      ]}
                    />
                  </View>
                  <Caption2 color="rgba(255,255,255,0.7)">
                    {Math.round(nextPrayer.percentage)}% until next prayer
                  </Caption2>
                </View>
              </View>
            </PremiumCard>
          </Animated.View>
        )}

        {/* Location and Date Card */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <PremiumCard variant="elevated" style={styles.locationCard}>
            <TouchableOpacity
              onPress={handleLocationPress}
              activeOpacity={0.7}
              style={styles.locationHeader}
            >
              <View style={styles.locationLeft}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={AppleColors.islamic.emerald[500]}
                />
                <View style={styles.locationInfo}>
                  <Headline color={theme.text.primary}>
                    {location?.city || 'Detecting location...'}
                  </Headline>
                  <Caption1 color={theme.text.secondary}>
                    {location?.country || 'Please wait...'}
                  </Caption1>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Caption1 color={theme.text.secondary}>
                  Gregorian
                </Caption1>
                <Footnote weight="medium" color={theme.text.primary}>
                  {gregorianDate}
                </Footnote>
              </View>

              <View style={[styles.dateItem, { alignItems: 'flex-end' }]}>
                <Caption1 color={theme.text.secondary}>
                  Hijri
                </Caption1>
                <Footnote weight="medium" color={theme.text.primary}>
                  {hijriDate}
                </Footnote>
              </View>
            </View>
          </PremiumCard>
        </Animated.View>

        {/* Prayer Times List */}
        <View style={styles.prayersSection}>
          <Title3 style={styles.sectionTitle}>
            Today's Prayers
          </Title3>

          {prayers.map((prayer, index) => (
            <PrayerTimeCard
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
              delay={200 + index * 50}
              progress={prayerStatuses[prayer.name]?.isNext ? nextPrayer?.percentage : 0}
            />
          ))}
        </View>

        {/* Settings Section */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Title3 style={styles.sectionTitle}>
            Settings
          </Title3>

          <PremiumCard variant="elevated" style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleCalculationMethodPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Ionicons
                    name="calculator-outline"
                    size={22}
                    color={AppleColors.islamic.emerald[500]}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Callout weight="medium" color={theme.text.primary}>
                    Calculation Method
                  </Callout>
                  <Caption1 color={theme.text.secondary} numberOfLines={1}>
                    {currentMethodName}
                  </Caption1>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.text.tertiary}
              />
            </TouchableOpacity>
          </PremiumCard>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
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
    paddingTop: 120, // Account for PremiumHeader (56 + insets.top + padding)
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

  // Next Prayer Card
  nextPrayerCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  nextPrayerContent: {
    padding: Spacing.lg,
  },
  nextPrayerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  nextPrayerLeft: {
    flex: 1,
  },
  nextPrayerRight: {
    alignItems: 'flex-end',
  },
  countdownProgress: {
    marginTop: Spacing.md,
  },
  countdownProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  countdownProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  // Location Card
  locationCard: {
    marginBottom: Spacing.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: Spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },

  // Prayer Cards
  prayersSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  prayerCard: {
    marginBottom: Spacing.md,
  },
  prayerCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerRight: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
  },
  nextBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Settings
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${AppleColors.islamic.emerald[500]}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    borderColor: AppleColors.islamic.emerald[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PrayerTimesScreen;
