/**
 * More Screen - Premium Feature Grid
 * Apple-level design with beautiful feature cards
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Premium Components
import { PremiumCard } from '../components/premium/PremiumCard';
import { PremiumHeader } from '../components/premium/PremiumHeader';
import {
  Title1,
  Title2,
  Title3,
  Headline,
  Body,
  Caption1,
  Caption2,
} from '../components/premium/PremiumText';

// Contexts
import { useTheme } from '../contexts/ThemeContext';
import {
  AppleColors,
  Spacing,
  BorderRadius,
  Typography,
  Elevation,
} from '../theme/appleDesignSystem';
import { getTheme } from '../theme/themeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
  gradient: string[];
  route: string;
}

interface FeatureCardProps extends FeatureItem {
  onPress: () => void;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  iconFamily,
  gradient,
  onPress,
  index,
}) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const IconComponent = iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 50 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 100,
        damping: 20,
      }}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <PremiumCard
          variant="elevated"
          style={styles.featureCard}
          haptic
        >
          <LinearGradient
            colors={gradient as any}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <IconComponent
              name={icon as any}
              size={32}
              color="#FFFFFF"
            />
          </LinearGradient>

          <View style={styles.cardContent}>
            <Headline weight="semibold" numberOfLines={1}>
              {title}
            </Headline>
            <Caption1
              color={theme.text.secondary}
              numberOfLines={2}
              style={{ marginTop: 4 }}
            >
              {description}
            </Caption1>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text.tertiary}
          />
        </PremiumCard>
      </TouchableOpacity>
    </MotiView>
  );
};

const MoreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const features: FeatureItem[] = [
    {
      id: 'tasbih',
      title: 'Tasbih Counter',
      description: 'Digital prayer beads for dhikr',
      icon: 'counter',
      iconFamily: 'MaterialCommunityIcons',
      gradient: AppleColors.gradients.mystic,
      route: 'Tasbih',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Customize your app experience',
      icon: 'settings',
      iconFamily: 'Ionicons',
      gradient: AppleColors.gradients.mystic,
      route: 'Settings',
    },
  ];

  const quickStats = [
    { label: 'Days Active', value: '7', icon: 'flame' },
    { label: 'Prayers Today', value: '3', icon: 'checkmark-circle' },
    { label: 'Total Dhikr', value: '1,234', icon: 'repeat' },
  ];

  const handleFeaturePress = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <View style={[styles.container, {
      backgroundColor: theme.background.primary
    }]}>
      <PremiumHeader
        title="More"
        subtitle="Explore Features"
        gradient
        gradientColors={AppleColors.gradients.premium}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={AppleColors.gradients.premium}
            style={styles.statsContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Title3 color="#FFFFFF" weight="bold" style={{ marginBottom: Spacing.lg }}>
              Your Progress
            </Title3>
            <View style={styles.statsGrid}>
              {quickStats.map((stat, index) => (
                <MotiView
                  key={stat.label}
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 200 + index * 100 }}
                  style={styles.statItem}
                >
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <Title2 color="#FFFFFF" weight="bold">
                    {stat.value}
                  </Title2>
                  <Caption1 color="rgba(255,255,255,0.8)">
                    {stat.label}
                  </Caption1>
                </MotiView>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Title3 style={styles.sectionTitle}>Features</Title3>

          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              index={index}
              onPress={() => handleFeaturePress(feature.route)}
            />
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Caption1 color={theme.text.tertiary} align="center">
            Hayya App
          </Caption1>
          <Caption2 color={theme.text.tertiary} align="center">
            Version 1.0.0
          </Caption2>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120, // Account for PremiumHeader (56 + insets.top + padding)
    paddingHorizontal: Spacing.md,
  },
  statsContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Elevation.level3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  cardContainer: {
    marginBottom: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  appInfo: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
});

export default MoreScreen;