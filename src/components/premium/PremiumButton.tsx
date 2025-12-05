/**
 * Premium Button Component
 * Apple-inspired button with haptic feedback and smooth animations
 */

import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AppleColors,
  Typography,
  BorderRadius,
  Animations,
  Spacing,
  Elevation,
} from '../../theme/appleDesignSystem';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'gradient' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'pill';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  haptic?: boolean;
  animated?: boolean;
  gradient?: string[];
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const PremiumButton = memo<PremiumButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  animated = true,
  gradient = AppleColors.gradients.premium,
  style,
  textStyle,
}) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, Animations.spring.gentle);
    opacity.value = withTiming(0.8, { duration: 100 });
    if (haptic && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [haptic, disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, Animations.spring.bouncy);
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  }, [disabled, loading, onPress, haptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(
      opacity.value,
      [0.8, 1],
      [disabled ? 0.5 : 0.8, disabled ? 0.5 : 1]
    ),
  }), [disabled]);

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: BorderRadius.button.small,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderRadius: BorderRadius.button.large,
        };
      case 'pill':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderRadius: BorderRadius.button.pill,
        };
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md - 2,
          borderRadius: BorderRadius.button.medium,
        };
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'small': return Typography.sizes.footnote;
      case 'large': return Typography.sizes.headline;
      default: return Typography.sizes.body;
    }
  };

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: isDark
              ? AppleColors.semantic.backgroundDark.tertiary
              : AppleColors.semantic.background.tertiary,
            ...Elevation.level1,
          },
          text: {
            color: isDark
              ? AppleColors.semantic.textDark.primary
              : AppleColors.semantic.text.primary,
          },
        };
      case 'tertiary':
        return {
          button: {
            backgroundColor: isDark
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.05)',
          },
          text: {
            color: AppleColors.islamic.emerald[500],
          },
        };
      case 'ghost':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(0, 0, 0, 0.2)',
          },
          text: {
            color: isDark
              ? AppleColors.semantic.textDark.primary
              : AppleColors.semantic.text.primary,
          },
        };
      case 'gradient':
        return {
          button: {
            backgroundColor: 'transparent',
            overflow: 'hidden',
          },
          text: {
            color: '#FFFFFF',
            fontWeight: Typography.weights.semibold as any,
          },
        };
      default: // primary
        return {
          button: {
            backgroundColor: AppleColors.islamic.emerald[500],
            ...Elevation.level2,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: Typography.weights.medium as any,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle: ViewStyle = {
    ...sizeStyles,
    ...variantStyles.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullWidth && { width: '100%' }),
  };

  const textStyles: TextStyle = {
    fontSize: getTextSize(),
    fontFamily: Typography.fonts.medium,
    ...variantStyles.text,
  };

  return (
    <AnimatedTouchable
      entering={animated ? FadeIn.springify() : undefined}
      style={[buttonStyle, animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
    >
      {variant === 'gradient' && (
        <AnimatedLinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={getTextSize() + 2}
              color={variantStyles.text.color}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text style={[textStyles, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={getTextSize() + 2}
              color={variantStyles.text.color}
              style={{ marginLeft: Spacing.sm }}
            />
          )}
        </>
      )}
    </AnimatedTouchable>
  );
});

PremiumButton.displayName = 'PremiumButton';

export default PremiumButton;