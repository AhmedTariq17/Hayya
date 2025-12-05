import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../theme/constants';

interface PremiumCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  gradient?: string[];
  blur?: boolean;
  blurIntensity?: number;
  elevation?: 'sm' | 'md' | 'lg' | 'xl' | 'premium';
  haptic?: boolean;
  scaleFeedback?: boolean;
  glowEffect?: boolean;
  borderGradient?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const PremiumCard = React.memo<PremiumCardProps>(({
  children,
  style,
  gradient = ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)'],
  blur = false,
  blurIntensity = 80,
  elevation = 'md',
  haptic = true,
  scaleFeedback = true,
  glowEffect = false,
  borderGradient = false,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0.5);

  useEffect(() => {
    if (glowEffect) {
      glowOpacity.value = withSpring(0.3, {
        damping: 20,
        stiffness: 100,
      });
    }

    if (borderGradient) {
      borderOpacity.value = withTiming(1, {
        duration: 1000,
      });
    }
  }, [glowEffect, borderGradient]);

  const handlePressIn = (event: any) => {
    if (scaleFeedback) {
      scale.value = withSpring(0.96, {
        damping: 15,
        stiffness: 300,
      });
    }

    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    if (scaleFeedback) {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });
    }

    onPressOut?.(event);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const shadowStyle = SHADOWS[elevation] || SHADOWS.md;

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <View style={[styles.container, shadowStyle, style]}>
        {/* Glow Effect */}
        {glowEffect && (
          <Animated.View style={[styles.glowEffect, glowStyle]}>
            <LinearGradient
              colors={[COLORS.primary.light + '40', COLORS.primary.main + '20', 'transparent'] as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
        )}

        {/* Border Gradient */}
        {borderGradient && (
          <Animated.View style={[styles.borderGradient, borderStyle]}>
            <AnimatedLinearGradient
              colors={[COLORS.primary.light, COLORS.secondary.gold, COLORS.accent.teal] as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        )}

        {/* Background */}
        {blur ? (
          <BlurView
            intensity={blurIntensity}
            tint="light"
            style={[styles.content, { overflow: 'hidden' }]}
          >
            <LinearGradient
              colors={gradient as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {children}
          </BlurView>
        ) : (
          <View style={styles.content}>
            <LinearGradient
              colors={gradient as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {children}
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.background.primary,
  },
  content: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: RADIUS.xl + 20,
  },
  borderGradient: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: RADIUS.xl,
    padding: 1,
  },
});