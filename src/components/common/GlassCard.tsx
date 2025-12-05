import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, SHADOWS } from '../../theme/constants';

interface GlassCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  gradient?: [string, string] | [string, string, string];
  blur?: boolean;
  animated?: boolean;
  elevation?: keyof typeof SHADOWS;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  gradient,
  blur = true,
  animated = true,
  elevation = 'md',
  onPress,
  ...props
}) => {
  const { isDark } = useTheme();

  const defaultGradient = isDark
    ? (['rgba(44,44,46,0.95)', 'rgba(44,44,46,0.85)'] as [string, string])
    : (['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)'] as [string, string]);

  const finalGradient = gradient || defaultGradient;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (animated) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 400,
      });
      opacity.value = withTiming(0.95, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400,
      });
      opacity.value = withTiming(1, { duration: 100 });
    }
  };

  const handlePress = (e: any) => {
    if (onPress) {
      onPress(e);
    }
  };

  const Container = onPress ? AnimatedTouchable : Animated.View;

  const blurOverlayColor = isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.1)';

  return (
    <Container
      style={[animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      {...props}
    >
      <AnimatedLinearGradient
        colors={finalGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          SHADOWS[elevation],
          style,
        ]}
      >
        <View style={styles.content}>
          {blur && (
            <View style={[styles.blurOverlay, { backgroundColor: blurOverlayColor }]} />
          )}
          {children}
        </View>
      </AnimatedLinearGradient>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});