/**
 * Terms of Service Screen
 * In-app terms of service content
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

interface TermsSection {
  title: string;
  icon: string;
  content: string[];
}

const TermsOfServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const lastUpdated = 'December 18, 2024';

  const termsSections: TermsSection[] = [
    {
      title: 'Acceptance of Terms',
      icon: 'handshake-outline',
      content: [
        'By downloading, installing, or using the Hayya app, you agree to be bound by these Terms of Service.',
        'If you do not agree to these terms, please do not use our app.',
        'We reserve the right to update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.',
      ],
    },
    {
      title: 'Description of Service',
      icon: 'application-outline',
      content: [
        'Hayya provides Islamic prayer times, Qibla direction, digital Tasbih counter, and related features.',
        'Prayer times are calculated using established Islamic calculation methods and your device\'s location.',
        'The accuracy of prayer times depends on the correct configuration of your location and calculation method preferences.',
        'We strive to provide accurate information but cannot guarantee 100% accuracy due to factors beyond our control.',
      ],
    },
    {
      title: 'User Responsibilities',
      icon: 'account-outline',
      content: [
        'You are responsible for ensuring your device\'s location settings are configured correctly for accurate prayer times.',
        'You should verify prayer times with local Islamic authorities, especially for critical occasions.',
        'You agree to use the app only for its intended purposes and in compliance with all applicable laws.',
        'You are responsible for maintaining the security of your device and any data stored within the app.',
      ],
    },
    {
      title: 'Intellectual Property',
      icon: 'copyright',
      content: [
        'All content, features, and functionality of Hayya are owned by us and are protected by copyright and other intellectual property laws.',
        'You may not copy, modify, distribute, sell, or lease any part of our app without our express written permission.',
        'The Hayya name, logo, and all related marks are trademarks of the app developers.',
        'User-generated content (such as custom Tasbih entries) remains your property, but you grant us a license to use it within the app.',
      ],
    },
    {
      title: 'Disclaimer of Warranties',
      icon: 'alert-circle-outline',
      content: [
        'The app is provided "as is" and "as available" without warranties of any kind, either express or implied.',
        'We do not warrant that the app will be uninterrupted, error-free, or completely secure.',
        'Prayer times are provided as a convenience and should be verified with local Islamic authorities.',
        'Qibla direction accuracy depends on your device\'s compass calibration and may vary based on device capabilities.',
      ],
    },
    {
      title: 'Limitation of Liability',
      icon: 'scale-balance',
      content: [
        'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages.',
        'We are not responsible for any spiritual, religious, or personal consequences arising from reliance on the app\'s information.',
        'Our total liability for any claims arising from use of the app shall not exceed the amount you paid for the app (if any).',
        'Some jurisdictions do not allow limitation of liability, so some of these limitations may not apply to you.',
      ],
    },
    {
      title: 'Third-Party Services',
      icon: 'link-variant',
      content: [
        'The app may contain links to third-party websites or services that are not owned or controlled by us.',
        'We have no control over and assume no responsibility for the content, privacy policies, or practices of third-party sites.',
        'Your use of third-party services is at your own risk and subject to their respective terms and conditions.',
      ],
    },
    {
      title: 'Termination',
      icon: 'close-circle-outline',
      content: [
        'We reserve the right to terminate or suspend your access to the app at any time, without prior notice, for any reason.',
        'You may stop using the app at any time by uninstalling it from your device.',
        'Upon termination, all provisions of these terms that should survive termination shall survive.',
      ],
    },
    {
      title: 'Governing Law',
      icon: 'gavel',
      content: [
        'These Terms shall be governed by and construed in accordance with applicable laws.',
        'Any disputes arising from these terms or your use of the app shall be resolved through appropriate legal channels.',
        'If any provision of these terms is found to be invalid, the remaining provisions will continue to be valid and enforceable.',
      ],
    },
    {
      title: 'Contact Information',
      icon: 'email-outline',
      content: [
        'If you have any questions about these Terms of Service, please contact us at:',
        'Email: hayya.prayers@gmail.com',
        'We welcome your feedback and will respond to inquiries as soon as possible.',
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
              Terms of Service
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
          <MaterialCommunityIcons name="file-document-check" size={32} color={PillarsColors.gold[600]} />
          <Text style={[styles.introTitle, { color: theme.text.primary }]}>
            Terms of Service Agreement
          </Text>
          <Text style={[styles.introText, { color: theme.text.secondary }]}>
            Please read these Terms of Service carefully before using the Hayya app. These terms govern your use of our services and establish the rights and responsibilities of both parties.
          </Text>
          <Text style={[styles.lastUpdated, { color: theme.text.tertiary }]}>
            Last updated: {lastUpdated}
          </Text>
        </Animated.View>

        {/* Terms Sections */}
        {termsSections.map((section, index) => (
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
            By using Hayya, you acknowledge that you have read,
          </Text>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            understood, and agree to be bound by these Terms.
          </Text>
          <Text style={[styles.footerSubtext, { color: theme.text.tertiary }]}>
            JazakAllahu Khayran for using Hayya
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
  footerSubtext: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: PillarsSpacing.md,
    fontStyle: 'italic',
  },
});

export default TermsOfServiceScreen;
