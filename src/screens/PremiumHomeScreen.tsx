import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
  Image,
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
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Premium Components
import { PremiumCard } from '../components/common/PremiumCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { PremiumHeader } from '../components/common/PremiumHeader';
import { IslamicPattern } from '../components/common/IslamicPattern';
import { SkeletonLoader, PrayerTimeSkeleton } from '../components/common/SkeletonLoader';
import { GlassCard } from '../components/common/GlassCard';
// import { AnimatedText } from '../components/common/AnimatedText';

// Theme and Utils
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION } from '../theme/constants';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface PremiumHomeScreenProps {
  navigation: any;
}

const PremiumHomeScreen: React.FC<PremiumHomeScreenProps> = ({ navigation }) => {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('Brother');

  const { prayerTimes, loading: prayerLoading, refresh, nextPrayer } = usePrayerTimes();

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 5) {
      setGreeting('Qiyam Time');
    } else if (hour < 12) {
      setGreeting('Sabah al-Khair');
    } else if (hour < 15) {
      setGreeting('Good Afternoon');
    } else if (hour < 18) {
      setGreeting('Asr Time');
    } else if (hour < 20) {
      setGreeting('Masa al-Khair');
    } else {
      setGreeting('Good Night');
    }

    // Setup notifications
    setupPrayerNotifications();

    return () => clearInterval(timer);
  }, []);

  const setupPrayerNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      // Setup prayer time notifications
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 150],
      [0, -100],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 150],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  const patternAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 200],
      [1, 1.2],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, 200],
      [0.1, 0.02],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const QuickActionCard = ({ icon, title, subtitle, color, onPress, delay = 0 }: any) => (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
      <PremiumCard
        style={styles.quickActionCard}
        onPress={onPress}
        gradient={[`${color}20`, `${color}10`]}
        scaleFeedback
        glowEffect
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}30` }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </PremiumCard>
    </Animated.View>
  );

  const FeatureCard = ({ title, subtitle, description, icon, gradient, onPress, style, delay = 0 }: any) => (
    <Animated.View entering={ZoomIn.delay(delay).springify()} style={style}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.featureCard}
      >
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featureGradient}
        >
          <View style={styles.featurePattern}>
            <IslamicPattern type="star" size={150} color="rgba(255,255,255,0.1)" animated={false} />
          </View>
          <View style={styles.featureContent}>
            <View style={styles.featureIconContainer}>
              <Ionicons name={icon} size={36} color={COLORS.text.inverse} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureSubtitle}>{subtitle}</Text>
              {description && (
                <Text style={styles.featureDescription}>{description}</Text>
              )}
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <Animated.View style={[styles.backgroundPattern, patternAnimatedStyle]}>
        <IslamicPattern type="geometric" size={SCREEN_WIDTH * 1.5} color={COLORS.primary.main} />
      </Animated.View>

      {/* Animated Header Background */}
      <Animated.View style={[styles.headerBackground, headerAnimatedStyle]}>
        <LinearGradient
          colors={[COLORS.primary.main, COLORS.primary.dark, COLORS.primary.dark + 'CC'] as any}
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
              tintColor={COLORS.primary.main}
              progressViewOffset={20}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Animated.View entering={FadeIn.duration(800)}>
              <View style={styles.headerTop}>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>{greeting}</Text>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>Assalamu Alaikum, {userName}</Text>
                    <Text style={styles.dateText}>
                      {currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.notificationButton}
                  onPress={() => {
                    // Notification feature placeholder
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] as any}
                    style={styles.notificationGradient}
                  >
                    <Ionicons name="notifications-outline" size={24} color={COLORS.text.inverse} />
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>3</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Premium Prayer Time Card */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              {prayerLoading ? (
                <PrayerTimeSkeleton />
              ) : (
                <PremiumCard
                  style={styles.prayerCard}
                  elevation="premium"
                  gradient={['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.95)'] as any}
                  borderGradient
                >
                  <LinearGradient
                    colors={['rgba(45,126,91,0.05)', 'transparent'] as any}
                    style={StyleSheet.absoluteFillObject}
                  />

                  <View style={styles.prayerCardHeader}>
                    <View style={styles.nextPrayerInfo}>
                      <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
                      <View style={styles.prayerNameRow}>
                        <Text style={styles.nextPrayerName}>{nextPrayer?.name || 'Fajr'}</Text>
                        <View style={styles.prayerBadge}>
                          <Text style={styles.prayerBadgeText}>In 2h 15m</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.prayerTimeContainer}>
                      <Text style={styles.prayerTime}>{nextPrayer?.time || '05:30 AM'}</Text>
                      <TouchableOpacity style={styles.alarmButton}>
                        <Ionicons name="alarm" size={20} color={COLORS.primary.main} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.prayerProgress}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={[COLORS.primary.light, COLORS.primary.main] as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: '35%' }]}
                      />
                    </View>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.prayerTimesScroll}
                    contentContainerStyle={styles.prayerTimesContent}
                  >
                    {['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer, index) => (
                      <View key={prayer} style={styles.prayerTimeItem}>
                        <View style={[
                          styles.prayerIcon,
                          index === 0 && styles.activePrayerIcon
                        ]}>
                          <MaterialCommunityIcons
                            name={index === 0 ? 'weather-sunset-up' : 'mosque'}
                            size={16}
                            color={index === 0 ? COLORS.text.inverse : COLORS.primary.main}
                          />
                        </View>
                        <Text style={[
                          styles.prayerTimeName,
                          index === 0 && styles.activePrayerName
                        ]}>{prayer}</Text>
                        <Text style={[
                          styles.prayerTimeValue,
                          index === 0 && styles.activePrayerTime
                        ]}>
                          {['05:30', '07:00', '12:30', '15:45', '18:30', '20:00'][index]}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </PremiumCard>
              )}
            </Animated.View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickActionsGrid}>
              <QuickActionCard
                icon="compass"
                title="Qibla"
                subtitle="Find Direction"
                color={COLORS.accent.teal}
                onPress={() => navigation.navigate('Qibla')}
                delay={100}
              />
              <QuickActionCard
                icon="counter"
                title="Tasbih"
                subtitle="Digital Counter"
                color={COLORS.accent.purple}
                onPress={() => navigation.navigate('Tasbih')}
                delay={150}
              />
              <QuickActionCard
                icon="calendar-star"
                title="Calendar"
                subtitle="Islamic Dates"
                color={COLORS.accent.sky}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Coming Soon', 'Islamic Calendar feature will be available soon, In Sha Allah');
                }}
                delay={200}
              />
            </View>
          </View>

          {/* Featured Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore</Text>

            <FeatureCard
              title="Al-Quran Kareem"
              subtitle="Read, Listen & Learn"
              description="Complete Quran with translations in 40+ languages"
              icon="book"
              gradient={[COLORS.primary.main, COLORS.primary.dark] as any}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Al-Quran feature will be available soon, In Sha Allah');
              }}
              delay={300}
            />

          </View>

          {/* Daily Inspiration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Inspiration</Text>
            <PremiumCard style={styles.verseCard} glowEffect elevation="lg">
              <LinearGradient
                colors={[COLORS.primary.light + '10', COLORS.secondary.gold + '10'] as any}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.verseDecoration}>
                <IslamicPattern type="arabesque" size={100} color={COLORS.secondary.gold} animated />
              </View>
              <Text style={styles.arabicVerse}>
                وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
              </Text>
              <Text style={styles.verseTranslation}>
                "And whoever fears Allah - He will make for him a way out"
              </Text>
              <View style={styles.verseReferenceContainer}>
                <View style={styles.verseDivider} />
                <Text style={styles.verseReference}>Surah At-Talaq 65:2</Text>
                <View style={styles.verseDivider} />
              </View>
              <AnimatedButton
                title="Read More"
                variant="gradient"
                size="small"
                icon="book-outline"
                style={{ marginTop: SPACING.md }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Coming Soon', 'Al-Quran feature will be available soon, In Sha Allah');
                }}
              />
            </PremiumCard>
          </View>

          {/* Premium Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <PremiumCard
              style={styles.premiumBanner}
              gradient={[COLORS.secondary.gold + '20', COLORS.secondary.lightGold + '10'] as any}
              borderGradient
            >
              <View style={styles.premiumContent}>
                <MaterialCommunityIcons name="crown" size={40} color={COLORS.secondary.gold} />
                <View style={styles.premiumText}>
                  <Text style={styles.premiumTitle}>Unlock Full Experience</Text>
                  <Text style={styles.premiumSubtitle}>
                    Ad-free, offline access, advanced features
                  </Text>
                </View>
              </View>
              <AnimatedButton
                title="Upgrade Now"
                variant="premium"
                size="medium"
                fullWidth
                glowEffect
                style={{ marginTop: SPACING.md }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Premium', 'Premium features coming soon, In Sha Allah');
                }}
              />
            </PremiumCard>
          </View>

          <View style={{ height: 100 }} />
        </AnimatedScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  backgroundPattern: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.25,
    left: -SCREEN_WIDTH * 0.25,
    opacity: 0.05,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.4,
    borderBottomLeftRadius: RADIUS.xxl,
    borderBottomRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
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
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    marginBottom: SPACING.xs,
  },
  userInfo: {
    marginTop: SPACING.xs,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    marginBottom: 4,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: 'rgba(255,255,255,0.7)',
  },
  notificationButton: {
    marginLeft: SPACING.md,
  },
  notificationGradient: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.semantic.error,
    borderRadius: RADIUS.round,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.text.inverse,
  },
  notificationBadgeText: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  prayerCard: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    overflow: 'hidden',
  },
  prayerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  nextPrayerInfo: {
    flex: 1,
  },
  nextPrayerLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  prayerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nextPrayerName: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary.main,
  },
  prayerBadge: {
    backgroundColor: COLORS.primary.light + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  prayerBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    color: COLORS.primary.dark,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  prayerTimeContainer: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  alarmButton: {
    padding: SPACING.xs,
  },
  prayerProgress: {
    marginVertical: SPACING.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  prayerTimesScroll: {
    marginHorizontal: -SPACING.sm,
    marginTop: SPACING.sm,
  },
  prayerTimesContent: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.md,
  },
  prayerTimeItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    minWidth: 70,
  },
  prayerIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  activePrayerIcon: {
    backgroundColor: COLORS.primary.main,
  },
  prayerTimeName: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    color: COLORS.text.secondary,
    marginBottom: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  activePrayerName: {
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  prayerTimeValue: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
  },
  activePrayerTime: {
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
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
    color: COLORS.text.primary,
  },
  sectionAction: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  quickActionTitle: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    color: COLORS.text.secondary,
  },
  featureCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  featureCardSpacing: {
    marginTop: SPACING.md,
  },
  featureGradient: {
    padding: SPACING.xl,
    minHeight: 140,
    position: 'relative',
  },
  featurePattern: {
    position: 'absolute',
    right: -30,
    top: -30,
    opacity: 0.3,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  verseCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  verseDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.1,
  },
  arabicVerse: {
    fontSize: 28,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary.dark,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 42,
  },
  verseTranslation: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.callout * TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  verseReferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  verseDivider: {
    height: 1,
    width: 30,
    backgroundColor: COLORS.secondary.gold,
    opacity: 0.3,
  },
  verseReference: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.secondary.gold,
    marginHorizontal: SPACING.md,
  },
  premiumBanner: {
    padding: SPACING.xl,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.secondary.darkGold,
    marginBottom: 4,
  },
  premiumSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
  },
});

export default PremiumHomeScreen;