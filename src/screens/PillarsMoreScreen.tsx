/**
 * Ultra-Premium More Screen
 * Luxury feature hub with world-class design
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  Switch,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  SlideInRight,
  ZoomIn,
  Layout,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
import { StatisticsService } from '../services/statisticsService';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  PillarsTypography,
  PillarsLayout,
  getPillarsTheme,
} from '../theme/pillarsTheme';
import { PillarsCard } from '../components/ui/PillarsCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FeatureCategory {
  id: string;
  title: string;
  icon: string;
  iconFamily: string;
  gradient: string[];
  features: Feature[];
}

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: string;
  color: string;
  route?: string;
  action?: () => void;
  badge?: string;
  isPremium?: boolean;
}


const FeatureCard: React.FC<{
  feature: Feature;
  index: number;
  onPress: () => void;
}> = ({ feature, index, onPress }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    'worklet';
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent =
    feature.iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
    feature.iconFamily === 'FontAwesome5' ? FontAwesome5 :
    feature.iconFamily === 'MaterialIcons' ? MaterialIcons :
    Ionicons;

  return (
    <AnimatedTouchable
      entering={SlideInRight.delay(index * 50).springify()}
      style={[styles.featureCard, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <LinearGradient
        colors={
          isDark
            ? [PillarsColors.black[900], PillarsColors.black[800]] as any
            : [PillarsColors.white, PillarsColors.black[50]] as any
        }
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.featureCardContent}>
        <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
          <IconComponent
            name={feature.icon as any}
            size={28}
            color={feature.color}
          />
        </View>

        <View style={styles.featureInfo}>
          <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
            {feature.title}
          </Text>
          <Text style={[styles.featureSubtitle, { color: theme.text.secondary }]}>
            {feature.subtitle}
          </Text>
        </View>

        <View style={styles.featureRight}>
          {feature.badge && (
            <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
              <Text style={styles.featureBadgeText}>{feature.badge}</Text>
            </View>
          )}
          {feature.isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={16} color={PillarsColors.gold[500]} />
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text.tertiary}
          />
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const PillarsMoreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark, toggleTheme } = useTheme();
  const theme = getPillarsTheme(isDark);


  const [notifications, setNotifications] = useState(true);

  const featureCategories: FeatureCategory[] = useMemo(() => [
    {
      id: 'worship',
      title: 'Worship & Practice',
      icon: 'mosque',
      iconFamily: 'MaterialCommunityIcons',
      gradient: PillarsColors.gradients.navyGold,
      features: [
        {
          id: 'tasbih',
          title: 'Digital Tasbih',
          subtitle: 'Track your dhikr',
          icon: 'counter',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.gold[500],
          route: 'Tasbih',
          badge: 'Updated',
        },
        {
          id: 'quran',
          title: 'Al-Quran',
          subtitle: 'Read & listen to Quran',
          icon: 'book-open',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.navy[500],
          route: 'Quran',
          isPremium: true,
        },
        {
          id: 'hadith',
          title: 'Hadith Collection',
          subtitle: 'Authentic narrations',
          icon: 'book-education',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.info,
          route: 'Hadith',
        },
        {
          id: 'names',
          title: '99 Names of Allah',
          subtitle: 'Learn divine attributes',
          icon: 'star-crescent',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.gold[600],
          route: 'Names',
        },
      ],
    },
    {
      id: 'tools',
      title: 'Tools & Utilities',
      icon: 'tools',
      iconFamily: 'MaterialCommunityIcons',
      gradient: [PillarsColors.navy[600], PillarsColors.navy[400]],
      features: [
        {
          id: 'calendar',
          title: 'Islamic Calendar',
          subtitle: 'Hijri dates & events',
          icon: 'calendar-month',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.navy[500],
          route: 'Calendar',
        },
        {
          id: 'mosque',
          title: 'Mosque Finder',
          subtitle: 'Nearby mosques',
          icon: 'map-marker-radius',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.success,
          route: 'MosqueFinder',
        },
        {
          id: 'halal',
          title: 'Halal Places',
          subtitle: 'Find halal restaurants',
          icon: 'food-halal',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.warning,
          route: 'HalalPlaces',
        },
        {
          id: 'converter',
          title: 'Date Converter',
          subtitle: 'Hijri to Gregorian',
          icon: 'calendar-sync',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.navy[600],
          route: 'DateConverter',
        },
      ],
    },
    {
      id: 'learning',
      title: 'Learning & Education',
      icon: 'school',
      iconFamily: 'MaterialIcons',
      gradient: [PillarsColors.gold[500], PillarsColors.gold[600]],
      features: [
        {
          id: 'learn',
          title: 'Islamic Basics',
          subtitle: 'Learn fundamentals',
          icon: 'school',
          iconFamily: 'MaterialIcons',
          color: PillarsColors.semantic.info,
          route: 'Learn',
        },
        {
          id: 'arabic',
          title: 'Learn Arabic',
          subtitle: 'Quranic vocabulary',
          icon: 'language',
          iconFamily: 'MaterialIcons',
          color: PillarsColors.gold[500],
          route: 'Arabic',
          isPremium: true,
        },
        {
          id: 'stories',
          title: 'Prophet Stories',
          subtitle: 'Stories of the prophets',
          icon: 'book-heart',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.maghrib,
          route: 'Stories',
        },
      ],
    },
    {
      id: 'community',
      title: 'Community & Support',
      icon: 'account-group',
      iconFamily: 'MaterialCommunityIcons',
      gradient: [PillarsColors.semantic.success, '#66BB6A'],
      features: [
        {
          id: 'donate',
          title: 'Donate',
          subtitle: 'Support Islamic causes',
          icon: 'hand-heart',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.success,
          action: () => Linking.openURL('https://example.com/donate'),
        },
        {
          id: 'share',
          title: 'Share App',
          subtitle: 'Spread the benefit',
          icon: 'share-variant',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.gold[500],
          action: () => Share.share({
            message: 'Check out Hayya - your companion for Islamic practices!',
            title: 'Hayya',
          }),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve',
          icon: 'message-draw',
          iconFamily: 'MaterialCommunityIcons',
          color: PillarsColors.semantic.info,
          action: () => Linking.openURL('mailto:feedback@example.com'),
        },
      ],
    },
  ], []);

  const handleFeaturePress = (feature: Feature) => {
    if (feature.route) {
      if (feature.route === 'Tasbih' || feature.route === 'Settings') {
        navigation.navigate(feature.route);
      } else {
        // Navigate to placeholder or actual screen
        navigation.navigate(feature.route);
      }
    } else if (feature.action) {
      feature.action();
    }
  };

  const profileAnimation = useSharedValue(0);

  React.useEffect(() => {
    profileAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const profileGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      profileAnimation.value,
      [0, 1],
      [0.2, 0.4],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Premium Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950], PillarsColors.black[900]] as any
              : PillarsColors.gradients.navyGold as any
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Decorative Elements */}
        <View style={styles.headerDecoration}>
          <View style={[styles.decorCircle1, { backgroundColor: PillarsColors.gold[500] }]} />
          <View style={[styles.decorCircle2, { backgroundColor: PillarsColors.navy[500] }]} />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Settings */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={styles.quickSettings}
          >
            <PillarsCard
              variant="glass"
              style={styles.settingsCard}
              padding={PillarsSpacing.lg}
            >
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={24}
                    color={PillarsColors.gold[500]}
                  />
                  <Text style={[styles.settingText, { color: theme.text.primary }]}>
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: PillarsColors.glass.black[30],
                    true: PillarsColors.gold[500]
                  }}
                  thumbColor={isDark ? '#FFFFFF' : PillarsColors.black[400]}
                />
              </View>

              <View style={[styles.settingRow, styles.settingRowLast]}>
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={PillarsColors.navy[500]}
                  />
                  <Text style={[styles.settingText, { color: theme.text.primary }]}>
                    Notifications
                  </Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{
                    false: PillarsColors.glass.black[30],
                    true: PillarsColors.navy[500]
                  }}
                  thumbColor={notifications ? '#FFFFFF' : PillarsColors.black[400]}
                />
              </View>
            </PillarsCard>
          </Animated.View>

          {/* Feature Categories */}
          {featureCategories.map((category, categoryIndex) => (
            <Animated.View
              key={category.id}
              entering={FadeInDown.delay(300 + categoryIndex * 100).springify()}
              style={styles.categorySection}
            >
              <View style={styles.categoryHeader}>
                <LinearGradient
                  colors={category.gradient as any}
                  style={styles.categoryIconContainer}
                >
                  <MaterialCommunityIcons
                    name={category.icon as any}
                    size={20}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <Text style={[styles.categoryTitle, { color: theme.text.primary }]}>
                  {category.title}
                </Text>
              </View>

              <View style={styles.categoryFeatures}>
                {category.features.map((feature, index) => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    index={index}
                    onPress={() => handleFeaturePress(feature)}
                  />
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Settings Button */}
          <Animated.View
            entering={FadeInDown.delay(800).springify()}
            style={styles.settingsButtonContainer}
          >
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <LinearGradient
                colors={PillarsColors.gradients.navyGold as any}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="settings" size={24} color="#FFFFFF" />
              <Text style={styles.settingsButtonText}>App Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 50,
    right: -30,
  },
  decorCircle1: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.1,
    position: 'absolute',
  },
  decorCircle2: {
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.05,
    position: 'absolute',
    top: 30,
    left: -50,
  },
  profileSection: {
    paddingHorizontal: PillarsLayout.screenPadding,
    paddingTop: PillarsSpacing.xl,
    marginBottom: PillarsSpacing.xl,
  },
  profileCard: {
    borderRadius: PillarsBorderRadius.card,
    overflow: 'hidden',
    ...PillarsShadows.xl,
  },
  profileContent: {
    padding: PillarsSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: PillarsSpacing.md,
  },
  avatarGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    ...PillarsShadows.sm,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: PillarsSpacing.sm,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: PillarsSpacing.md,
  },
  editProfileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PillarsColors.glass.white[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSettings: {
    paddingHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.xl,
  },
  settingsCard: {
    backgroundColor: PillarsColors.glass.white[5],
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.sm,
  },
  settingRowLast: {
    paddingTop: PillarsSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: PillarsColors.glass.black[10],
    marginTop: PillarsSpacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.md,
  },
  settingText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: PillarsSpacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.md,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.sm,
  },
  categoryTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
  },
  categoryFeatures: {
    paddingHorizontal: PillarsLayout.screenPadding,
    gap: PillarsSpacing.sm,
  },
  featureCard: {
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    marginBottom: PillarsSpacing.sm,
    ...PillarsShadows.md,
  },
  featureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '400',
  },
  featureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  featureBadge: {
    paddingHorizontal: PillarsSpacing.sm,
    paddingVertical: 2,
    borderRadius: PillarsBorderRadius.full,
  },
  featureBadgeText: {
    fontSize: PillarsTypography.fontSize.xxs,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  premiumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PillarsColors.glass.gold[20],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonContainer: {
    paddingHorizontal: PillarsLayout.screenPadding,
    marginTop: PillarsSpacing.xl,
    marginBottom: PillarsSpacing.xl,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: PillarsBorderRadius.full,
    overflow: 'hidden',
    gap: PillarsSpacing.sm,
    ...PillarsShadows.lg,
  },
  settingsButtonText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
});

export default PillarsMoreScreen;