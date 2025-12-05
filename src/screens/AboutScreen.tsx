/**
 * About Screen
 * Information about the app and team
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
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

const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const features = [
    {
      icon: 'clock-outline',
      title: 'Accurate Prayer Times',
      description: 'Precise prayer times calculated for your exact location',
    },
    {
      icon: 'compass',
      title: 'Qibla Direction',
      description: 'Find the direction to Mecca from anywhere in the world',
    },
    {
      icon: 'bell-outline',
      title: 'Prayer Reminders',
      description: 'Never miss a prayer with customizable notifications',
    },
    {
      icon: 'counter',
      title: 'Digital Tasbih',
      description: 'Keep track of your dhikr with our digital counter',
    },
  ];


  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950]]
              : [PillarsColors.gold[50], PillarsColors.white]
          }
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <View style={styles.headerTop}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              About
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Logo and Info */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={styles.logoSection}
        >
          <View style={[styles.logoContainer, { backgroundColor: theme.background.card }]}>
            <LinearGradient
              colors={PillarsColors.gradients.navyGold as any}
              style={styles.logoGradient}
            >
              <MaterialCommunityIcons name="mosque" size={48} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={[styles.appName, { color: theme.text.primary }]}>
            Hayya
          </Text>
          <Text style={[styles.appVersion, { color: theme.text.secondary }]}>
            Version 2.0.0
          </Text>
          <Text style={[styles.appTagline, { color: theme.text.secondary }]}>
            Your trusted companion for Islamic practices
          </Text>
        </Animated.View>

        {/* Mission Statement */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.missionCard, { backgroundColor: `${PillarsColors.gold[500]}10` }]}
        >
          <MaterialCommunityIcons name="heart" size={24} color={PillarsColors.gold[600]} />
          <Text style={[styles.missionTitle, { color: theme.text.primary }]}>
            Our Mission
          </Text>
          <Text style={[styles.missionText, { color: theme.text.secondary }]}>
            To provide Muslims worldwide with a beautiful, accurate, and easy-to-use app that helps them maintain their daily prayers and strengthen their connection with Allah.
          </Text>
        </Animated.View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Key Features
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeInDown.delay(300 + index * 50).springify()}
                style={[styles.featureCard, { backgroundColor: theme.background.card }]}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${PillarsColors.gold[500]}15` }]}>
                  <MaterialCommunityIcons
                    name={feature.icon as any}
                    size={24}
                    color={PillarsColors.gold[500]}
                  />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.text.secondary }]}>
                  {feature.description}
                </Text>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Acknowledgments */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={[styles.acknowledgmentCard, { backgroundColor: theme.background.card }]}
        >
          <Text style={[styles.acknowledgmentTitle, { color: theme.text.primary }]}>
            Acknowledgments
          </Text>
          <Text style={[styles.acknowledgmentText, { color: theme.text.secondary }]}>
            Prayer time calculations are based on methods approved by major Islamic organizations worldwide. Qibla direction calculations use the great circle path method for accuracy.
          </Text>
          <Text style={[styles.acknowledgmentText, { color: theme.text.secondary, marginTop: PillarsSpacing.sm }]}>
            Special thanks to all our users who have provided valuable feedback to improve this app.
          </Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            © 2024 Hayya
          </Text>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: PillarsSpacing.xl,
  },
  headerContent: {
    paddingHorizontal: PillarsLayout.screenPadding,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.md,
  },
  headerTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
  },
  scrollContent: {
    padding: PillarsLayout.screenPadding,
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: PillarsSpacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: PillarsSpacing.lg,
    ...PillarsShadows.lg,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: PillarsTypography.fontSize.xxl,
    fontWeight: '800',
    marginBottom: PillarsSpacing.xs,
  },
  appVersion: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    marginBottom: PillarsSpacing.sm,
  },
  appTagline: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  missionCard: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.lg,
    alignItems: 'center',
    marginBottom: PillarsSpacing.xl,
  },
  missionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginVertical: PillarsSpacing.sm,
  },
  missionText: {
    fontSize: PillarsTypography.fontSize.md,
    lineHeight: PillarsTypography.fontSize.md * 1.5,
    textAlign: 'center',
  },
  section: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PillarsSpacing.md,
  },
  featureCard: {
    width: '47%',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    ...PillarsShadows.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PillarsSpacing.sm,
  },
  featureTitle: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '700',
    marginBottom: PillarsSpacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: PillarsTypography.fontSize.xs,
    textAlign: 'center',
    lineHeight: PillarsTypography.fontSize.xs * 1.4,
  },
  acknowledgmentCard: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.xl,
    ...PillarsShadows.sm,
  },
  acknowledgmentTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  acknowledgmentText: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.5,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: PillarsSpacing.lg,
  },
  footerText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default AboutScreen;