/**
 * Privacy Settings Screen
 * Manage privacy and data settings
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconFamily: string;
  value: boolean;
}

const PrivacySettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: 'analytics',
      title: 'Usage Analytics',
      description: 'Help improve the app by sharing anonymous usage data',
      icon: 'analytics',
      iconFamily: 'Ionicons',
      value: true,
    },
    {
      id: 'crashReports',
      title: 'Crash Reports',
      description: 'Automatically send crash reports to help fix issues',
      icon: 'bug-outline',
      iconFamily: 'Ionicons',
      value: true,
    },
    {
      id: 'locationTracking',
      title: 'Location Services',
      description: 'Allow app to access your location for prayer times',
      icon: 'location',
      iconFamily: 'Ionicons',
      value: true,
    },
    {
      id: 'notifications',
      title: 'Personalized Notifications',
      description: 'Receive notifications based on your usage patterns',
      icon: 'notifications',
      iconFamily: 'Ionicons',
      value: true,
    },
    {
      id: 'backup',
      title: 'Cloud Backup',
      description: 'Backup your settings and preferences to the cloud',
      icon: 'cloud-upload',
      iconFamily: 'Ionicons',
      value: false,
    },
    {
      id: 'dataSharing',
      title: 'Data Sharing',
      description: 'Share data with trusted partners for better features',
      icon: 'share-social',
      iconFamily: 'Ionicons',
      value: false,
    },
  ]);

  const togglePrivacySetting = async (id: string) => {
    const updatedSettings = privacySettings.map(setting =>
      setting.id === id ? { ...setting, value: !setting.value } : setting
    );
    setPrivacySettings(updatedSettings);

    // Save to AsyncStorage
    await AsyncStorage.setItem('privacySettings', JSON.stringify(updatedSettings));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your app data including settings, saved locations, and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'All data has been cleared');
              // Reset privacy settings to defaults
              setPrivacySettings(prevSettings =>
                prevSettings.map(setting => ({ ...setting, value: false }))
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Export all your data in a readable format',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            // In a real app, this would generate and export a file
            Alert.alert('Success', 'Data export feature would be implemented here');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };


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
              Privacy Settings
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
        {/* Info Card */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.infoCard, { backgroundColor: `${PillarsColors.gold[500]}10` }]}
        >
          <MaterialCommunityIcons name="shield-lock" size={24} color={PillarsColors.gold[600]} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
              Your Privacy Matters
            </Text>
            <Text style={[styles.infoText, { color: theme.text.secondary }]}>
              We respect your privacy and give you full control over your data. All settings are optional and can be changed at any time.
            </Text>
          </View>
        </Animated.View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Data & Privacy
          </Text>
          {privacySettings.map((setting, index) => (
            <Animated.View
              key={setting.id}
              entering={FadeInDown.delay(100 + index * 50).springify()}
              style={[styles.settingItem, { backgroundColor: theme.background.card }]}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: `${PillarsColors.gold[500]}15` }]}>
                  <Ionicons
                    name={setting.icon as any}
                    size={20}
                    color={PillarsColors.gold[500]}
                  />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
                    {setting.title}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.text.secondary }]}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.value}
                onValueChange={() => togglePrivacySetting(setting.id)}
                trackColor={{
                  false: PillarsColors.glass.black[30],
                  true: PillarsColors.gold[500],
                }}
                thumbColor={setting.value ? '#FFFFFF' : PillarsColors.black[400]}
              />
            </Animated.View>
          ))}
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Legal
          </Text>

          <TouchableOpacity
            style={[styles.legalItem, { backgroundColor: theme.background.card }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="document-text" size={20} color={PillarsColors.gold[500]} />
            <Text style={[styles.legalText, { color: theme.text.primary }]}>
              Privacy Policy
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.legalItem, { backgroundColor: theme.background.card }]}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <Ionicons name="document-text" size={20} color={PillarsColors.gold[500]} />
            <Text style={[styles.legalText, { color: theme.text.primary }]}>
              Terms of Service
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.text.tertiary} />
          </TouchableOpacity>

        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.background.card }]}
            onPress={exportData}
          >
            <Ionicons name="download-outline" size={20} color={PillarsColors.gold[500]} />
            <Text style={[styles.actionText, { color: theme.text.primary }]}>
              Export My Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.background.card }]}
            onPress={clearAllData}
          >
            <Ionicons name="trash-outline" size={20} color="#FF9800" />
            <Text style={[styles.actionText, { color: theme.text.primary }]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <Animated.View
          entering={FadeInDown.delay(800).springify()}
          style={[styles.supportCard, { backgroundColor: theme.background.card }]}
        >
          <Text style={[styles.supportTitle, { color: theme.text.primary }]}>
            Questions about privacy?
          </Text>
          <Text style={[styles.supportText, { color: theme.text.secondary }]}>
            Contact our privacy team at hayyaprayers@gmail.com
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Linking.openURL('mailto:hayyaprayers@gmail.com')}
          >
            <LinearGradient
              colors={PillarsColors.gradients.navyGold as any}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
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
  infoCard: {
    flexDirection: 'row',
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.xl,
    gap: PillarsSpacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    marginBottom: PillarsSpacing.xs,
  },
  infoText: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.5,
  },
  section: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.sm,
    ...PillarsShadows.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: PillarsSpacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.3,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.sm,
    gap: PillarsSpacing.md,
    ...PillarsShadows.sm,
  },
  legalText: {
    flex: 1,
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.sm,
    gap: PillarsSpacing.md,
    ...PillarsShadows.sm,
  },
  actionText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    gap: PillarsSpacing.sm,
    marginTop: PillarsSpacing.sm,
    ...PillarsShadows.md,
  },
  dangerText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  supportCard: {
    padding: PillarsSpacing.lg,
    borderRadius: PillarsBorderRadius.lg,
    alignItems: 'center',
    ...PillarsShadows.md,
  },
  supportTitle: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    marginBottom: PillarsSpacing.xs,
  },
  supportText: {
    fontSize: PillarsTypography.fontSize.sm,
    textAlign: 'center',
    marginBottom: PillarsSpacing.lg,
  },
  contactButton: {
    paddingVertical: PillarsSpacing.sm,
    paddingHorizontal: PillarsSpacing.xl,
    borderRadius: PillarsBorderRadius.full,
    overflow: 'hidden',
  },
  contactButtonText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default PrivacySettingsScreen;