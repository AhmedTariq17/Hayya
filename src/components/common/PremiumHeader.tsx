import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../theme/constants';

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  gradient?: string[];
  blurred?: boolean;
  scrollY?: import('react-native-reanimated').SharedValue<number>;
  transparent?: boolean;
  showBackButton?: boolean;
  navigation?: any;
  centerTitle?: boolean;
}

const HEADER_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  gradient = [COLORS.primary.main, COLORS.primary.dark],
  blurred = false,
  scrollY,
  transparent = false,
  showBackButton = false,
  navigation,
  centerTitle = false,
}) => {
  const headerOpacity = useSharedValue(transparent ? 0 : 1);
  const titleScale = useSharedValue(1);
  const subtitleOpacity = useSharedValue(subtitle ? 1 : 0);

  useEffect(() => {
    if (transparent && scrollY) {
      headerOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [transparent]);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (scrollY) {
      const opacity = interpolate(
        scrollY.value,
        [0, 50],
        [transparent ? 0 : 0.9, 1],
        Extrapolation.CLAMP
      );

      const blur = interpolate(
        scrollY.value,
        [0, 100],
        [0, 20],
        Extrapolation.CLAMP
      );

      return {
        opacity,
        backgroundColor: `rgba(255, 255, 255, ${blur / 100})`,
      };
    }

    return {
      opacity: headerOpacity.value,
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    if (scrollY) {
      const scale = interpolate(
        scrollY.value,
        [0, 50],
        [1.1, 1],
        Extrapolation.CLAMP
      );

      const translateY = interpolate(
        scrollY.value,
        [0, 50],
        [0, -5],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ scale }, { translateY }],
      };
    }

    return {
      transform: [{ scale: titleScale.value }],
    };
  });

  const handleLeftPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showBackButton && navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (onLeftPress) {
      onLeftPress();
    }
  };

  const handleRightPress = () => {
    if (onRightPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRightPress();
    }
  };

  const renderBackground = () => {
    if (blurred) {
      return (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        >
          <LinearGradient
            colors={[...gradient, 'transparent'] as any}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </BlurView>
      );
    }

    return (
      <LinearGradient
        colors={gradient as any}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    );
  };

  return (
    <Animated.View style={[styles.container, animatedHeaderStyle]}>
      {renderBackground()}

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <View style={styles.content}>
          {/* Left Button */}
          <View style={styles.buttonContainer}>
            {(leftIcon || showBackButton) && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLeftPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconBackground}>
                  <Ionicons
                    name={leftIcon || (showBackButton ? 'chevron-back' : undefined) as any}
                    size={24}
                    color={COLORS.text.inverse}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Title Section */}
          <View style={[styles.titleContainer, centerTitle && styles.centerTitle]}>
            <Animated.View style={animatedTitleStyle}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Animated.Text
                  style={[styles.subtitle, { opacity: subtitleOpacity.value }]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Animated.Text>
              )}
            </Animated.View>
          </View>

          {/* Right Button */}
          <View style={styles.buttonContainer}>
            {rightIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleRightPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconBackground}>
                  <Ionicons
                    name={rightIcon}
                    size={24}
                    color={COLORS.text.inverse}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeContainer}>
          <View style={styles.decorativeLine} />
          <View style={styles.decorativeDot} />
          <View style={styles.decorativeLine} />
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: HEADER_HEIGHT,
    ...SHADOWS.lg,
    zIndex: 100,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 56,
  },
  buttonContainer: {
    width: 40,
    alignItems: 'center',
  },
  iconButton: {
    padding: SPACING.xs,
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  centerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    fontWeight: TYPOGRAPHY.fontWeight.regular as any,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  decorativeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.sm,
    opacity: 0.3,
  },
  decorativeLine: {
    height: 1,
    width: 30,
    backgroundColor: COLORS.text.inverse,
  },
  decorativeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary.gold,
    marginHorizontal: SPACING.sm,
  },
});