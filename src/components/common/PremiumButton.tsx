import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../theme/constants';

type ButtonVariant = 'primary' | 'secondary' | 'gradient' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  gradientColors?: string[];
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  haptic = true,
  gradientColors = [COLORS.primary.main, COLORS.primary.light],
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    'worklet';
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
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingHorizontal: SPACING.xl,
          paddingVertical: SPACING.md,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md - 2,
          minHeight: 48,
        };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return TYPOGRAPHY.fontSize.footnote;
      case 'large':
        return TYPOGRAPHY.fontSize.headline;
      default:
        return TYPOGRAPHY.fontSize.callout;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: COLORS.neutral.lightGray,
          },
          text: {
            color: COLORS.text.primary,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: COLORS.primary.main,
          },
          text: {
            color: COLORS.primary.main,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: COLORS.primary.main,
          },
        };
      case 'gradient':
        return {
          container: {},
          text: {
            color: COLORS.text.inverse,
          },
        };
      default:
        return {
          container: {
            backgroundColor: COLORS.primary.main,
          },
          text: {
            color: COLORS.text.inverse,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
          )}
          <Animated.Text
            style={[
              styles.text,
              {
                fontSize: getTextSize(),
                fontWeight: TYPOGRAPHY.fontWeight.semibold as TextStyle['fontWeight'],
              },
              variantStyles.text,
              textStyle,
            ]}
          >
            {title}
          </Animated.Text>
          {icon && iconPosition === 'right' && (
            <Animated.View style={styles.iconRight}>{icon}</Animated.View>
          )}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <AnimatedTouchable
        style={[animatedStyle, fullWidth && styles.fullWidth]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={1}
      >
        <AnimatedLinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            sizeStyles,
            SHADOWS.sm,
            style,
          ]}
        >
          {buttonContent}
        </AnimatedLinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        sizeStyles,
        variantStyles.container,
        variant === 'primary' && SHADOWS.sm,
        animatedStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {buttonContent}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});