import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../theme/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string[];
  style?: any;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = COLORS.primary.gradient,
  style,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const dotSize = sizeMap[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600 }),
        withTiming(0.9, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const getDotStyle = (index: number) => {
    const angle = (index * 360) / 8;
    const radian = (angle * Math.PI) / 180;
    const distance = dotSize / 1.5;
    const x = Math.cos(radian) * distance;
    const y = Math.sin(radian) * distance;

    return {
      position: 'absolute' as const,
      left: dotSize / 2 + x - dotSize / 6,
      top: dotSize / 2 + y - dotSize / 6,
      width: dotSize / 3,
      height: dotSize / 3,
      borderRadius: dotSize / 6,
      opacity: 1 - index * 0.1,
    };
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          {
            width: dotSize * 2,
            height: dotSize * 2,
          },
          animatedStyle,
        ]}
      >
        {[...Array(8)].map((_, index) => (
          <View key={index} style={getDotStyle(index)}>
            <LinearGradient
              colors={color as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export const PulsingDot: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = COLORS.primary.gradient,
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const sizeMap = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const dotSize = sizeMap[size];

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.ease }),
        withTiming(1, { duration: 800, easing: Easing.ease })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.pulsingContainer, style]}>
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={color as any}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    </View>
  );
};

export const BouncingDots: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = COLORS.primary.gradient,
  style,
}) => {
  const sizeMap = {
    small: 6,
    medium: 10,
    large: 14,
  };

  const dotSize = sizeMap[size];

  const DotComponent = ({ delay }: { delay: number }) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-dotSize * 2, { duration: 400, easing: Easing.ease }),
          withTiming(0, { duration: 400, easing: Easing.ease })
        ),
        -1
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            marginHorizontal: dotSize / 2,
            overflow: 'hidden',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={color as any}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={[styles.bouncingContainer, style]}>
      <DotComponent delay={0} />
      <DotComponent delay={200} />
      <DotComponent delay={400} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bouncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
