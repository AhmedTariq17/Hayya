/**
 * Privacy Policy Screen
 * In-app privacy policy content
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
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

interface PolicySection {
  title: string;
  icon: string;
  content: string[];
}

const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const lastUpdated = 'December 18, 2024';

  const policySections: PolicySection[] = [
    {
      title: 'Information We Collect',
      icon: 'folder-information-outline',
      content: [
        'Location Data: We collect your device\'s location to provide accurate prayer times and Qibla direction. This data is processed locally on your device and is not transmitted to our servers.',
        'Usage Data: We may collect anonymous usage statistics to improve app performance and user experience. This includes app crashes, feature usage patterns, and general engagement metrics.',
        'Preferences: Your app preferences (such as notification settings, calculation method, and display preferences) are stored locally on your device.',
      ],
    },
    {
      title: 'How We Use Your Information',
      icon: 'cog-outline',
      content: [
        'To calculate accurate prayer times based on your location.',
        'To determine the Qibla direction from your current position.',
        'To send prayer time notifications if you have enabled this feature.',
        'To improve our app through anonymous analytics (if you have consented).',
        'To provide customer support and respond to your inquiries.',
      ],
    },
    {
      title: 'Data Storage & Security',
      icon: 'shield-lock-outline',
      content: [
        'All your personal data, including location and preferences, is stored locally on your device.',
        'We do not maintain external databases containing your personal information.',
        'We implement industry-standard security measures to protect any data that may be transmitted.',
        'Your data is encrypted during transmission using SSL/TLS protocols.',
      ],
    },
    {
      title: 'Third-Party Services',
      icon: 'web',
      content: [
        'We may use third-party services for crash reporting and analytics. These services collect anonymous data only.',
        'Location services are provided by your device\'s operating system (iOS/Android).',
        'We do not sell, trade, or rent your personal information to third parties.',
        'Any third-party services we use are compliant with applicable privacy regulations.',
      ],
    },
    {
      title: 'Your Rights & Choices',
      icon: 'account-check-outline',
      content: [
        'You can disable location services at any time through your device settings.',
        'You can opt out of analytics data collection in the app settings.',
        'You can clear all app data from the Privacy Settings screen.',
        'You can request information about what data we have collected by contacting us.',
        'You can request deletion of any data associated with your usage.',
      ],
    },
    {
      title: 'Children\'s Privacy',
      icon: 'account-child-outline',
      content: [
        'Our app is suitable for users of all ages.',
        'We do not knowingly collect personal information from children under 13.',
        'If you believe we have inadvertently collected information from a child, please contact us immediately.',
      ],
    },
    {
      title: 'Changes to This Policy',
      icon: 'file-document-edit-outline',
      content: [
        'We may update this Privacy Policy from time to time.',
        'We will notify you of any significant changes through the app or via email if provided.',
        'Continued use of the app after changes constitutes acceptance of the updated policy.',
      ],
    },
    {
      title: 'Contact Us',
      icon: 'email-outline',
      content: [
        'If you have any questions about this Privacy Policy, please contact us at:',
        'Email: hayya.prayers@gmail.com',
        'We aim to respond to all inquiries within 48 hours.',
      ],
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
              Privacy Policy
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
        {/* Introduction Card */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[styles.introCard, { backgroundColor: `${PillarsColors.gold[500]}10` }]}
        >
          <MaterialCommunityIcons name="shield-check" size={32} color={PillarsColors.gold[600]} />
          <Text style={[styles.introTitle, { color: theme.text.primary }]}>
            Your Privacy is Important to Us
          </Text>
          <Text style={[styles.introText, { color: theme.text.secondary }]}>
            At Hayya, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
          </Text>
          <Text style={[styles.lastUpdated, { color: theme.text.tertiary }]}>
            Last updated: {lastUpdated}
          </Text>
        </Animated.View>

        {/* Policy Sections */}
        {policySections.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(100 + index * 50).springify()}
            style={[styles.sectionCard, { backgroundColor: theme.background.card }]}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${PillarsColors.gold[500]}15` }]}>
                <MaterialCommunityIcons
                  name={section.icon as any}
                  size={22}
                  color={PillarsColors.gold[500]}
                />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                {section.title}
              </Text>
            </View>
            {section.content.map((paragraph, pIndex) => (
              <View key={pIndex} style={styles.bulletPoint}>
                <View style={[styles.bullet, { backgroundColor: PillarsColors.gold[500] }]} />
                <Text style={[styles.sectionText, { color: theme.text.secondary }]}>
                  {paragraph}
                </Text>
              </View>
            ))}
          </Animated.View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            By using Hayya, you agree to this Privacy Policy.
          </Text>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            Thank you for trusting us with your Islamic practice journey.
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
  introCard: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.lg,
    alignItems: 'center',
    marginBottom: PillarsSpacing.xl,
  },
  introTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginTop: PillarsSpacing.md,
    marginBottom: PillarsSpacing.sm,
    textAlign: 'center',
  },
  introText: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.6,
    textAlign: 'center',
    marginBottom: PillarsSpacing.md,
  },
  lastUpdated: {
    fontSize: PillarsTypography.fontSize.xs,
    fontStyle: 'italic',
  },
  sectionCard: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.md,
    ...PillarsShadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: PillarsSpacing.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    flex: 1,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: PillarsSpacing.sm,
    paddingRight: PillarsSpacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: PillarsSpacing.sm,
  },
  sectionText: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.5,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: PillarsSpacing.xl,
    paddingHorizontal: PillarsSpacing.lg,
  },
  footerText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: PillarsSpacing.xs,
  },
});

export default PrivacyPolicyScreen;
