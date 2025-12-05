/**
 * Settings Screen - Premium World-Class Design
 * A sophisticated settings interface with stunning visuals and smooth interactions
 */

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
  Dimensions,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { useTheme } from '../contexts/ThemeContext';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import { GlassCard } from '../components/common/GlassCard';
import { Heading, Subheading, Body, Caption } from '../components/common/AnimatedText';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';
import notificationService from '../services/notificationService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Beautiful gradient presets for sections
const sectionGradients = {
  prayer: ['#1B7F65', '#2BA84A'],
  notifications: ['#FF6B6B', '#F06292'],
  preferences: ['#667eea', '#764ba2'],
  support: ['#FFB74D', '#FFA726'],
  about: ['#64B5F6', '#42A5F5'],
};

interface PremiumSettingItemProps {
  icon: string;
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';
  title: string;
  subtitle?: string;
  value?: any;
  onPress?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
  gradient?: string[];
  delay?: number;
  isDark?: boolean;
}

const PremiumSettingItem: React.FC<PremiumSettingItemProps> = ({
  icon,
  iconFamily = 'Ionicons',
  title,
  subtitle,
  value,
  onPress,
  showChevron = true,
  toggle = false,
  onToggle,
  gradient = [COLORS.primary.main, COLORS.primary.dark],
  delay = 0,
  isDark = false,
}) => {
  const scale = useSharedValue(1);
  const { theme } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      scale.value = withSpring(0.96, { damping: 15 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 15 });
      }, 100);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const IconComponent = iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      style={[animatedStyle, styles.settingItemWrapper]}
    >
      <TouchableOpacity
        activeOpacity={toggle ? 1 : 0.8}
        onPress={toggle ? undefined : handlePress}
        style={[styles.settingItem, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.95)'
        }]}
      >
        {/* Icon with gradient background */}
        <LinearGradient
          colors={gradient as any}
          style={styles.settingIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <IconComponent name={icon as any} size={24} color="#FFFFFF" />
        </LinearGradient>

        {/* Content */}
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.text.secondary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right element */}
        {toggle ? (
          <Switch
            value={value}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggle?.(val);
            }}
            trackColor={{ false: theme.darkGray, true: gradient[0] }}
            thumbColor={value ? '#FFFFFF' : theme.darkGray}
            ios_backgroundColor={theme.darkGray}
          />
        ) : (
          <View style={styles.rightContent}>
            {value && !showChevron && (
              <Text style={[styles.settingValue, { color: theme.text.secondary }]}>
                {value}
              </Text>
            )}
            {value && showChevron && (
              <View style={[styles.valueBadge, { backgroundColor: gradient[0] + '15' }]}>
                <Text style={[styles.valueBadgeText, { color: gradient[0] }]}>
                  {value}
                </Text>
              </View>
            )}
            {showChevron && onPress && (
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.text.tertiary}
                style={styles.chevron}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, isDark, toggleDarkMode } = useTheme();
  const { use24HourFormat, setUse24HourFormat } = useTimeFormat();
  const scrollY = useSharedValue(0);

  const [notifications, setNotifications] = useState({
    prayers: true,
    daily: true,
    jumuah: true,
    ramadan: false,
  });

  const [preferences, setPreferences] = useState({
    autoPlayAudio: false,
    showTransliteration: true,
    arabicFontSize: 'Medium',
    calculationMethod: 'ISNA',
  });

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

  const handleNotificationToggle = async (type: keyof typeof notifications) => {
    const newValue = !notifications[type];
    setNotifications(prev => ({ ...prev, [type]: newValue }));

    // Update notification service settings
    if (type === 'prayers') {
      await notificationService.saveSettings({ prayerReminders: newValue });
    } else if (type === 'daily') {
      await notificationService.saveSettings({ dailyReminders: newValue });
    } else if (type === 'jumuah') {
      await notificationService.saveSettings({ jumuahReminder: newValue });
    }
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id',
      android: 'https://play.google.com/store/apps/details?id=',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  const handleShareApp = () => {
    Alert.alert('Share App', 'Share functionality would be implemented here');
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      {/* Premium Animated Header */}
      <LinearGradient
        colors={isDark ? ['#1A1A1A', '#0A0A0A'] : [COLORS.primary.main, COLORS.primary.dark]}
        style={styles.headerBackground}
      >
        <SafeAreaView edges={['top']}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
              </BlurView>
            </TouchableOpacity>

            <View style={styles.headerTitle}>
              <Text style={styles.titleText}>Settings</Text>
              <Text style={styles.titleSubtext}>Customize Your Experience</Text>
            </View>

            <View style={{ width: 48 }} />
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Prayer Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={sectionGradients.prayer as any}
              style={styles.sectionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="mosque" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Prayer Settings
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <PremiumSettingItem
              icon="location-outline"
              title="Prayer Location"
              subtitle="Currently using GPS location"
              value="New York"
              onPress={() => navigation.navigate('LocationSettings')}
              gradient={sectionGradients.prayer}
              delay={200}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="calculator-outline"
              title="Calculation Method"
              value={preferences.calculationMethod}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Calculation method settings will be available soon, In Sha Allah');
              }}
              gradient={sectionGradients.prayer}
              delay={250}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="time"
              iconFamily="MaterialCommunityIcons"
              title="Prayer Adjustments"
              subtitle="Fine-tune your prayer times"
              onPress={() => navigation.navigate('AdjustPrayerTimes')}
              gradient={sectionGradients.prayer}
              delay={300}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="time-outline"
              title="24-Hour Format"
              subtitle="Display times in 24-hour format"
              toggle
              value={use24HourFormat}
              onToggle={setUse24HourFormat}
              gradient={sectionGradients.prayer}
              delay={350}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={sectionGradients.notifications as any}
              style={styles.sectionIcon}
            >
              <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Notifications
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <PremiumSettingItem
              icon="notifications-outline"
              title="Prayer Reminders"
              subtitle="Get notified for each prayer"
              toggle
              value={notifications.prayers}
              onToggle={() => handleNotificationToggle('prayers')}
              gradient={sectionGradients.notifications}
              delay={400}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="today"
              title="Daily Reminders"
              subtitle="Morning & evening adhkar"
              toggle
              value={notifications.daily}
              onToggle={() => handleNotificationToggle('daily')}
              gradient={sectionGradients.notifications}
              delay={450}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="mosque"
              iconFamily="MaterialCommunityIcons"
              title="Jumu'ah Reminder"
              subtitle="Friday prayer notification"
              toggle
              value={notifications.jumuah}
              onToggle={() => handleNotificationToggle('jumuah')}
              gradient={sectionGradients.notifications}
              delay={500}
              isDark={isDark}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={sectionGradients.preferences as any}
              style={styles.sectionIcon}
            >
              <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              App Preferences
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <PremiumSettingItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Easier on the eyes at night"
              toggle
              value={isDark}
              onToggle={toggleDarkMode}
              gradient={sectionGradients.preferences}
              delay={550}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="text-outline"
              title="Arabic Font Size"
              value={preferences.arabicFontSize}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Font settings will be available soon, In Sha Allah');
              }}
              gradient={sectionGradients.preferences}
              delay={650}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="volume-high-outline"
              title="Auto-play Audio"
              subtitle="Automatically play Quran audio"
              toggle
              value={preferences.autoPlayAudio}
              onToggle={() => setPreferences(prev => ({ ...prev, autoPlayAudio: !prev.autoPlayAudio }))}
              gradient={sectionGradients.preferences}
              delay={700}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={sectionGradients.support as any}
              style={styles.sectionIcon}
            >
              <Ionicons name="help-circle-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Support
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <PremiumSettingItem
              icon="star-outline"
              title="Rate App"
              subtitle="Help us improve with your feedback"
              onPress={handleRateApp}
              gradient={sectionGradients.support}
              delay={750}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="share-social-outline"
              title="Share App"
              subtitle="Spread the blessings"
              onPress={handleShareApp}
              gradient={sectionGradients.support}
              delay={800}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="help-circle-outline"
              title="Help & FAQ"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Help & FAQ will be available soon, In Sha Allah');
              }}
              gradient={sectionGradients.support}
              delay={850}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="mail-outline"
              title="Contact Us"
              subtitle="hayya.prayers@gmail.com"
              onPress={() => Linking.openURL('mailto:hayya.prayers@gmail.com')}
              gradient={sectionGradients.support}
              delay={900}
              isDark={isDark}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={sectionGradients.about as any}
              style={styles.sectionIcon}
            >
              <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              About
            </Text>
          </View>

          <View style={styles.sectionContent}>
            <PremiumSettingItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Privacy policy will be available soon, In Sha Allah');
              }}
              gradient={sectionGradients.about}
              delay={950}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Coming Soon', 'Terms of service will be available soon, In Sha Allah');
              }}
              gradient={sectionGradients.about}
              delay={1000}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="trash-outline"
              title="Clear Cache"
              subtitle="Free up storage space"
              onPress={handleClearCache}
              gradient={['#FF5252', '#FF1744']}
              delay={1050}
              isDark={isDark}
            />
            <PremiumSettingItem
              icon="information-circle-outline"
              title="App Version"
              value="1.0.0"
              showChevron={false}
              gradient={sectionGradients.about}
              delay={1100}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Premium Footer */}
        <Animated.View
          entering={FadeIn.delay(1200).springify()}
          style={styles.footer}
        >
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'] : ['rgba(27,127,101,0.05)', 'rgba(27,127,101,0.02)']}
            style={styles.footerContent}
          >
            <Text style={[styles.footerText, { color: theme.text.secondary }]}>
              Made with ❤️ for the Muslim Ummah
            </Text>
            <Text style={[styles.footerVersion, { color: theme.text.tertiary }]}>
              Version 1.0.0 • Build 1
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    paddingBottom: SPACING.sm,
    minHeight: 100, // Ensure enough height for header with safe area
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    minHeight: 80, // Consistent header height with extra padding
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: '#FFFFFF',
  },
  titleSubtext: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: SPACING.xl, // Adjusted padding after removing profile card
    paddingBottom: SPACING.xxl * 2,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  sectionContent: {
    paddingHorizontal: SPACING.lg,
  },
  settingItemWrapper: {
    marginBottom: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    minHeight: 72,
    ...SHADOWS.sm,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  settingContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.fontSize.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    lineHeight: TYPOGRAPHY.fontSize.caption1 * 1.3,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    marginRight: SPACING.xs,
  },
  valueBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.xs,
  },
  valueBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  chevron: {
    marginLeft: 4,
  },
  footer: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
  },
  footerContent: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  footerVersion: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    textAlign: 'center',
  },
});

export default SettingsScreen;