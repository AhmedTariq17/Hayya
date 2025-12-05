import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
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
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme/constants';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  gradient?: string[];
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  animated?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  gradient = COLORS.primary.gradient,
  size = 'medium',
  style,
  animated = true,
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const sizeMap = {
    small: 48,
    medium: 60,
    large: 72,
  };

  const iconSizeMap = {
    small: 24,
    medium: 28,
    large: 32,
  };

  const buttonSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  useEffect(() => {
    if (animated) {
      // Subtle pulse animation
      pulseScale.value = withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      );
    }
  }, [animated]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.9, {
      damping: 12,
      stiffness: 400,
    });
    rotate.value = withTiming(-10, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSequence(
      withSpring(1.1, {
        damping: 8,
        stiffness: 400,
      }),
      withSpring(1, {
        damping: 12,
        stiffness: 400,
      })
    );
    rotate.value = withSequence(
      withTiming(10, { duration: 100 }),
      withSpring(0, {
        damping: 10,
        stiffness: 200,
      })
    );
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Halo effect animation
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        haloScale.value = 1;
        haloOpacity.value = 0.5;
        haloScale.value = withTiming(1.8, { duration: 2000 });
        haloOpacity.value = withTiming(0, { duration: 2000 });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [animated]);

  const animatedHaloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  return (
    <AnimatedTouchable
      style={[
        styles.container,
        {
          width: buttonSize,
          height: buttonSize,
        },
        style,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
    >
      {/* Halo effect */}
      {animated && (
        <Animated.View
          style={[
            styles.halo,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            animatedHaloStyle,
          ]}
        >
          <LinearGradient
            colors={[...gradient, 'transparent'] as any}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}

      {/* Main button */}
      <Animated.View style={animatedButtonStyle}>
        <AnimatedLinearGradient
          colors={gradient as any}
          style={[
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            SHADOWS.lg,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={iconSize} color={COLORS.text.inverse} />
        </AnimatedLinearGradient>
      </Animated.View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  halo: {
    position: 'absolute',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
