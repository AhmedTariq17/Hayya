/**
 * Pillars-Inspired Card Components
 * Modern cards with glassmorphism and beautiful animations
 */

import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../contexts/ThemeContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  getPillarsTheme,
} from '../../theme/pillarsTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface PillarsCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'glass' | 'solid' | 'gradient' | 'outlined';
  gradient?: string[];
  padding?: number;
  margin?: number;
  borderRadius?: number;
  shadow?: keyof typeof PillarsShadows;
  animated?: boolean;
  delay?: number;
  haptic?: boolean;
  blur?: boolean;
  blurIntensity?: number;
}

export const PillarsCard: React.FC<PillarsCardProps> = ({
  children,
  style,
  onPress,
  variant = 'glass',
  gradient,
  padding = PillarsSpacing.lg,
  margin = 0,
  borderRadius = PillarsBorderRadius.card,
  shadow = 'md',
  animated = true,
  delay = 0,
  haptic = true,
  blur = true,
  blurIntensity = 20,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getBackgroundStyle = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: isDark
            ? PillarsColors.glass.white[10]
            : PillarsColors.glass.white[80],
          borderWidth: 1,
          borderColor: isDark
            ? PillarsColors.glass.white[20]
            : PillarsColors.glass.black[10],
        };
      case 'solid':
        return {
          backgroundColor: isDark
            ? PillarsColors.black[900]
            : PillarsColors.white as string,
        };
      case 'gradient':
        return {};
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: isDark
            ? PillarsColors.glass.white[30]
            : PillarsColors.glass.black[20],
        };
      default:
        return {};
    }
  };

  const cardStyle = [
    styles.card,
    getBackgroundStyle(),
    {
      padding,
      margin,
      borderRadius,
      ...PillarsShadows[shadow],
    },
    style,
  ];

  const content = (
    <>
      {variant === 'gradient' && gradient && (
        <LinearGradient
          colors={gradient as any}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {variant === 'glass' && blur && Platform.OS === 'ios' && (
        <AnimatedBlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <AnimatedTouchable
        activeOpacity={1}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animated && animatedStyle] as any}
        entering={animated ? FadeInUp.delay(delay).springify() : undefined}
        layout={animated ? Layout.springify() : undefined}
      >
        {content}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View
      style={cardStyle}
      entering={animated ? FadeInUp.delay(delay).springify() : undefined}
      layout={animated ? Layout.springify() : undefined}
    >
      {content}
    </Animated.View>
  );
};

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  color = PillarsColors.navy[500],
  size = 'medium',
  style,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 100,
          height: 100,
          iconSize: 32,
        };
      case 'medium':
        return {
          width: 120,
          height: 120,
          iconSize: 40,
        };
      case 'large':
        return {
          width: 160,
          height: 160,
          iconSize: 48,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <PillarsCard
      variant="glass"
      onPress={onPress}
      style={{
        width: sizeStyles.width,
        height: sizeStyles.height,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        ...(style as any),
      }}
      padding={PillarsSpacing.md}
    >
      <View
        style={[
          styles.actionIconContainer,
          {
            backgroundColor: `${color}15`,
            width: sizeStyles.iconSize + 16,
            height: sizeStyles.iconSize + 16,
          },
        ]}
      >
        {icon}
      </View>
      <Animated.Text
        style={[
          styles.actionTitle,
          {
            color: theme.text.primary,
            fontSize: size === 'small' ? 13 : 15,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Animated.Text>
      {subtitle && (
        <Animated.Text
          style={[
            styles.actionSubtitle,
            {
              color: theme.text.secondary,
              fontSize: size === 'small' ? 11 : 12,
            },
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Animated.Text>
      )}
    </PillarsCard>
  );
};

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  icon,
  color = PillarsColors.navy[500],
  trend,
  trendValue,
  style,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return PillarsColors.semantic.success;
      case 'down':
        return PillarsColors.semantic.error;
      default:
        return theme.text.secondary;
    }
  };

  return (
    <PillarsCard
      variant="glass"
      style={[styles.statCard, style] as any}
      padding={PillarsSpacing.md}
    >
      {icon && (
        <View
          style={[
            styles.statIconContainer,
            { backgroundColor: `${color}15` },
          ]}
        >
          {icon}
        </View>
      )}
      <View style={styles.statContent}>
        <Animated.Text
          style={[
            styles.statValue,
            { color: theme.text.primary },
          ]}
        >
          {value}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.statLabel,
            { color: theme.text.secondary },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
        {trend && trendValue && (
          <View style={styles.statTrend}>
            <Animated.Text
              style={[
                styles.statTrendValue,
                { color: getTrendColor() },
              ]}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </Animated.Text>
          </View>
        )}
      </View>
    </PillarsCard>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  actionIconContainer: {
    borderRadius: PillarsBorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PillarsSpacing.sm,
  },
  actionTitle: {
    fontWeight: '600',
    marginTop: PillarsSpacing.xs,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: PillarsBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statTrend: {
    marginTop: 4,
  },
  statTrendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PillarsCard;