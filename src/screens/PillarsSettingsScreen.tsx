/**
 * Ultra-Premium Settings Screen
 * The most beautiful and functional settings page ever created
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
import { useTimeFormat } from '../contexts/TimeFormatContext';
import notificationService from '../services/notificationService';
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
import { BackButton } from '../components/ui/BackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconFamily: string;
  type: 'toggle' | 'navigation' | 'action' | 'select';
  value?: boolean | string;
  action?: () => void;
  route?: string;
  options?: string[];
}

interface SettingSection {
  id: string;
  title: string;
  icon: string;
  items: SettingItem[];
}

// Settings Row Component
const SettingRow: React.FC<{
  item: SettingItem;
  onPress: () => void;
  onToggle?: (value: boolean) => void;
  isDark: boolean;
}> = ({ item, onPress, onToggle, isDark }) => {
  const theme = getPillarsTheme(isDark);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15 });
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
    item.iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons :
    item.iconFamily === 'FontAwesome5' ? FontAwesome5 :
    Ionicons;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
        onPress={item.type !== 'toggle' ? handlePress : undefined}
        onPressIn={item.type !== 'toggle' ? handlePressIn : undefined}
        onPressOut={item.type !== 'toggle' ? handlePressOut : undefined}
        style={styles.settingRow}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${PillarsColors.gold[500]}15` }]}>
            <IconComponent
              name={item.icon as any}
              size={20}
              color={PillarsColors.gold[500]}
            />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.settingSubtitle, { color: theme.text.secondary }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onToggle?.(value);
              }}
              trackColor={{
                false: PillarsColors.glass.black[30],
                true: PillarsColors.gold[500],
              }}
              thumbColor={item.value ? '#FFFFFF' : PillarsColors.black[400]}
            />
          )}
          {item.type === 'select' && (
            <View style={styles.selectValue}>
              <Text style={[styles.selectText, { color: theme.text.secondary }]}>
                {item.value as string}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.text.tertiary} />
            </View>
          )}
          {(item.type === 'navigation' || item.type === 'action') && (
            <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PillarsSettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark, toggleTheme } = useTheme();
  const theme = getPillarsTheme(isDark);
  const { use24HourFormat, setUse24HourFormat } = useTimeFormat();

  // Settings States
  const [notifications, setNotifications] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);
  const [adhanSound, setAdhanSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoLocation, setAutoLocation] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState('ISNA');

  // Save settings to AsyncStorage
  const saveSettings = async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  // Settings Sections
  const settingSections: SettingSection[] = [
    {
      id: 'prayer',
      title: 'Prayer & Notifications',
      icon: 'bell-outline',
      items: [
        {
          id: 'notifications',
          title: 'Prayer Notifications',
          subtitle: 'Get reminded for prayer times',
          icon: 'notifications',
          iconFamily: 'Ionicons',
          type: 'toggle',
          value: notifications,
        },
        {
          id: 'adhan',
          title: 'Adhan Sound',
          subtitle: 'Play call to prayer',
          icon: 'volume-high',
          iconFamily: 'Ionicons',
          type: 'toggle',
          value: adhanSound,
        },
        {
          id: 'vibration',
          title: 'Vibration',
          subtitle: 'Vibrate on notifications',
          icon: 'phone-portrait',
          iconFamily: 'Ionicons',
          type: 'toggle',
          value: vibration,
        },
        {
          id: 'calculation',
          title: 'Calculation Method',
          subtitle: calculationMethod,
          icon: 'calculator',
          iconFamily: 'Ionicons',
          type: 'select',
          value: calculationMethod,
        },
        {
          id: 'adjust',
          title: 'Adjust Prayer Times',
          subtitle: 'Fine-tune timings',
          icon: 'time',
          iconFamily: 'Ionicons',
          type: 'navigation',
          route: 'AdjustTimes',
        },
      ],
    },
    {
      id: 'appearance',
      title: 'Appearance & Display',
      icon: 'palette-outline',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Reduce eye strain',
          icon: isDark ? 'moon' : 'sunny',
          iconFamily: 'Ionicons',
          type: 'toggle',
          value: isDark,
        },
        {
          id: 'timeFormat',
          title: '24 Hour Format',
          subtitle: use24HourFormat ? '24:00' : '12:00 AM/PM',
          icon: 'clock-outline',
          iconFamily: 'MaterialCommunityIcons',
          type: 'toggle',
          value: use24HourFormat,
        },
      ],
    },
    {
      id: 'location',
      title: 'Location & Privacy',
      icon: 'map-marker-outline',
      items: [
        {
          id: 'autoLocation',
          title: 'Auto Location',
          subtitle: 'Update location automatically',
          icon: 'location',
          iconFamily: 'Ionicons',
          type: 'toggle',
          value: autoLocation,
        },
        {
          id: 'currentLocation',
          title: 'Current Location',
          subtitle: 'Toronto, Canada',
          icon: 'map',
          iconFamily: 'Ionicons',
          type: 'navigation',
          route: 'LocationPicker',
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Manage your data',
          icon: 'shield-checkmark',
          iconFamily: 'Ionicons',
          type: 'navigation',
          route: 'Privacy',
        },
      ],
    },
    {
      id: 'features',
      title: 'Features',
      icon: 'view-grid-outline',
      items: [
        {
          id: 'tasbih',
          title: 'Digital Tasbih',
          icon: 'counter',
          iconFamily: 'MaterialCommunityIcons',
          type: 'navigation',
          route: 'Tasbih',
        },
        {
          id: 'qibla',
          title: 'Qibla Direction',
          icon: 'compass',
          iconFamily: 'MaterialCommunityIcons',
          type: 'navigation',
          route: 'Qibla',
        },
      ],
    },
    {
      id: 'about',
      title: 'About & Support',
      icon: 'information-outline',
      items: [
        {
          id: 'rate',
          title: 'Rate Us',
          subtitle: 'Help us improve',
          icon: 'star',
          iconFamily: 'Ionicons',
          type: 'action',
          action: () => {
            Alert.alert('Thank You!', 'Your support means a lot to us!');
            // Open app store for rating
          },
        },
        {
          id: 'share',
          title: 'Share App',
          subtitle: 'Spread the benefit',
          icon: 'share-social',
          iconFamily: 'Ionicons',
          type: 'action',
          action: () => {
            Share.share({
              message: 'Check out Hayya - the best prayer times and Qibla app!',
              title: 'Hayya',
            });
          },
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'We value your opinion',
          icon: 'mail',
          iconFamily: 'Ionicons',
          type: 'action',
          action: () => Linking.openURL('mailto:hayya.prayers@gmail.com'),
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'Version 2.0.0',
          icon: 'information-circle-outline',
          iconFamily: 'Ionicons',
          type: 'navigation',
          route: 'About',
        },
      ],
    },
  ];

  const handleSettingToggle = async (sectionId: string, itemId: string, value: boolean) => {
    switch (itemId) {
      case 'notifications':
        setNotifications(value);
        saveSettings('notifications', value);
        await notificationService.saveSettings({ prayerReminders: value });
        if (value) {
          await notificationService.requestPermissions();
        }
        break;
      case 'adhan':
        setAdhanSound(value);
        saveSettings('adhanSound', value);
        await notificationService.saveSettings({ adhanSound: value });
        break;
      case 'vibration':
        setVibration(value);
        saveSettings('vibration', value);
        await notificationService.saveSettings({ vibration: value });
        break;
      case 'darkMode':
        toggleTheme();
        break;
      case 'timeFormat':
        setUse24HourFormat(value);
        break;
      case 'autoLocation':
        setAutoLocation(value);
        saveSettings('autoLocation', value);
        break;
    }
  };

  const handleSettingPress = (item: SettingItem) => {
    if (item.type === 'action' && item.action) {
      item.action();
    } else if (item.type === 'navigation' && item.route) {
      if (item.route === 'Tasbih' || item.route === 'Qibla') {
        navigation.navigate(item.route);
      } else if (item.route === 'AdjustTimes') {
        navigation.navigate('AdjustPrayerTimes');
      } else if (item.route === 'LocationPicker') {
        navigation.navigate('LocationSettings');
      } else if (item.route === 'Privacy') {
        navigation.navigate('PrivacySettings');
      } else if (item.route === 'About') {
        navigation.navigate('AboutScreen');
      } else {
        // Navigate to placeholder screens
        Alert.alert('Coming Soon', `${item.title} feature will be available soon!`);
      }
    } else if (item.type === 'select') {
      // Show selection modal based on the item
      if (item.id === 'calculation') {
        const calculationMethods = [
          { name: 'Muslim World League', value: 'MWL' },
          { name: 'Islamic Society of North America', value: 'ISNA' },
          { name: 'Egyptian General Authority', value: 'Egypt' },
          { name: 'Umm Al-Qura University, Mecca', value: 'Makkah' },
          { name: 'University of Islamic Sciences, Karachi', value: 'Karachi' },
          { name: 'Institute of Geophysics, Tehran', value: 'Tehran' },
          { name: 'Shia Ithna-Ansari', value: 'Jafari' },
        ];

        Alert.alert(
          'Calculation Method',
          'Select your preferred calculation method',
          [
            ...calculationMethods.map(method => ({
              text: method.name,
              onPress: () => {
                setCalculationMethod(method.value);
                saveSettings('calculationMethod', method.value);
              }
            })),
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Premium Header */}
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
              Settings
            </Text>
            <View style={{ width: 24 }} />
          </View>

        </SafeAreaView>
      </View>

      {/* Settings List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.id}
            entering={FadeInDown.delay(sectionIndex * 100).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name={section.icon as any}
                size={18}
                color={PillarsColors.gold[500]}
              />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                {section.title}
              </Text>
            </View>

            <View style={[styles.sectionContent, { backgroundColor: theme.background.card }]}>
              {section.items.map((item, index) => (
                <View key={item.id}>
                  <SettingRow
                    item={item}
                    onPress={() => handleSettingPress(item)}
                    onToggle={(value) => handleSettingToggle(section.id, item.id, value)}
                    isDark={isDark}
                  />
                  {index < section.items.length - 1 && (
                    <View style={[styles.separator, { backgroundColor: theme.divider }]} />
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
            Made with ❤️ for the Ummah
          </Text>
          <Text style={[styles.versionText, { color: theme.text.tertiary }]}>
            Version 2.0.0
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
  profileCard: {
    marginTop: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.card,
    overflow: 'hidden',
    ...PillarsShadows.lg,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PillarsSpacing.lg,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PillarsColors.glass.white[20],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  avatarText: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
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
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PillarsColors.glass.white[20],
    paddingHorizontal: PillarsSpacing.sm,
    paddingVertical: PillarsSpacing.xs,
    borderRadius: PillarsBorderRadius.full,
    gap: 4,
  },
  premiumText: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  section: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PillarsLayout.screenPadding,
    marginBottom: PillarsSpacing.sm,
    gap: PillarsSpacing.xs,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    marginHorizontal: PillarsLayout.screenPadding,
    borderRadius: PillarsBorderRadius.md,
    overflow: 'hidden',
    ...PillarsShadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.md,
    paddingHorizontal: PillarsSpacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
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
  settingSubtitle: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '400',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.xs,
  },
  selectText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    marginLeft: 60,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: PillarsSpacing.xl,
  },
  footerText: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 4,
  },
  versionText: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '400',
  },
});

export default PillarsSettingsScreen;