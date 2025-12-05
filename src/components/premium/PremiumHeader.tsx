/**
 * Premium Header Component
 * Apple-inspired navigation header with blur effects
 */

import React, { memo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AppleColors,
  Spacing,
  Typography,
  BorderRadius,
  Elevation,
  ZIndex,
} from '../../theme/appleDesignSystem';
import { Title2, Subheadline } from './PremiumText';

interface PremiumHeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  blur?: boolean;
  gradient?: boolean;
  gradientColors?: string[];
  scrollY?: any; // SharedValue from reanimated
  style?: ViewStyle;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const PremiumHeader = memo<PremiumHeaderProps>(({
  title,
  subtitle,
  leftIcon = 'arrow-back',
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  blur = true,
  gradient = false,
  gradientColors,
  scrollY,
  style,
  centerComponent,
  rightComponent,
  leftComponent,
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;
  const titleOpacity = useSharedValue(1);
  const headerOpacity = useSharedValue(transparent ? 0 : 1);

  useEffect(() => {
    if (scrollY) {
      scrollY.value = 0;
    }
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const opacity = interpolate(
      scrollY.value,
      [0, 50, 100],
      [transparent ? 0 : 0.95, 0.98, 1],
      Extrapolation.CLAMP
    );

    const borderOpacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor: transparent
        ? `rgba(255, 255, 255, ${opacity * 0.95})`
        : undefined,
      borderBottomWidth: borderOpacity * StyleSheet.hairlineWidth,
      borderBottomColor: isDark
        ? AppleColors.semantic.separatorDark.nonOpaque
        : AppleColors.semantic.separator.nonOpaque,
    };
  }, [transparent, isDark]);

  const animatedTitleStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [0, -2],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0.95],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  }, []);

  const handleLeftPress = () => {
    if (onLeftPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onLeftPress();
    }
  };

  const handleRightPress = () => {
    if (onRightPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRightPress();
    }
  };

  const backgroundColor = isDark
    ? AppleColors.semantic.backgroundDark.elevated
    : AppleColors.semantic.background.elevated;

  const defaultGradientColors = isDark
    ? [AppleColors.islamic.emerald[800], AppleColors.islamic.emerald[900]]
    : AppleColors.gradients.premium;

  return (
    <>
      <StatusBar
        barStyle={isDark || gradient ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        entering={SlideInDown.springify()}
        style={[
          styles.container,
          {
            height: headerHeight,
            paddingTop: insets.top,
            backgroundColor: transparent ? 'transparent' : backgroundColor,
          },
          !transparent && Elevation.level2,
          animatedHeaderStyle,
          style,
        ]}
      >
        {/* Background Gradient */}
        {gradient && (
          <LinearGradient
            colors={(gradientColors || defaultGradientColors) as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Blur Background */}
        {blur && transparent && Platform.OS === 'ios' && (
          <AnimatedBlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftComponent ? (
              leftComponent
            ) : onLeftPress ? (
              <TouchableOpacity
                onPress={handleLeftPress}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={leftIcon as any}
                  size={24}
                  color={
                    gradient || transparent
                      ? '#FFFFFF'
                      : isDark
                      ? AppleColors.semantic.textDark.primary
                      : AppleColors.semantic.text.primary
                  }
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            {centerComponent ? (
              centerComponent
            ) : (
              <Animated.View style={animatedTitleStyle}>
                {title && (
                  <Title2
                    align="center"
                    numberOfLines={1}
                    color={
                      gradient || transparent
                        ? '#FFFFFF'
                        : undefined
                    }
                  >
                    {title}
                  </Title2>
                )}
                {subtitle && (
                  <Subheadline
                    align="center"
                    numberOfLines={1}
                    color={
                      gradient || transparent
                        ? 'rgba(255, 255, 255, 0.8)'
                        : isDark
                        ? AppleColors.semantic.textDark.secondary
                        : AppleColors.semantic.text.secondary
                    }
                  >
                    {subtitle}
                  </Subheadline>
                )}
              </Animated.View>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightComponent ? (
              rightComponent
            ) : rightIcon && onRightPress ? (
              <TouchableOpacity
                onPress={handleRightPress}
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rightIcon as any}
                  size={24}
                  color={
                    gradient || transparent
                      ? '#FFFFFF'
                      : isDark
                      ? AppleColors.semantic.textDark.primary
                      : AppleColors.semantic.text.primary
                  }
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.iconButton} />
            )}
          </View>
        </View>
      </Animated.View>
    </>
  );
});

PremiumHeader.displayName = 'PremiumHeader';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: ZIndex.sticky,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PremiumHeader;