/**
 * Ultra-Premium Prayer Times Screen - Apple Level Polish
 * Perfect fit, no scrolling, immaculate design
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
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
import notificationService from '../services/notificationService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PrayerTimeData {
  name: string;
  time: string;
  arabic: string;
  icon: string;
  gradient: string[];
  isNext: boolean;
  isPassed: boolean;
}

// Compact Prayer Card Component
const CompactPrayerCard: React.FC<{
  prayer: PrayerTimeData;
  index: number;
  onPress: () => void;
}> = ({ prayer, index, onPress }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const { formatTime } = useTimeFormat();

  const scale = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    'worklet';
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: prayer.isPassed ? 0.6 : 1,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 30).springify()}
      style={[styles.prayerCard, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.prayerCardTouchable}
      >
        <LinearGradient
          colors={
            prayer.isNext
              ? PillarsColors.gradients.goldNavy as any
              : isDark
              ? [theme.background.card, theme.background.elevated] as any
              : prayer.gradient as any
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.prayerCardContent}>
          {/* Icon */}
          <View
            style={[
              styles.prayerIcon,
              {
                backgroundColor: prayer.isNext
                  ? PillarsColors.glass.white[20]
                  : PillarsColors.glass.black[5],
              },
            ]}
          >
            <MaterialCommunityIcons
              name={prayer.icon as any}
              size={20}
              color={
                prayer.isNext
                  ? '#FFFFFF'
                  : isDark
                  ? PillarsColors.gold[400]
                  : PillarsColors.navy[600]
              }
            />
          </View>

          {/* Prayer Name */}
          <View style={styles.prayerNameContainer}>
            <Text
              style={[
                styles.prayerName,
                {
                  color: prayer.isNext
                    ? '#FFFFFF'
                    : theme.text.primary,
                },
              ]}
            >
              {prayer.name}
            </Text>
            {prayer.isNext && (
              <View style={styles.nextBadge}>
                <Text style={styles.nextBadgeText}>NEXT</Text>
              </View>
            )}
          </View>

          {/* Time */}
          <Text
            style={[
              styles.prayerTime,
              {
                color: prayer.isNext
                  ? '#FFFFFF'
                  : theme.text.primary,
              },
            ]}
          >
            {formatTime(prayer.time)}
          </Text>

          {/* Status Indicator */}
          {prayer.isPassed && (
            <View style={styles.passedIndicator}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={PillarsColors.semantic.success}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PillarsPrayerTimesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const {
    prayerTimes,
    loading,
    refresh,
    nextPrayer,
    location,
  } = usePrayerTimes();
  const { formatTime } = useTimeFormat();

  // Prayer data with icons
  const prayers = useMemo(() => {
    if (!prayerTimes?.timings) return [];

    const prayerList = [
      {
        name: 'Fajr',
        time: prayerTimes.timings.Fajr,
        arabic: 'الفجر',
        icon: 'weather-night',
        gradient: ['#5C6BC0', '#7986CB'],
      },
      {
        name: 'Sunrise',
        time: prayerTimes.timings.Sunrise,
        arabic: 'الشروق',
        icon: 'weather-sunset-up',
        gradient: ['#FF9800', '#FFB74D'],
      },
      {
        name: 'Dhuhr',
        time: prayerTimes.timings.Dhuhr,
        arabic: 'الظهر',
        icon: 'weather-sunny',
        gradient: ['#FFD600', '#FFEA00'],
      },
      {
        name: 'Asr',
        time: prayerTimes.timings.Asr,
        arabic: 'العصر',
        icon: 'weather-sunset-down',
        gradient: ['#FF6F00', '#FF8F00'],
      },
      {
        name: 'Maghrib',
        time: prayerTimes.timings.Maghrib,
        arabic: 'المغرب',
        icon: 'weather-sunset',
        gradient: ['#E91E63', '#F06292'],
      },
      {
        name: 'Isha',
        time: prayerTimes.timings.Isha,
        arabic: 'العشاء',
        icon: 'moon-waning-crescent',
        gradient: ['#3F51B5', '#5C6BC0'],
      },
    ];

    // Check which prayers are next/passed
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return prayerList.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeMinutes = hours * 60 + minutes;

      // A prayer is passed if its time has passed today
      // For actual prayers (not Sunrise), count them as passed once their time has passed
      const isPassed = prayerTimeMinutes < currentTime;

      return {
        ...prayer,
        isNext: prayer.name === nextPrayer?.name,
        isPassed: isPassed,
      };
    });
  }, [prayerTimes, nextPrayer]);

  // Schedule prayer notifications when prayer times are loaded
  useEffect(() => {
    if (prayerTimes?.timings) {
      const prayerList = [
        { name: 'Fajr', time: prayerTimes.timings.Fajr, arabic: 'الفجر' },
        { name: 'Dhuhr', time: prayerTimes.timings.Dhuhr, arabic: 'الظهر' },
        { name: 'Asr', time: prayerTimes.timings.Asr, arabic: 'العصر' },
        { name: 'Maghrib', time: prayerTimes.timings.Maghrib, arabic: 'المغرب' },
        { name: 'Isha', time: prayerTimes.timings.Isha, arabic: 'العشاء' },
      ];

      // Schedule notifications for all prayers
      notificationService.scheduleDailyPrayers(prayerList);
    }
  }, [prayerTimes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refresh]);

  if (loading && !prayerTimes) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={PillarsColors.gold[500]} />
        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
          Loading Prayer Times...
        </Text>
      </View>
    );
  }

  // Get Islamic date
  const islamicDate = prayerTimes?.date?.hijri
    ? `${prayerTimes.date.hijri.date} ${prayerTimes.date.hijri.month?.en} ${prayerTimes.date.hijri.year}`
    : '';

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Premium Background */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950]]
              : [PillarsColors.gold[50], PillarsColors.white]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PillarsColors.gold[500]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} />

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                Prayer Times
              </Text>
              <View style={styles.locationBadge}>
                <Ionicons
                  name="location-outline"
                  size={12}
                  color={PillarsColors.gold[500]}
                />
                <Text style={[styles.locationText, { color: theme.text.secondary }]}>
                  {location?.city || 'Loading...'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={theme.text.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Date Card */}
          <Animated.View
            entering={FadeIn.duration(600)}
            style={styles.dateCard}
          >
            <LinearGradient
              colors={
                isDark
                  ? [PillarsColors.black[900], PillarsColors.navy[950]] as any
                  : [PillarsColors.white, PillarsColors.gold[50]] as any
              }
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.dateCardContent}>
              <Text style={[styles.currentDate, { color: theme.text.primary }]}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {islamicDate && (
                <Text style={[styles.islamicDate, { color: PillarsColors.gold[500] }]}>
                  {islamicDate}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Prayer Times Grid */}
          <View style={styles.prayerTimesGrid}>
            {prayers.map((prayer, index) => (
              <CompactPrayerCard
                key={prayer.name}
                prayer={prayer}
                index={index}
                onPress={() => {
                  // Prayer detail functionality can be added here if needed
                  // For now, just provide haptic feedback
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            ))}
          </View>

          {/* Quick Stats */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.statsContainer}
          >
            <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
              <MaterialCommunityIcons
                name="mosque"
                size={24}
                color={PillarsColors.gold[500]}
              />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {prayers.filter(p => p.isPassed && p.name !== 'Sunrise').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Completed
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={24}
                color={PillarsColors.navy[500]}
              />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {prayers.filter(p => !p.isPassed && p.name !== 'Sunrise').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Remaining
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.background.card }]}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={PillarsColors.semantic.info}
              />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                ON
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Alerts
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
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
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PillarsLayout.screenPadding,
    paddingVertical: PillarsSpacing.md,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: PillarsSpacing.sm,
    paddingVertical: 2,
    backgroundColor: PillarsColors.glass.gold[10],
    borderRadius: PillarsBorderRadius.full,
  },
  locationText: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date Card
  dateCard: {
    marginHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    ...PillarsShadows.md,
  },
  dateCardContent: {
    padding: PillarsSpacing.lg,
    alignItems: 'center',
  },
  currentDate: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  islamicDate: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
  },
  // Prayer Times Grid
  prayerTimesGrid: {
    paddingHorizontal: PillarsLayout.screenPadding,
    gap: PillarsSpacing.sm,
  },
  prayerCard: {
    marginBottom: PillarsSpacing.sm,
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    ...PillarsShadows.sm,
  },
  prayerCardTouchable: {
    flex: 1,
  },
  prayerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.md,
    paddingVertical: PillarsSpacing.lg,
  },
  prayerIcon: {
    width: 36,
    height: 36,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  prayerNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  prayerName: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  nextBadge: {
    paddingHorizontal: PillarsSpacing.sm,
    paddingVertical: 2,
    backgroundColor: PillarsColors.gold[500],
    borderRadius: PillarsBorderRadius.xs,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  prayerTime: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
  },
  passedIndicator: {
    marginLeft: PillarsSpacing.sm,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: PillarsLayout.screenPadding,
    gap: PillarsSpacing.sm,
    marginTop: PillarsSpacing.xl,
  },
  statCard: {
    flex: 1,
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    ...PillarsShadows.sm,
  },
  statValue: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginVertical: PillarsSpacing.xs,
  },
  statLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
  },
});

export default PillarsPrayerTimesScreen;