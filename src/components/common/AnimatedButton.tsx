import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme/constants';
import { createButtonAccessibility } from '../../utils/accessibility';

type ButtonVariant = 'primary' | 'secondary' | 'gradient' | 'outline' | 'ghost' | 'premium' | 'success';
type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
  haptic?: boolean;
  glowEffect?: boolean;
  pulseAnimation?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const AnimatedButton = React.memo<AnimatedButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  gradient,
  haptic = true,
  glowEffect = false,
  pulseAnimation = false,
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (pulseAnimation && !disabled) {
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
        withTiming(1.05, { duration: 1000 })
      );
    }

    if (glowEffect && !disabled) {
      glowOpacity.value = withTiming(0.6, { duration: 1500 });
    }
  }, [pulseAnimation, glowEffect, disabled]);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 400,
      });

      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 300,
      });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Success animation
      rotation.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withSpring(0, { damping: 10, stiffness: 200 })
      );

      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, minHeight: 36 };
      case 'medium':
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, minHeight: 48 };
      case 'large':
        return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl, minHeight: 56 };
      case 'xlarge':
        return { paddingVertical: SPACING.xl, paddingHorizontal: SPACING.xxl, minHeight: 64 };
      default:
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, minHeight: 48 };
    }
  };

  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: TYPOGRAPHY.fontSize.footnote };
      case 'medium':
        return { fontSize: TYPOGRAPHY.fontSize.callout };
      case 'large':
        return { fontSize: TYPOGRAPHY.fontSize.headline };
      case 'xlarge':
        return { fontSize: TYPOGRAPHY.fontSize.title3 };
      default:
        return { fontSize: TYPOGRAPHY.fontSize.callout };
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? COLORS.neutral.mediumGray : COLORS.primary.main,
          },
          text: { color: COLORS.text.inverse },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? COLORS.neutral.lightGray : COLORS.secondary.gold,
          },
          text: { color: COLORS.text.inverse },
        };
      case 'success':
        return {
          container: {
            backgroundColor: disabled ? COLORS.neutral.lightGray : COLORS.semantic.success,
          },
          text: { color: COLORS.text.inverse },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: disabled ? COLORS.neutral.mediumGray : COLORS.primary.main,
          },
          text: { color: disabled ? COLORS.neutral.mediumGray : COLORS.primary.main },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: disabled ? COLORS.neutral.mediumGray : COLORS.primary.main },
        };
      case 'gradient':
      case 'premium':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: { color: COLORS.text.inverse },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const textSizeStyles = getTextSize();

  const defaultGradient = variant === 'premium'
    ? [COLORS.secondary.gold, COLORS.primary.main, COLORS.accent.teal]
    : [COLORS.primary.light, COLORS.primary.main];

  const finalGradient = gradient || defaultGradient;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.text.color} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={textSizeStyles.fontSize ? textSizeStyles.fontSize + 4 : 20}
              color={variantStyles.text.color}
              style={{ marginRight: SPACING.sm }}
            />
          )}
          <Text
            style={[
              styles.text,
              textSizeStyles,
              variantStyles.text,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={textSizeStyles.fontSize ? textSizeStyles.fontSize + 4 : 20}
              color={variantStyles.text.color}
              style={{ marginLeft: SPACING.sm }}
            />
          )}
        </View>
      )}
    </>
  );

  const accessibilityProps = createButtonAccessibility(
    title,
    loading ? 'Loading' : undefined,
    disabled || loading
  );

  return (
    <AnimatedTouchable
      activeOpacity={0.8}
      style={[
        animatedStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      {...accessibilityProps}
    >
      <View style={styles.wrapper}>
        {/* Glow Effect */}
        {glowEffect && !disabled && (
          <Animated.View style={[styles.glowEffect, glowStyle]}>
            <LinearGradient
              colors={[...finalGradient, 'transparent'] as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        )}

        {/* Button Container */}
        <View
          style={[
            styles.container,
            sizeStyles,
            variantStyles.container,
            (variant === 'gradient' || variant === 'premium') && styles.gradientContainer,
            variant === 'premium' && SHADOWS.premium,
            disabled && styles.disabled,
          ]}
        >
          {(variant === 'gradient' || variant === 'premium') && !disabled ? (
            <LinearGradient
              colors={finalGradient as any}
              style={[StyleSheet.absoluteFillObject, styles.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          ) : null}
          {renderContent()}
        </View>
      </View>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  gradientContainer: {
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: RADIUS.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: RADIUS.lg + 10,
  },
});