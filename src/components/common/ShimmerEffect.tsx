import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../../theme/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShimmerEffectProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.sm,
  style,
}) => {
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <AnimatedLinearGradient
        colors={[
          'rgba(255, 255, 255, 0.1)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(255, 255, 255, 0.1)',
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFillObject, animatedStyle]}
      />
    </View>
  );
};

export const ShimmerCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <ShimmerEffect width={60} height={60} borderRadius={RADIUS.md} />
        <View style={styles.cardHeaderText}>
          <ShimmerEffect width="80%" height={16} style={{ marginBottom: 8 }} />
          <ShimmerEffect width="60%" height={14} />
        </View>
      </View>
      <ShimmerEffect width="100%" height={12} style={{ marginTop: 16 }} />
      <ShimmerEffect width="90%" height={12} style={{ marginTop: 8 }} />
      <ShimmerEffect width="70%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
};

export const ShimmerListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.listItem, style]}>
      <ShimmerEffect width={48} height={48} borderRadius={RADIUS.round} />
      <View style={styles.listItemText}>
        <ShimmerEffect width="70%" height={16} style={{ marginBottom: 8 }} />
        <ShimmerEffect width="50%" height={14} />
      </View>
    </View>
  );
};

export const ShimmerPrayerCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.prayerCard, style]}>
      <View style={styles.prayerCardRow}>
        <View style={styles.prayerLeft}>
          <ShimmerEffect width={48} height={48} borderRadius={RADIUS.md} />
          <View style={styles.prayerInfo}>
            <ShimmerEffect width={80} height={18} style={{ marginBottom: 6 }} />
            <ShimmerEffect width={60} height={14} />
          </View>
        </View>
        <ShimmerEffect width={50} height={32} borderRadius={RADIUS.lg} />
      </View>
    </View>
  );
};

export const ShimmerScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Header shimmer */}
      <View style={styles.header}>
        <ShimmerEffect width={200} height={32} style={{ marginBottom: 12 }} />
        <ShimmerEffect width={150} height={16} />
      </View>

      {/* Content shimmer */}
      <View style={styles.content}>
        <ShimmerCard style={{ marginBottom: 16 }} />
        <ShimmerListItem style={{ marginBottom: 12 }} />
        <ShimmerListItem style={{ marginBottom: 12 }} />
        <ShimmerListItem style={{ marginBottom: 12 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral.lightGray,
    overflow: 'hidden',
  },
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
  },
  listItemText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  prayerCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.md,
  },
  prayerCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prayerInfo: {
    marginLeft: SPACING.md,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    padding: SPACING.lg,
  },
});
