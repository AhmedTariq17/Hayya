/**
 * Premium Loading Indicator
 * Apple-inspired loading states with smooth animations
 */

import React, { memo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AppleColors,
  Spacing,
  BorderRadius,
  Animations,
} from '../../theme/appleDesignSystem';
import { Body, Caption1 } from './PremiumText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumLoadingIndicatorProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'shimmer';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

// Animated Dots Component
const AnimatedDot = memo<{ index: number; color: string; size: number }>(({ index, color, size }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          marginHorizontal: size / 4,
        },
        animatedStyle,
      ]}
    />
  );
});

// Pulse Animation Component
const PulseAnimation = memo<{ color: string; size: number }>(({ color, size }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            type: 'timing',
            duration: 2000,
            delay: index * 400,
            loop: true,
          }}
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      ))}
      <View
        style={{
          width: size / 3,
          height: size / 3,
          borderRadius: size / 6,
          backgroundColor: color,
        }}
      />
    </View>
  );
});

// Shimmer Effect Component
const ShimmerEffect = memo<{ width: number; height: number }>(({ width, height }) => {
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width * 2, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        width,
        height,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
});

// Skeleton Loader Component
export const SkeletonLoader = memo<{ lines?: number; style?: ViewStyle }>(({ lines = 3, style }) => {
  const widths = [SCREEN_WIDTH * 0.9, SCREEN_WIDTH * 0.7, SCREEN_WIDTH * 0.8];

  return (
    <View style={[{ padding: Spacing.md }, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <View key={index} style={{ marginBottom: Spacing.sm }}>
          <ShimmerEffect
            width={widths[index % widths.length]}
            height={16}
          />
        </View>
      ))}
    </View>
  );
});

export const PremiumLoadingIndicator = memo<PremiumLoadingIndicatorProps>(({
  variant = 'spinner',
  size = 'medium',
  color,
  text,
  fullScreen = false,
  style,
}) => {
  const { isDark } = useTheme();
  const loadingColor = color || AppleColors.islamic.emerald[500];

  const getSize = (): number => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 60;
      default: return 40;
    }
  };

  const renderLoader = () => {
    const loaderSize = getSize();

    switch (variant) {
      case 'dots':
        return (
          <View style={{ flexDirection: 'row' }}>
            {[0, 1, 2].map((index) => (
              <AnimatedDot
                key={index}
                index={index}
                color={loadingColor}
                size={loaderSize / 3}
              />
            ))}
          </View>
        );

      case 'pulse':
        return <PulseAnimation color={loadingColor} size={loaderSize} />;

      case 'shimmer':
        return <ShimmerEffect width={SCREEN_WIDTH * 0.8} height={loaderSize} />;

      case 'skeleton':
        return <SkeletonLoader />;

      default: // spinner
        return (
          <ActivityIndicator
            size={size === 'small' ? 'small' : 'large'}
            color={loadingColor}
          />
        );
    }
  };

  const content = (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        style,
      ]}
    >
      {renderLoader()}
      {text && (
        <Caption1
          style={{ marginTop: Spacing.md, color: isDark ? AppleColors.semantic.textDark.secondary : AppleColors.semantic.text.secondary }}
        >
          {text}
        </Caption1>
      )}
    </Animated.View>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        {content}
      </View>
    );
  }

  return content;
});

PremiumLoadingIndicator.displayName = 'PremiumLoadingIndicator';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  fullScreen: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minWidth: 120,
  },
});

export default PremiumLoadingIndicator;