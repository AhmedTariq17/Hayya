import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '../components/common/GlassCard';
import { Heading, Subheading, Body, ArabicText, Caption } from '../components/common/AnimatedText';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION } from '../theme/constants';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface QuickActionCardProps {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

const QuickActionCard = React.memo<QuickActionCardProps>(({ icon, title, color, onPress, delay = 0 }) => (
  <Animated.View entering={FadeInRight.delay(delay).springify()}>
    <GlassCard
      style={styles.quickActionCard}
      onPress={onPress}
      gradient={[`${color}15`, `${color}08`] as any}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.quickActionTitle} numberOfLines={1}>
        {title}
      </Text>
    </GlassCard>
  </Animated.View>
));

interface FeatureCardProps {
  title: string;
  subtitle: string;
  icon: string;
  gradient: string[];
  onPress: () => void;
  style?: any;
}

const FeatureCard = React.memo<FeatureCardProps>(({ title, subtitle, icon, gradient, onPress, style }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={onPress}
    style={[styles.featureCard, style]}
  >
    <LinearGradient
      colors={gradient as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.featureGradient}
    >
      <View style={styles.featureContent}>
        <View style={styles.featureIconContainer}>
          <Ionicons name={icon as any} size={32} color="#FFFFFF" />
        </View>
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { prayerTimes, loading: prayerLoading, refresh, nextPrayer } = usePrayerTimes();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -50],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, [refresh]);

  const backgroundColor = isDark ? theme.background.secondary : theme.background.secondary;
  const textPrimary = theme.text.primary;
  const textSecondary = theme.text.secondary;
  const primaryColor = theme.primary;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <LinearGradient
          colors={
            isDark
              ? [theme.primary, '#1F5740'] as any
              : [theme.primary, theme.primaryDark] as any
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={primaryColor}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <Text style={styles.salamText}>Assalamu Alaikum, Brother</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => {
                  // Notification feature placeholder
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Prayer Time Card */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.prayerCardContainer}>
              <GlassCard style={styles.prayerCard} elevation="lg">
                <View style={styles.prayerCardContent}>
                  <View style={styles.prayerCardHeader}>
                    <View>
                      <Text style={[styles.nextPrayerLabel, { color: textSecondary }]}>
                        {prayerTimes ? 'Next Prayer' : 'Prayer Times'}
                      </Text>
                      <Text style={[styles.nextPrayerName, { color: primaryColor }]}>
                        {prayerTimes?.timings ? (nextPrayer?.name || 'Loading...') : 'Loading...'}
                      </Text>
                    </View>
                    <View style={styles.prayerTimeContainer}>
                      <Text style={[styles.prayerTime, { color: textPrimary }]}>
                        {prayerTimes?.timings ? (nextPrayer?.time || '--:--') : '--:--'}
                      </Text>
                      <Text style={[styles.timeRemaining, { color: textSecondary }]}>
                        {prayerTimes?.timings && nextPrayer?.timeUntil ? nextPrayer.timeUntil : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.prayerCardDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                  <View style={styles.prayerTimesGrid}>
                    {[
                      { name: 'Fajr', time: prayerTimes?.timings?.Fajr || '--:--', icon: 'sunny-outline' },
                      { name: 'Dhuhr', time: prayerTimes?.timings?.Dhuhr || '--:--', icon: 'partly-sunny-outline' },
                      { name: 'Asr', time: prayerTimes?.timings?.Asr || '--:--', icon: 'cloudy-outline' },
                      { name: 'Maghrib', time: prayerTimes?.timings?.Maghrib || '--:--', icon: 'moon-outline' },
                      { name: 'Isha', time: prayerTimes?.timings?.Isha || '--:--', icon: 'moon' },
                    ].map((prayer, index) => (
                      <View key={prayer.name} style={styles.prayerTimeItem}>
                        <Text style={[styles.prayerTimeName, { color: textSecondary }]}>
                          {prayer.name}
                        </Text>
                        <Text style={[styles.prayerTimeValue, { color: textPrimary }]}>
                          {prayer.time}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Access</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: primaryColor }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsContainer}
            >
              <QuickActionCard
                icon="compass-outline"
                title="Qibla"
                color={COLORS.accent.teal}
                onPress={() => navigation.navigate('Qibla')}
                delay={100}
              />
              <QuickActionCard
                icon="counter"
                title="Tasbih"
                color={COLORS.accent.purple}
                onPress={() => navigation.navigate('Tasbih')}
                delay={200}
              />
              <QuickActionCard
                icon="calendar-month"
                title="Calendar"
                color={COLORS.accent.sky}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Coming Soon', 'Islamic Calendar feature will be available soon, In Sha Allah');
                }}
                delay={300}
              />
            </ScrollView>
          </View>

          {/* Feature Cards */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Explore</Text>

            <FeatureCard
              title="Al-Quran"
              subtitle="Read, Listen & Learn the Holy Quran"
              icon="book"
              gradient={[COLORS.primary.main, COLORS.primary.light]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Al-Quran feature will be available soon, In Sha Allah');
              }}
            />

          </View>

          {/* Daily Verse */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Verse of the Day</Text>
            <GlassCard style={styles.verseCard}>
              <ArabicText fontSize={26} style={[styles.arabicVerse, { color: primaryColor }]}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </ArabicText>
              <Text style={[styles.verseTranslation, { color: textSecondary }]}>
                In the name of Allah, the Most Gracious, the Most Merciful
              </Text>
              <Text style={[styles.verseReference, { color: primaryColor }]}>Al-Fatihah 1:1</Text>
            </GlassCard>
          </View>

          <View style={{ height: 120 }} />
        </AnimatedScrollView>
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
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.32,
    zIndex: 0,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  salamText: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: RADIUS.round,
    ...SHADOWS.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.semantic.error,
  },
  prayerCardContainer: {
    marginTop: SPACING.sm,
  },
  prayerCard: {
    padding: 0,
    overflow: 'hidden',
  },
  prayerCardContent: {
    padding: SPACING.lg,
  },
  prayerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nextPrayerLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  nextPrayerName: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  timeRemaining: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    marginTop: 4,
  },
  prayerCardDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  prayerTimeItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 60,
  },
  prayerIcon: {
    marginBottom: 6,
  },
  prayerTimeName: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    textAlign: 'center',
  },
  prayerTimeValue: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  quickActionsContainer: {
    paddingRight: SPACING.lg,
  },
  quickActionCard: {
    width: 85,
    padding: SPACING.md,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    textAlign: 'center',
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  featureGradient: {
    padding: SPACING.lg,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  },
  verseCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  arabicVerse: {
    marginBottom: SPACING.md,
    textAlign: 'center',
    lineHeight: 40,
  },
  verseTranslation: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.subheadline * 1.6,
    marginBottom: SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
});

export default HomeScreen;
