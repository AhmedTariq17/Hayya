import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
  FadeInDown,
  FadeInRight,
  ZoomIn,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Components
import { PremiumHeader } from '../components/common/PremiumHeader';
import { PremiumCard } from '../components/common/PremiumCard';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { IslamicPattern } from '../components/common/IslamicPattern';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Theme & Utils
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumPrayerTimesScreenProps {
  navigation: any;
}

interface Prayer {
  name: string;
  time: string;
  icon: string;
  color: string;
  completed: boolean;
}

interface PrayerHistory {
  date: string;
  prayers: {
    name: string;
    completed: boolean;
    time: string;
  }[];
}

const PremiumPrayerTimesScreen: React.FC<PremiumPrayerTimesScreenProps> = ({ navigation }) => {
  const { prayerTimes, loading, refresh, nextPrayer } = usePrayerTimes();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'today' | 'history'>('today');
  const [prayerHistory, setPrayerHistory] = useState<PrayerHistory[]>([]);

  // Animations
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  const prayers: Prayer[] = [
    { name: 'Fajr', time: '05:30 AM', icon: 'weather-sunset-up', color: COLORS.prayer.fajr, completed: true },
    { name: 'Sunrise', time: '07:00 AM', icon: 'weather-sunny', color: COLORS.prayer.sunrise, completed: true },
    { name: 'Dhuhr', time: '12:30 PM', icon: 'white-balance-sunny', color: COLORS.prayer.dhuhr, completed: false },
    { name: 'Asr', time: '15:45 PM', icon: 'weather-sunset-down', color: COLORS.prayer.asr, completed: false },
    { name: 'Maghrib', time: '18:30 PM', icon: 'weather-sunset', color: COLORS.prayer.maghrib, completed: false },
    { name: 'Isha', time: '20:00 PM', icon: 'weather-night', color: COLORS.prayer.isha, completed: false },
  ];

  useEffect(() => {
    // Start pulse animation
    pulseAnimation.value = withRepeat(
      withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Rotate animation for compass decoration
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );

    // Progress animation
    progressAnimation.value = withTiming(0.35, { duration: 2000, easing: Easing.out(Easing.cubic) });
  }, []);

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      calculateTimeUntilNext(now);
    }, 1000);

    // Check notification permissions
    checkNotificationPermissions();

    // Load prayer history
    loadPrayerHistory();

    return () => clearInterval(timer);
  }, []);

  const calculateTimeUntilNext = (now: Date) => {
    // Simple calculation - in production, use actual prayer time
    const nextPrayerTime = new Date();
    nextPrayerTime.setHours(12, 30, 0);

    if (now > nextPrayerTime) {
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
    }

    const diff = nextPrayerTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilNext({ hours, minutes, seconds });
  };

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const loadPrayerHistory = () => {
    // Mock data - in production, load from storage
    const mockHistory: PrayerHistory[] = [
      {
        date: 'Today',
        prayers: [
          { name: 'Fajr', completed: true, time: '05:30 AM' },
          { name: 'Dhuhr', completed: true, time: '12:30 PM' },
          { name: 'Asr', completed: false, time: '15:45 PM' },
          { name: 'Maghrib', completed: false, time: '18:30 PM' },
          { name: 'Isha', completed: false, time: '20:00 PM' },
        ],
      },
      {
        date: 'Yesterday',
        prayers: [
          { name: 'Fajr', completed: true, time: '05:28 AM' },
          { name: 'Dhuhr', completed: true, time: '12:32 PM' },
          { name: 'Asr', completed: true, time: '15:47 PM' },
          { name: 'Maghrib', completed: true, time: '18:28 PM' },
          { name: 'Isha', completed: true, time: '19:58 PM' },
        ],
      },
    ];
    setPrayerHistory(mockHistory);
  };

  const toggleNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!notificationsEnabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        Alert.alert('Success', 'Prayer notifications enabled successfully!');
      } else {
        Alert.alert('Permission Denied', 'Please enable notifications in settings.');
      }
    } else {
      setNotificationsEnabled(false);
      Alert.alert('Notifications Disabled', 'You can re-enable them anytime.');
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnimation.value * 100}%`,
  }));

  const CountdownCard = () => (
    <Animated.View entering={ZoomIn.springify()}>
      <PremiumCard
        style={styles.countdownCard}
        elevation="premium"
        gradient={[COLORS.primary.main, COLORS.primary.dark]}
        glowEffect
      >
        <View style={styles.patternOverlay}>
          <Animated.View style={rotateStyle}>
            <IslamicPattern type="star" size={200} color="rgba(255,255,255,0.1)" animated={false} />
          </Animated.View>
        </View>

        <View style={styles.countdownContent}>
          <Text style={styles.countdownLabel}>Next Prayer</Text>
          <Animated.View style={pulseStyle}>
            <Text style={styles.countdownPrayer}>{nextPrayer?.name || 'Dhuhr'}</Text>
          </Animated.View>
          <Text style={styles.countdownTime}>{nextPrayer?.time || '12:30 PM'}</Text>

          <View style={styles.timerContainer}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(timeUntilNext.hours).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Hours</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(timeUntilNext.minutes).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Minutes</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{String(timeUntilNext.seconds).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>Seconds</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, progressStyle]}>
                <LinearGradient
                  colors={[COLORS.secondary.gold, COLORS.secondary.lightGold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            </View>
            <Text style={styles.progressText}>35% of day completed</Text>
          </View>
        </View>
      </PremiumCard>
    </Animated.View>
  );

  const PrayerTimeCard = ({ prayer, index }: { prayer: Prayer; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <PremiumCard
        style={styles.prayerTimeCard}
        gradient={[`${prayer.color}10`, `${prayer.color}05`]}
        scaleFeedback
        haptic
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Handle prayer card press
        }}
      >
        <View style={[styles.prayerIconContainer, { backgroundColor: `${prayer.color}20` }]}>
          <MaterialCommunityIcons name={prayer.icon as any} size={28} color={prayer.color} />
        </View>

        <View style={styles.prayerInfo}>
          <Text style={styles.prayerName}>{prayer.name}</Text>
          <Text style={styles.prayerTime}>{prayer.time}</Text>
        </View>

        {prayer.completed ? (
          <View style={[styles.statusBadge, { backgroundColor: COLORS.semantic.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.semantic.success} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.alarmButton}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Reminder Set', `Reminder set for ${prayer.name} prayer`);
            }}
          >
            <Ionicons name="alarm-outline" size={20} color={COLORS.primary.main} />
          </TouchableOpacity>
        )}
      </PremiumCard>
    </Animated.View>
  );

  const HistoryCard = ({ history, index }: { history: PrayerHistory; index: number }) => {
    const completedCount = history.prayers.filter(p => p.completed).length;
    const completionRate = (completedCount / history.prayers.length) * 100;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <PremiumCard style={styles.historyCard} scaleFeedback haptic>
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>{history.date}</Text>
            <View style={styles.historyBadge}>
              <Text style={styles.historyBadgeText}>
                {completedCount}/{history.prayers.length}
              </Text>
            </View>
          </View>

          <View style={styles.historyProgressBar}>
            <LinearGradient
              colors={[COLORS.primary.main, COLORS.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.historyProgressFill, { width: `${completionRate}%` }]}
            />
          </View>

          <View style={styles.historyPrayers}>
            {history.prayers.map((prayer, idx) => (
              <View key={idx} style={styles.historyPrayerItem}>
                <Ionicons
                  name={prayer.completed ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={prayer.completed ? COLORS.semantic.success : COLORS.neutral.mediumGray}
                />
                <Text style={styles.historyPrayerName}>{prayer.name}</Text>
              </View>
            ))}
          </View>
        </PremiumCard>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <IslamicPattern type="geometric" size={SCREEN_WIDTH * 1.2} color={COLORS.primary.main} opacity={0.03} />
      </View>

      <PremiumHeader
        title="Prayer Times"
        subtitle={currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        showBackButton
        navigation={navigation}
        rightIcon="settings-outline"
        onRightPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('Settings');
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Countdown Card */}
        <CountdownCard />

        {/* Tab Selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'today' && styles.activeTab]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedTab('today');
            }}
          >
            <Text style={[styles.tabText, selectedTab === 'today' && styles.activeTabText]}>
              Today's Prayers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedTab('history');
            }}
          >
            <Text style={[styles.tabText, selectedTab === 'history' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {selectedTab === 'today' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Prayer Times</Text>
            {prayers.map((prayer, index) => (
              <PrayerTimeCard key={prayer.name} prayer={prayer} index={index} />
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prayer History</Text>
            {prayerHistory.map((history, index) => (
              <HistoryCard key={history.date} history={history} index={index} />
            ))}
          </View>
        )}

        {/* Notification Settings */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <PremiumCard
            style={styles.notificationCard}
            gradient={[COLORS.accent.purple + '10', COLORS.accent.purpleLight + '05']}
          >
            <View style={styles.notificationContent}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                  size={28}
                  color={notificationsEnabled ? COLORS.accent.purple : COLORS.neutral.darkGray}
                />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Prayer Notifications</Text>
                <Text style={styles.notificationSubtitle}>
                  {notificationsEnabled
                    ? 'You will be notified before each prayer'
                    : 'Enable notifications to never miss a prayer'}
                </Text>
              </View>
              <AnimatedButton
                title={notificationsEnabled ? 'Enabled' : 'Enable'}
                variant={notificationsEnabled ? 'success' : 'primary'}
                size="small"
                onPress={toggleNotifications}
                icon={notificationsEnabled ? 'checkmark' : 'notifications-outline'}
              />
            </View>
          </PremiumCard>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  countdownCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  patternOverlay: {
    position: 'absolute',
    top: -50,
    right: -50,
    opacity: 0.5,
  },
  countdownContent: {
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownPrayer: {
    fontSize: TYPOGRAPHY.fontSize.largeTitle,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    marginVertical: SPACING.xs,
  },
  countdownTime: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.secondary.lightGold,
    marginBottom: SPACING.xl,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  timerBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
  },
  timerLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  timerSeparator: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    marginHorizontal: SPACING.sm,
    opacity: 0.5,
  },
  progressContainer: {
    width: '100%',
    marginTop: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: RADIUS.lg,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  activeTabText: {
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.title3,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  prayerTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  prayerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  statusBadge: {
    padding: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  alarmButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  historyDate: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
  },
  historyBadge: {
    backgroundColor: COLORS.primary.light + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  historyBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.primary.main,
  },
  historyProgressBar: {
    height: 4,
    backgroundColor: COLORS.neutral.lightGray,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  historyProgressFill: {
    height: '100%',
  },
  historyPrayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  historyPrayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  historyPrayerName: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  },
  notificationCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent.purple + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.fontSize.footnote * TYPOGRAPHY.lineHeight.normal,
  },
});

export default PremiumPrayerTimesScreen;
