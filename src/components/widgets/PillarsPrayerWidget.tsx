/**
 * Pillars-Inspired Prayer Times Widget
 * Modern circular progress design with beautiful animations
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient as SVGGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../contexts/ThemeContext';
import { useTimeFormat } from '../../contexts/TimeFormatContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  getPillarsTheme,
} from '../../theme/pillarsTheme';
import { PillarsCard } from '../ui/PillarsCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PrayerTime {
  name: string;
  time: string;
  arabic?: string;
}

interface PillarsPrayerWidgetProps {
  prayerTimes: any;
  nextPrayer: any;
  location?: any;
  loading?: boolean;
  onPress?: () => void;
}

const CircularProgress: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string[];
}> = ({ progress, size, strokeWidth, color }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1500,
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value / 100),
    };
  });

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg width={size} height={size} style={styles.circularProgress}>
      <Defs>
        <SVGGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          {color.map((c, i) => (
            <Stop
              key={i}
              offset={`${(i / (color.length - 1)) * 100}%`}
              stopColor={c}
              stopOpacity="1"
            />
          ))}
        </SVGGradient>
      </Defs>
      {/* Background Circle */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={PillarsColors.glass.black[10]}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress Circle */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PrayerTimeCard: React.FC<{
  prayer: PrayerTime;
  isNext: boolean;
  isPassed: boolean;
  index: number;
}> = ({ prayer, isNext, isPassed, index }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const { formatTime } = useTimeFormat();

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'fajr':
        return 'partly-sunny-outline';
      case 'sunrise':
        return 'sunny-outline';
      case 'dhuhr':
        return 'sunny';
      case 'asr':
        return 'cloudy-outline';
      case 'maghrib':
        return 'moon-outline';
      case 'isha':
        return 'moon';
      default:
        return 'time-outline';
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[
        styles.prayerTimeCard,
        isNext && styles.nextPrayerCard,
        isPassed && styles.passedPrayerCard,
      ]}
    >
      <View style={styles.prayerTimeLeft}>
        <View
          style={[
            styles.prayerIconContainer,
            {
              backgroundColor: isNext
                ? `${PillarsColors.gold[500]}20`
                : isPassed
                ? PillarsColors.glass.black[5]
                : `${PillarsColors.navy[500]}10`,
            },
          ]}
        >
          <Ionicons
            name={getIcon(prayer.name) as any}
            size={20}
            color={
              isNext
                ? PillarsColors.gold[500]
                : isPassed
                ? theme.text.tertiary
                : PillarsColors.navy[500]
            }
          />
        </View>
        <View>
          <Text
            style={[
              styles.prayerName,
              {
                color: isNext
                  ? PillarsColors.gold[600]
                  : isPassed
                  ? theme.text.tertiary
                  : theme.text.primary,
              },
            ]}
          >
            {prayer.name}
          </Text>
          {prayer.arabic && (
            <Text
              style={[
                styles.prayerArabic,
                {
                  color: isNext
                    ? PillarsColors.gold[500]
                    : theme.text.secondary,
                },
              ]}
            >
              {prayer.arabic}
            </Text>
          )}
        </View>
      </View>
      <Text
        style={[
          styles.prayerTime,
          {
            color: isNext
              ? PillarsColors.gold[600]
              : isPassed
              ? theme.text.tertiary
              : theme.text.primary,
          },
        ]}
      >
        {formatTime(prayer.time)}
      </Text>
      {isNext && (
        <View style={styles.nextBadge}>
          <Text style={styles.nextBadgeText}>NEXT</Text>
        </View>
      )}
    </Animated.View>
  );
};

export const PillarsPrayerWidget: React.FC<PillarsPrayerWidgetProps> = ({
  prayerTimes,
  nextPrayer,
  location,
  loading,
  onPress,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const { formatTime } = useTimeFormat();
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedCenterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const allPrayers = useMemo(() => {
    if (!prayerTimes?.timings) return [];
    return [
      { name: 'Fajr', time: prayerTimes.timings.Fajr, arabic: 'الفجر' },
      { name: 'Sunrise', time: prayerTimes.timings.Sunrise, arabic: 'الشروق' },
      { name: 'Dhuhr', time: prayerTimes.timings.Dhuhr, arabic: 'الظهر' },
      { name: 'Asr', time: prayerTimes.timings.Asr, arabic: 'العصر' },
      { name: 'Maghrib', time: prayerTimes.timings.Maghrib, arabic: 'المغرب' },
      { name: 'Isha', time: prayerTimes.timings.Isha, arabic: 'العشاء' },
    ];
  }, [prayerTimes]);

  if (loading) {
    return (
      <PillarsCard variant="glass" style={styles.loadingContainer}>
        <View style={styles.shimmer} />
      </PillarsCard>
    );
  }

  const progress = nextPrayer?.percentage || 0;

  return (
    <View style={styles.container}>
      {/* Circular Progress Widget */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.();
        }}
      >
        <PillarsCard
          variant="gradient"
          gradient={
            isDark
              ? [PillarsColors.black[900], PillarsColors.navy[950]]
              : [PillarsColors.white, PillarsColors.navy[50]]
          }
          style={styles.circularWidget}
          shadow="lg"
        >
          <View style={styles.circularContainer}>
            <CircularProgress
              progress={progress}
              size={CIRCLE_SIZE}
              strokeWidth={STROKE_WIDTH}
              color={PillarsColors.gradients.navyGold}
            />
            <Animated.View style={[styles.circularContent, animatedCenterStyle]}>
              <Text style={[styles.nextLabel, { color: theme.text.secondary }]}>
                {nextPrayer ? 'Next Prayer' : 'Loading...'}
              </Text>
              <Text style={[styles.nextPrayerName, { color: PillarsColors.gold[500] }]}>
                {nextPrayer?.name || '--'}
              </Text>
              <Text style={[styles.nextPrayerTime, { color: theme.text.primary }]}>
                {nextPrayer ? formatTime(nextPrayer.time) : '--:--'}
              </Text>
              <Text style={[styles.timeUntil, { color: theme.text.secondary }]}>
                {nextPrayer?.timeUntil || ''}
              </Text>
            </Animated.View>
          </View>

          {/* Location Badge */}
          {location && (
            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={12} color={PillarsColors.gold[500]} />
              <Text style={[styles.locationText, { color: theme.text.secondary }]}>
                {location.city || 'Unknown'}
              </Text>
            </View>
          )}
        </PillarsCard>
      </TouchableOpacity>

      {/* Prayer Times List */}
      <View style={styles.prayerTimesList}>
        {allPrayers.map((prayer, index) => {
          const isNext = prayer.name === nextPrayer?.name;
          const isPassed = false; // TODO: Calculate if prayer time has passed
          return (
            <PrayerTimeCard
              key={prayer.name}
              prayer={prayer}
              isNext={isNext}
              isPassed={isPassed}
              index={index}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: PillarsSpacing.xl,
  },
  loadingContainer: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: PillarsColors.glass.black[5],
  },
  circularWidget: {
    padding: PillarsSpacing.xl,
    alignItems: 'center',
    marginBottom: PillarsSpacing.lg,
  },
  circularContainer: {
    position: 'relative',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    position: 'absolute',
  },
  circularContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  nextPrayerTime: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 13,
    fontWeight: '500',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: PillarsSpacing.md,
    paddingHorizontal: PillarsSpacing.md,
    paddingVertical: PillarsSpacing.xs,
    backgroundColor: PillarsColors.glass.gold[10],
    borderRadius: PillarsBorderRadius.full,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  prayerTimesList: {
    marginTop: PillarsSpacing.xs,
  },
  prayerTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.md,
    paddingHorizontal: PillarsSpacing.lg,
    marginBottom: PillarsSpacing.sm,
    backgroundColor: PillarsColors.glass.white[5],
    borderRadius: PillarsBorderRadius.md,
    position: 'relative',
  },
  nextPrayerCard: {
    backgroundColor: PillarsColors.glass.gold[10],
    borderWidth: 1,
    borderColor: PillarsColors.gold[500],
  },
  passedPrayerCard: {
    opacity: 0.6,
  },
  prayerTimeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  prayerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: 12,
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  nextBadge: {
    position: 'absolute',
    top: -8,
    right: PillarsSpacing.md,
    backgroundColor: PillarsColors.gold[500],
    paddingHorizontal: PillarsSpacing.sm,
    paddingVertical: 2,
    borderRadius: PillarsBorderRadius.xs,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default PillarsPrayerWidget;