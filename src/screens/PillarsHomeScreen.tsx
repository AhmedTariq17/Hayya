/**
 * Ultra-Premium Home Screen - Apple Level Polish
 * The most perfect Hayya app home screen ever created
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
  SlideInRight,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
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
import { PillarsCard, ActionCard, StatCard } from '../components/ui/PillarsCard';
import { StatisticsService } from '../services/statisticsService';
import { VerseService } from '../services/verseService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickActionItem {
  id: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  title: string;
  color: string;
  route: string;
}

interface DailyVerseData {
  arabic: string;
  translation: string;
  reference: string;
}

// Compact Prayer Widget Component
const CompactPrayerWidget: React.FC<{
  nextPrayer: any;
  prayerTimes: any;
  onPress: () => void;
  isDark: boolean;
}> = ({ nextPrayer, prayerTimes, onPress, isDark }) => {
  const theme = getPillarsTheme(isDark);
  const { formatTime } = useTimeFormat();
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    if (nextPrayer?.percentage) {
      progressAnimation.value = withSpring(nextPrayer.percentage, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [nextPrayer]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value}%`,
  }));

  if (!prayerTimes) return null;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <PillarsCard
        variant="gradient"
        gradient={
          isDark
            ? [PillarsColors.black[900], PillarsColors.navy[950]]
            : [PillarsColors.white, PillarsColors.gold[50]]
        }
        style={styles.prayerWidget}
        shadow="lg"
      >
        {/* Header */}
        <View style={styles.prayerHeader}>
          <View style={styles.prayerHeaderLeft}>
            <MaterialCommunityIcons
              name="mosque"
              size={20}
              color={PillarsColors.gold[500]}
            />
            <Text style={[styles.nextPrayerLabel, { color: theme.text.secondary }]}>
              Next Prayer
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text.tertiary}
          />
        </View>

        {/* Main Content */}
        <View style={styles.prayerContent}>
          <View style={styles.prayerTimeInfo}>
            <Text style={[styles.prayerName, { color: PillarsColors.gold[500] }]}>
              {nextPrayer?.name || 'Loading...'}
            </Text>
            <Text style={[styles.prayerTime, { color: theme.text.primary }]}>
              {nextPrayer ? formatTime(nextPrayer.time) : '--:--'}
            </Text>
          </View>
          <View style={styles.prayerCountdown}>
            <Text style={[styles.timeUntilLabel, { color: theme.text.tertiary }]}>
              Time Until
            </Text>
            <Text style={[styles.timeUntilValue, { color: theme.text.secondary }]}>
              {nextPrayer?.timeUntil || '--'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.background.tertiary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: PillarsColors.gold[500] },
                progressStyle,
              ]}
            />
          </View>
        </View>
      </PillarsCard>
    </TouchableOpacity>
  );
};

const PillarsHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const { formatTime } = useTimeFormat();
  const scrollY = useSharedValue(0);

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<any>(null);
  const [verse, setVerse] = useState<DailyVerseData>({
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    reference: 'Al-Fatihah 1:1',
  });

  // Hooks
  const {
    prayerTimes,
    loading: prayerLoading,
    refresh,
    nextPrayer,
    location,
  } = usePrayerTimes();

  // Greeting based on time
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 5) return 'Qiyam Time';
    if (hour < 12) return 'Good Morning';
    if (hour < 15) return 'Good Afternoon';
    if (hour < 18) return 'Good Evening';
    if (hour < 20) return 'Maghrib Time';
    return 'Good Night';
  }, [currentTime]);

  // Quick Actions - Optimized for 2x2 grid
  const quickActions: QuickActionItem[] = [
    {
      id: 'prayer',
      icon: 'time',
      iconFamily: 'Ionicons',
      title: 'Prayer',
      color: PillarsColors.gold[500],
      route: 'PrayerTimes',
    },
    {
      id: 'qibla',
      icon: 'compass',
      iconFamily: 'MaterialCommunityIcons',
      title: 'Qibla',
      color: PillarsColors.navy[500],
      route: 'Qibla',
    },
    {
      id: 'tasbih',
      icon: 'counter',
      iconFamily: 'MaterialCommunityIcons',
      title: 'Tasbih',
      color: PillarsColors.semantic.success,
      route: 'Tasbih',
    },
    {
      id: 'settings',
      icon: 'settings',
      iconFamily: 'Ionicons',
      title: 'Settings',
      color: PillarsColors.semantic.info,
      route: 'Settings',
    },
  ];

  // Load data
  useEffect(() => {
    const initializeApp = async () => {
      await StatisticsService.initializeStats();
      await StatisticsService.recordAppOpen(); // Record that user opened the app today
      loadStatistics();
      loadDailyVerse();
    };

    initializeApp();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second for performance

    return () => clearInterval(timer);
  }, []);

  const loadStatistics = async () => {
    try {
      const summary = await StatisticsService.getStatsSummary();
      setStats(summary);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadDailyVerse = async () => {
    try {
      const dailyVerse = await VerseService.getDailyVerse();
      setVerse({
        arabic: dailyVerse.arabic,
        translation: dailyVerse.translation,
        reference: dailyVerse.reference,
      });
    } catch (error) {
      console.error('Error loading daily verse:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refresh(), loadStatistics(), loadDailyVerse()]);
    setTimeout(() => setRefreshing(false), 1000);
  }, [refresh]);

  const handleQuickAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route === 'PrayerTimes' || route === 'Qibla' || route === 'Settings') {
      navigation.navigate(route);
    } else if (route === 'Tasbih') {
      navigation.navigate('Tasbih');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Premium Background - Subtle and Elegant */}
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={
            isDark
              ? [
                  PillarsColors.navy[950],
                  PillarsColors.black[950],
                  PillarsColors.black[900],
                ]
              : [
                  PillarsColors.gold[50],
                  PillarsColors.white,
                  PillarsColors.navy[50],
                ]
          }
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Subtle mesh gradient overlay */}
        <View style={styles.meshOverlay} />
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
          {/* Compact Header */}
          <View style={styles.header}>
            <Animated.View entering={FadeIn.duration(800)}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={[styles.greetingText, { color: theme.text.secondary }]}>
                    {greeting}
                  </Text>
                  <Text style={[styles.salamText, { color: theme.text.primary }]}>
                    Assalamu Alaikum
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.notificationButton, { backgroundColor: theme.background.card }]}
                  onPress={() => {
                    // Notification feature can be added here
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={theme.text.primary}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Prayer Widget */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <CompactPrayerWidget
                nextPrayer={nextPrayer}
                prayerTimes={prayerTimes}
                onPress={() => navigation.navigate('PrayerTimes')}
                isDark={isDark}
              />
            </Animated.View>

            {/* Stats Row - Streak Only */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={styles.streakContainer}
            >
              <View style={[styles.streakCard, { backgroundColor: theme.background.card }]}>
                <View style={[styles.streakIconContainer, { backgroundColor: `${PillarsColors.semantic.error}15` }]}>
                  <Ionicons
                    name="flame"
                    size={32}
                    color={PillarsColors.semantic.error}
                  />
                </View>
                <View style={styles.streakContent}>
                  <Text style={[styles.streakValue, { color: theme.text.primary }]}>
                    {stats?.streak || 0}
                  </Text>
                  <Text style={[styles.streakLabel, { color: theme.text.secondary }]}>
                    Day Streak
                  </Text>
                  <Text style={[styles.streakDescription, { color: theme.text.tertiary }]}>
                    Keep coming back daily!
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Quick Actions - Perfect 2x2 Grid */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.quickActions}
            >
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Quick Access
              </Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.quickActionCard,
                      { backgroundColor: theme.background.card },
                    ]}
                    onPress={() => handleQuickAction(action.route)}
                    activeOpacity={0.7}
                  >
                    <Animated.View
                      entering={SlideInRight.delay(index * 50).springify()}
                      style={styles.quickActionContent}
                    >
                      <View
                        style={[
                          styles.quickActionIcon,
                          { backgroundColor: `${action.color}15` },
                        ]}
                      >
                        {action.iconFamily === 'MaterialCommunityIcons' ? (
                          <MaterialCommunityIcons
                            name={action.icon as any}
                            size={24}
                            color={action.color}
                          />
                        ) : (
                          <Ionicons
                            name={action.icon as any}
                            size={24}
                            color={action.color}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.quickActionTitle,
                          { color: theme.text.primary },
                        ]}
                      >
                        {action.title}
                      </Text>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Daily Verse - Compact */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={styles.verseSection}
            >
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Daily Verse
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Coming Soon', 'Al-Quran feature will be available soon, In Sha Allah');
                }}
              >
                <PillarsCard
                  variant="gradient"
                  gradient={
                    isDark
                      ? [PillarsColors.navy[900], PillarsColors.black[900]]
                      : [PillarsColors.gold[50], PillarsColors.white]
                  }
                  style={styles.verseCard}
                  shadow="md"
                >
                  <View style={styles.verseContent}>
                    <Text style={styles.arabicVerse}>{verse.arabic}</Text>
                    <Text
                      style={[styles.verseTranslation, { color: theme.text.secondary }]}
                    >
                      {verse.translation}
                    </Text>
                    <View style={styles.verseFooter}>
                      <Text style={[styles.verseReference, { color: PillarsColors.gold[600] }]}>
                        {verse.reference}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={PillarsColors.gold[500]}
                      />
                    </View>
                  </View>
                </PillarsCard>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  header: {
    paddingHorizontal: PillarsLayout.screenPadding,
    paddingTop: PillarsSpacing.md,
    paddingBottom: PillarsSpacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  salamText: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...PillarsShadows.sm,
  },
  content: {
    paddingHorizontal: PillarsLayout.screenPadding,
  },
  // Prayer Widget Styles
  prayerWidget: {
    marginBottom: PillarsSpacing.lg,
    padding: PillarsSpacing.lg,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PillarsSpacing.md,
  },
  prayerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.xs,
  },
  nextPrayerLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: PillarsSpacing.md,
  },
  prayerTimeInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: PillarsTypography.fontSize.xxl,
    fontWeight: '700',
    marginBottom: 2,
  },
  prayerTime: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '600',
  },
  prayerCountdown: {
    alignItems: 'flex-end',
  },
  timeUntilLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    marginBottom: 2,
  },
  timeUntilValue: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: PillarsSpacing.xs,
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
  // Streak Container
  streakContainer: {
    marginBottom: PillarsSpacing.xl,
  },
  streakCard: {
    flexDirection: 'row',
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.lg,
    alignItems: 'center',
    ...PillarsShadows.md,
  },
  streakIconContainer: {
    width: 64,
    height: 64,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  streakContent: {
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  streakLabel: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  streakDescription: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
  },
  // Quick Actions
  quickActions: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PillarsSpacing.sm,
  },
  quickActionCard: {
    width: (SCREEN_WIDTH - PillarsLayout.screenPadding * 2 - PillarsSpacing.sm) / 2,
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    ...PillarsShadows.sm,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PillarsSpacing.sm,
  },
  quickActionTitle: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
  },
  // Verse Section
  verseSection: {
    marginBottom: PillarsSpacing.xl,
  },
  verseCard: {
    padding: PillarsSpacing.lg,
  },
  verseContent: {
    alignItems: 'center',
  },
  arabicVerse: {
    fontSize: 22,
    fontWeight: '700',
    color: PillarsColors.gold[500],
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: PillarsSpacing.md,
  },
  verseTranslation: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: PillarsSpacing.md,
  },
  verseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  verseReference: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
  },
});

export default PillarsHomeScreen;