import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../../theme/constants';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'custom';
  lines?: number;
  spacing?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'custom',
  lines = 1,
  spacing = SPACING.sm,
}) => {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(2, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 2],
      [-300, 300]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getVariantStyles = (): {
    width: number | string;
    height: number | string;
    borderRadius: number;
  } => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: 16,
          borderRadius: RADIUS.xs,
        };
      case 'card':
        return {
          width: width || '100%',
          height: height || 120,
          borderRadius: RADIUS.lg,
        };
      case 'avatar':
        return {
          width: width || 60,
          height: height || 60,
          borderRadius: RADIUS.round,
        };
      case 'button':
        return {
          width: width || 120,
          height: height || 44,
          borderRadius: RADIUS.md,
        };
      default:
        return {
          width,
          height,
          borderRadius: borderRadius || RADIUS.sm,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderSkeleton = () => (
    <View
      style={[
        styles.skeleton,
        {
          width: variantStyles.width as any,
          height: variantStyles.height as any,
          borderRadius: variantStyles.borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <AnimatedLinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.3)',
            'rgba(255, 255, 255, 0.5)',
            'rgba(255, 255, 255, 0.3)',
            'transparent',
          ] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <View>
        {Array.from({ length: lines }).map((_, index) => (
          <View
            key={index}
            style={[
              index > 0 && { marginTop: spacing },
              index === lines - 1 && { width: '70%' }, // Last line shorter
            ]}
          >
            {renderSkeleton()}
          </View>
        ))}
      </View>
    );
  }

  return renderSkeleton();
};

export const SkeletonGroup: React.FC<{
  children: React.ReactNode;
  loading?: boolean;
}> = ({ children, loading = true }) => {
  if (!loading) {
    return <>{children}</>;
  }

  return <View style={styles.group}>{children}</View>;
};

// Preset skeleton layouts
export const CardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <SkeletonLoader variant="card" height={180} />
    <View style={styles.cardContent}>
      <SkeletonLoader variant="text" width="60%" />
      <SkeletonLoader variant="text" lines={2} style={{ marginTop: SPACING.sm }} />
      <View style={styles.cardFooter}>
        <SkeletonLoader variant="avatar" width={24} height={24} />
        <SkeletonLoader variant="text" width="30%" />
      </View>
    </View>
  </View>
);

export const ListItemSkeleton: React.FC = () => (
  <View style={styles.listItemSkeleton}>
    <SkeletonLoader variant="avatar" />
    <View style={styles.listItemContent}>
      <SkeletonLoader variant="text" width="70%" />
      <SkeletonLoader variant="text" width="50%" style={{ marginTop: SPACING.xs }} />
    </View>
  </View>
);

export const PrayerTimeSkeleton: React.FC = () => (
  <View style={styles.prayerTimeSkeleton}>
    <View style={styles.prayerHeader}>
      <SkeletonLoader variant="text" width="40%" height={24} />
      <SkeletonLoader variant="text" width="30%" height={20} />
    </View>
    <View style={styles.prayerTimes}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.prayerTimeItem}>
          <SkeletonLoader variant="text" width={60} height={14} />
          <SkeletonLoader variant="text" width={50} height={18} style={{ marginTop: 4 }} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.neutral.lightGray,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '200%',
  },
  group: {
    // Container for skeleton groups
  },
  cardSkeleton: {
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  listItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  listItemContent: {
    flex: 1,
  },
  prayerTimeSkeleton: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.lg,
  },
  prayerHeader: {
    marginBottom: SPACING.lg,
  },
  prayerTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prayerTimeItem: {
    alignItems: 'center',
  },
});