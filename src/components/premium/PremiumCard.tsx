/**
 * Premium Card Component
 * Apple-inspired card with glass morphism and smooth animations
 */

import React, { memo, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { AppleColors, Elevation, BorderRadius, Animations, Spacing } from '../../theme/appleDesignSystem';

interface PremiumCardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'elevated' | 'flat' | 'glass' | 'gradient';
  elevation?: keyof typeof Elevation;
  blur?: boolean;
  blurIntensity?: number;
  gradient?: string[];
  haptic?: boolean;
  animated?: boolean;
  delay?: number;
  borderRadius?: keyof typeof BorderRadius.card;
  padding?: keyof typeof Spacing;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const PremiumCard = memo<PremiumCardProps>(({
  children,
  style,
  variant = 'elevated',
  elevation = 'level2',
  blur = false,
  blurIntensity = 80,
  gradient,
  haptic = true,
  animated = true,
  delay = 0,
  borderRadius = 'medium',
  padding = 'md',
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, Animations.spring.gentle);
    opacity.value = withTiming(0.8, { duration: 100 });
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressIn?.({} as any);
  }, [haptic, onPressIn]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, Animations.spring.bouncy);
    opacity.value = withTiming(1, { duration: 200 });
    onPressOut?.({} as any);
  }, [onPressOut]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), []);

  const getBackgroundColor = () => {
    if (isDark) {
      switch (variant) {
        case 'glass': return 'rgba(255, 255, 255, 0.05)';
        case 'flat': return AppleColors.semantic.backgroundDark.tertiary;
        case 'gradient': return 'transparent';
        default: return AppleColors.semantic.backgroundDark.elevated;
      }
    } else {
      switch (variant) {
        case 'glass': return 'rgba(255, 255, 255, 0.7)';
        case 'flat': return AppleColors.semantic.background.secondary;
        case 'gradient': return 'transparent';
        default: return AppleColors.semantic.background.elevated;
      }
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: BorderRadius.card[borderRadius],
    padding: Spacing[padding] as number,
    ...(variant === 'elevated' && Elevation[elevation]),
    ...(variant === 'glass' && {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: isDark
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(255, 255, 255, 0.3)',
      overflow: 'hidden',
    }),
    ...(variant === 'gradient' && {
      overflow: 'hidden',
    }),
  };

  const content = (
    <>
      {variant === 'gradient' && gradient && (
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { borderRadius: BorderRadius.card[borderRadius] }]}
        />
      )}
      {blur && Platform.OS === 'ios' && (
        <AnimatedBlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {children}
    </>
  );

  if (!onPress) {
    return (
      <Animated.View
        entering={animated ? FadeIn.delay(delay).springify() : undefined}
        exiting={animated ? FadeOut : undefined}
        style={[cardStyle, style]}
        {...props}
      >
        {content}
      </Animated.View>
    );
  }

  return (
    <AnimatedTouchable
      entering={animated ? FadeIn.delay(delay).springify() : undefined}
      exiting={animated ? FadeOut : undefined}
      style={[cardStyle, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled}
      {...props}
    >
      {content}
    </AnimatedTouchable>
  );
});

PremiumCard.displayName = 'PremiumCard';

const styles = StyleSheet.create({
  // Add any additional styles if needed
});

export default PremiumCard;