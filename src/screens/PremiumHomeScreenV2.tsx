/**
 * Premium Home Screen V2
 * Completely redesigned with Apple-level polish
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

// Components
import { PremiumCard } from '../components/premium/PremiumCard';
import { PremiumButton } from '../components/premium/PremiumButton';
import { PremiumHeader } from '../components/premium/PremiumHeader';
import { PremiumLoadingIndicator, SkeletonLoader } from '../components/premium/PremiumLoadingIndicator';
import {
  LargeTitle,
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Subheadline,
  Caption1,
  Caption2,
  ArabicText,
} from '../components/premium/PremiumText';
import {
  AppleColors,
  Spacing,
  BorderRadius,
  Elevation,
  Typography,
  Layout,
  Animations,
  ZIndex,
} from '../theme/appleDesignSystem';

// Hooks and Context
import { useTheme } from '../contexts/ThemeContext';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { getTheme } from '../theme/themeConfig';
import { PrayerTimesService } from '../services/prayerTimesService';
import { VerseService } from '../services/verseService';
import { StatisticsService } from '../services/statisticsService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Prayer Time Widget Component - Clean & Professional
const PrayerTimeWidget = React.memo<{
  navigation: any;
  isDark: boolean;
  prayerTimes: any;
  loading: boolean;
  nextPrayer: any;
  location: any;
}>(({ navigation, isDark, prayerTimes, loading, nextPrayer, location }) => {
  const { formatTime } = useTimeFormat();
  const theme = getTheme(isDark);
  const allPrayerTimes = useMemo(() => {
    if (!prayerTimes?.timings) return [];
    return PrayerTimesService.getAllPrayerTimes(prayerTimes.timings);
  }, [prayerTimes]);

  const getPrayerIcon = (name: string): string => {
    switch (name) {
      case 'Fajr': return 'partly-sunny-outline';
      case 'Dhuhr': return 'sunny';
      case 'Asr': return 'cloudy-outline';
      case 'Maghrib': return 'moon-outline';
      case 'Isha': return 'moon';
      default: return 'time-outline';
    }
  };

  const getPrayerGradient = (name: string): string[] => {
    switch (name) {
      case 'Fajr': return ['#0A1628', '#1E3A8A', '#5189F1'];  // Dawn - Deep to light blue
      case 'Dhuhr': return ['#D4A017', '#FFD54D', '#FFF0B3'];  // Noon - Golden gradient
      case 'Asr': return ['#1E3A8A', '#D4A017', '#FFD54D'];   // Afternoon - Blue to gold
      case 'Maghrib': return ['#0F1B47', '#1E3A8A', '#D4A017']; // Sunset - Dark blue to gold
      case 'Isha': return ['#0A1628', '#142459', '#1E3A8A'];   // Night - Deep midnight blues
      default: return AppleColors.gradients.premium;
    }
  };

  if (loading) {
    return (
      <View style={styles.prayerWidgetContainer}>
        <PremiumCard
          variant="elevated"
          style={styles.nextPrayerCard}
        >
          <SkeletonLoader lines={3} />
        </PremiumCard>
        <View style={styles.prayerTimesScroll}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.prayerTimeCard}>
              <SkeletonLoader lines={2} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.prayerWidgetContainer}>
      {/* Next Prayer Card - Clean Design */}
      {nextPrayer && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('PrayerTimes');
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <LinearGradient
              colors={getPrayerGradient(nextPrayer.name) as any}
              style={styles.nextPrayerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Location Badge */}
              <View style={styles.locationBadge}>
                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.9)" />
                <Caption2 color="rgba(255,255,255,0.9)" style={{ marginLeft: 4 }}>
                  {location?.city || 'Loading...'}
                </Caption2>
              </View>

              {/* Main Content - Simplified Layout */}
              <View style={styles.nextPrayerContent}>
                <View style={styles.nextPrayerLeft}>
                  <Ionicons
                    name={getPrayerIcon(nextPrayer.name) as any}
                    size={40}
                    color="#FFFFFF"
                    style={styles.nextPrayerIcon}
                  />
                  <View style={styles.nextPrayerInfo}>
                    <Caption2 color="rgba(255,255,255,0.8)" weight="medium">
                      NEXT PRAYER
                    </Caption2>
                    <Title2 color="#FFFFFF" weight="bold" numberOfLines={1}>
                      {nextPrayer.name}
                    </Title2>
                    <Subheadline
                      color="rgba(255,255,255,0.9)"
                      weight="medium"
                      numberOfLines={1}
                    >
                      {nextPrayer.arabic}
                    </Subheadline>
                  </View>
                </View>

                <View style={styles.nextPrayerRight}>
                  <Title2 color="#FFFFFF" weight="bold" numberOfLines={1}>
                    {formatTime(nextPrayer.time)}
                  </Title2>
                  <Caption1 color="rgba(255,255,255,0.8)" numberOfLines={1}>
                    in {nextPrayer.timeUntil}
                  </Caption1>

                  {/* Simple Progress Circle */}
                  <View style={styles.progressCircle}>
                    <Caption2 color="#FFFFFF" weight="bold">
                      {Math.round(nextPrayer.percentage)}%
                    </Caption2>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${nextPrayer.percentage}%` }
                  ]}
                />
              </View>
            </LinearGradient>
          </MotiView>
        </TouchableOpacity>
      )}

      {/* Prayer Times Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.prayerTimesScroll}
      >
        {allPrayerTimes
          .filter((prayer) => prayer.name !== 'Sunrise')
          .map((prayer, index) => {
            const isNext = prayer.name === nextPrayer?.name;
            const gradient = getPrayerGradient(prayer.name);

            return (
              <MotiView
                key={prayer.name}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 50, type: 'spring' }}
                style={styles.prayerTimeCardContainer}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('PrayerTimes');
                  }}
                >
                  <PremiumCard
                    variant={isNext ? 'gradient' : 'elevated'}
                    gradient={isNext ? gradient : undefined}
                    style={styles.prayerTimeCard}
                    borderRadius="medium"
                  >
                    {isNext && (
                      <View style={styles.nextBadge}>
                        <Caption2 color="#FFFFFF" weight="bold" numberOfLines={1}>
                          NEXT
                        </Caption2>
                      </View>
                    )}

                    <Ionicons
                      name={getPrayerIcon(prayer.name) as any}
                      size={28}
                      color={isNext ? '#FFFFFF' : gradient[0]}
                      style={styles.prayerCardIcon}
                    />

                    <Caption2
                      color={isNext ? 'rgba(255,255,255,0.9)' : theme.text.secondary}
                      weight="medium"
                      style={styles.prayerCardName}
                      numberOfLines={1}
                    >
                      {prayer.name.toUpperCase()}
                    </Caption2>

                    <Headline
                      color={isNext ? '#FFFFFF' : theme.text.primary}
                      weight="bold"
                      numberOfLines={1}
                      style={styles.prayerCardTime}
                    >
                      {formatTime(prayer.time)}
                    </Headline>
                  </PremiumCard>
                </TouchableOpacity>
              </MotiView>
            );
          })}
      </ScrollView>
    </View>
  );
});

// Quick Action Card Component
const QuickActionCard = React.memo<{
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
  index: number;
}>(({ icon, title, color, onPress, index }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: index * 100, type: 'spring' }}
  >
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <PremiumCard
        variant="flat"
        style={styles.quickActionCard}
        haptic
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon as any} size={28} color={color} />
        </View>
        <Caption1 weight="medium" align="center">
          {title}
        </Caption1>
      </PremiumCard>
    </TouchableOpacity>
  </MotiView>
));

// Feature Card Component
const FeatureCard = React.memo<{
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  onPress: () => void;
  index: number;
}>(({ title, subtitle, icon, gradient, onPress, index }) => (
  <MotiView
    from={{ opacity: 0, translateX: -30 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ delay: index * 150, type: 'spring' }}
  >
    <PremiumCard
      variant="gradient"
      gradient={gradient}
      style={styles.featureCard}
      onPress={onPress}
      haptic
    >
      <View style={styles.featureContent}>
        <View style={styles.featureIconContainer}>
          <Ionicons name={icon as any} size={32} color="#FFFFFF" />
        </View>
        <View style={styles.featureTextContainer}>
          <Title3 color="#FFFFFF">{title}</Title3>
          <Subheadline color="rgba(255, 255, 255, 0.9)">
            {subtitle}
          </Subheadline>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.7)" />
      </View>
    </PremiumCard>
  </MotiView>
));

// Daily Verse Component
const DailyVerse = React.memo<{ isDark: boolean }>(({ isDark }) => {
  const [verse, setVerse] = useState({
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    reference: 'Al-Fatihah 1:1',
  });
  const [loadingVerse, setLoadingVerse] = useState(true);

  useEffect(() => {
    loadDailyVerse();
  }, []);

  const loadDailyVerse = async () => {
    try {
      setLoadingVerse(true);
      const dailyVerse = await VerseService.getDailyVerse();
      setVerse({
        arabic: dailyVerse.arabic,
        translation: dailyVerse.translation,
        reference: dailyVerse.reference,
      });
    } catch (error) {
      console.error('Error loading daily verse:', error);
    } finally {
      setLoadingVerse(false);
    }
  };

  return (
    <PremiumCard
      variant="elevated"
      style={styles.verseCard}
      animated
      delay={400}
    >
      <View style={styles.verseHeader}>
        <Ionicons
          name="book-outline"
          size={20}
          color={AppleColors.islamic.gold[500]}
        />
        <Caption1 color={AppleColors.islamic.gold[500]} style={{ marginLeft: 8 }}>
          Verse of the Day
        </Caption1>
      </View>
      {loadingVerse ? (
        <View style={{ paddingVertical: 20 }}>
          <SkeletonLoader lines={3} />
        </View>
      ) : (
        <>
          <ArabicText variant="title1" style={styles.arabicVerse}>
            {verse.arabic}
          </ArabicText>
          <Body align="center" color={isDark ? AppleColors.semantic.textDark.secondary : AppleColors.semantic.text.secondary}>
            {verse.translation}
          </Body>
          <Caption1 color={AppleColors.islamic.gold[500]} align="center" style={styles.verseReference}>
            {verse.reference}
          </Caption1>
        </>
      )}
    </PremiumCard>
  );
});

// Main Home Screen Component
const PremiumHomeScreenV2: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const {
    prayerTimes,
    loading: prayerLoading,
    refresh,
    nextPrayer,
    location,
    error
  } = usePrayerTimes();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return 'Good Night';
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  }, []);

  const islamicDate = useMemo(() => {
    if (prayerTimes?.date?.hijri) {
      const hijri = prayerTimes.date.hijri;
      return `${hijri.date} ${hijri.month?.en || ''} ${hijri.year}`;
    }
    // Fallback to current approximate Hijri date
    return new Date().toLocaleDateString('en-US-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [prayerTimes]);

  // Load statistics
  useEffect(() => {
    loadStatistics();
    StatisticsService.initializeStats();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const summary = await StatisticsService.getStatsSummary();
      setStats(summary);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([
      refresh(),
      loadStatistics()
    ]);
    setTimeout(() => setRefreshing(false), 1500);
  }, [refresh]);

  const quickActions = [
    { icon: 'compass-outline', title: 'Qibla', color: AppleColors.islamic.royalBlue[500], route: 'Qibla' },
    { icon: 'counter', title: 'Tasbih', color: AppleColors.islamic.gold[500], route: 'Tasbih' },
  ];

  const features = [
    // Features section removed - 99 Names and Hadith no longer available
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Premium Header */}
      <PremiumHeader
        title="Hayya"
        transparent
        blur
        scrollY={scrollY}
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate('More', { screen: 'Settings' })}
      />

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppleColors.islamic.royalBlue[500]}
          />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={AppleColors.gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Caption1 color="rgba(255, 255, 255, 0.9)">{greeting}</Caption1>
            <LargeTitle color="#FFFFFF" style={styles.heroGreeting}>
              Assalamu Alaikum
            </LargeTitle>
            <View style={styles.dateContainer}>
              <Subheadline color="rgba(255, 255, 255, 0.9)">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Subheadline>
              <Caption1 color="rgba(255, 255, 255, 0.8)" style={{ marginTop: 4 }}>
                {islamicDate}
              </Caption1>
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Error Message */}
          {error && (
            <PremiumCard variant="flat" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Ionicons name="warning-outline" size={24} color={AppleColors.system.red} />
                <Body style={{ marginLeft: 12, flex: 1 }} color={AppleColors.system.red}>
                  {error}
                </Body>
              </View>
            </PremiumCard>
          )}

          {/* Prayer Times Widget */}
          <PrayerTimeWidget
            navigation={navigation}
            isDark={isDark}
            prayerTimes={prayerTimes}
            loading={prayerLoading}
            nextPrayer={nextPrayer}
            location={location}
          />

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Title3 style={styles.sectionTitle}>Quick Access</Title3>
              <TouchableOpacity onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'More features will be available soon, In Sha Allah');
              }}>
                <Caption1 color={AppleColors.system.blue}>See All</Caption1>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContainer}
            >
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.title}
                  {...action}
                  index={index}
                  onPress={() => {
                    if (action.route === 'Qibla') {
                      navigation.navigate('Qibla');
                    } else {
                      navigation.navigate('More', { screen: action.route });
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* Feature Cards section removed - no longer needed */}

          {/* Daily Verse */}
          <DailyVerse isDark={isDark} />

          {/* Stats Card */}
          <PremiumCard
            variant="flat"
            style={styles.statsCard}
            animated
            delay={500}
          >
            {loadingStats ? (
              <SkeletonLoader lines={2} />
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Title2 color={AppleColors.islamic.royalBlue[500]}>
                    {stats?.today?.prayersCompleted?.length || 0}
                  </Title2>
                  <Caption1 color={AppleColors.semantic.text.secondary}>Prayers Today</Caption1>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Title2 color={AppleColors.islamic.gold[500]}>
                    {stats?.today?.dhikrCount || 0}
                  </Title2>
                  <Caption1 color={AppleColors.semantic.text.secondary}>Daily Dhikr</Caption1>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Title2 color={AppleColors.islamic.royalBlue[500]}>
                    {stats?.streak || 0}
                  </Title2>
                  <Caption1 color={AppleColors.semantic.text.secondary}>Day Streak</Caption1>
                </View>
              </View>
            )}
          </PremiumCard>
        </View>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Layout.safeArea.top + Layout.headerHeight,
    paddingBottom: Layout.tabBarHeight + Spacing.xl,
  },
  heroSection: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  heroGreeting: {
    marginVertical: Spacing.xs,
  },
  dateContainer: {
    marginTop: Spacing.sm,
  },
  contentContainer: {
    paddingHorizontal: Spacing.containerPadding,
  },
  section: {
    marginBottom: Spacing.sectionSpacing,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  // Prayer Widget Styles - Clean & Professional
  prayerWidgetContainer: {
    marginBottom: Spacing.sectionSpacing,
  },
  nextPrayerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card.medium,
    marginBottom: Spacing.md,
    overflow: 'hidden' as const,
    minHeight: 150,
    ...Elevation.level2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  nextPrayerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  nextPrayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: '60%',
  },
  nextPrayerIcon: {
    marginRight: Spacing.md,
  },
  nextPrayerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nextPrayerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: Spacing.sm,
  },
  progressCircle: {
    marginTop: Spacing.xs,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden' as const,
    marginTop: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  prayerTimesScroll: {
    paddingRight: Spacing.containerPadding,
  },
  prayerTimeCardContainer: {
    marginRight: Spacing.sm,
  },
  prayerTimeCard: {
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    width: 100,
    position: 'relative' as const,
  },
  prayerCardIcon: {
    marginBottom: 4,
  },
  prayerCardName: {
    fontSize: 10,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  prayerCardTime: {
    fontSize: 14,
  },
  nextBadge: {
    position: 'absolute' as const,
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
  },
  quickActionsContainer: {
    paddingRight: Spacing.lg,
  },
  quickActionCard: {
    width: 85,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featureCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  verseCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  arabicVerse: {
    marginBottom: Spacing.md,
  },
  verseReference: {
    marginTop: Spacing.md,
  },
  statsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: AppleColors.semantic.separator.nonOpaque,
  },
  errorCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: `${AppleColors.system.red}10`,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PremiumHomeScreenV2;