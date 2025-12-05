import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../theme/constants';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: any;
  rightIcon?: any;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  scrollY?: SharedValue<number>;
  gradientColors?: [string, string] | [string, string, string];
  showBackButton?: boolean;
  navigation?: any;
  transparent?: boolean;
  centerTitle?: boolean;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  scrollY,
  gradientColors = [COLORS.primary.main, COLORS.primary.dark],
  showBackButton = false,
  navigation,
  transparent = false,
  centerTitle = false,
}) => {
  const insets = useSafeAreaInsets();
  const headerHeight = 56 + insets.top;

  const handleLeftPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onLeftPress) {
      onLeftPress();
    } else if (showBackButton && navigation) {
      navigation.goBack();
    }
  };

  const handleRightPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onRightPress) {
      onRightPress();
    }
  };

  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [transparent ? 0 : 1, 1],
      Extrapolation.CLAMP
    );

    const elevation = interpolate(
      scrollY.value,
      [0, 100],
      [0, 8],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      elevation,
      shadowOpacity: elevation / 100,
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};

    const scale = interpolate(
      scrollY.value,
      [0, 50],
      [1.1, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AnimatedLinearGradient
        colors={transparent && (!scrollY || scrollY.value === 0)
          ? ['transparent', 'transparent'] as [string, string]
          : gradientColors as any}
        style={[
          styles.header,
          { height: headerHeight, paddingTop: insets.top },
          animatedHeaderStyle,
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            {(showBackButton || leftIcon) && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleLeftPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={leftIcon || 'chevron-back'}
                  size={28}
                  color={COLORS.text.inverse}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.centerSection, centerTitle && styles.absoluteCenter]}>
            <Animated.View style={animatedTitleStyle}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </Animated.View>
          </View>

          <View style={styles.rightSection}>
            {rightIcon && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleRightPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rightIcon}
                  size={24}
                  color={COLORS.text.inverse}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Subtle shimmer effect */}
        <Animated.View style={[styles.shimmer, animatedHeaderStyle]} />
      </AnimatedLinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    ...SHADOWS.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 3,
    alignItems: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    fontWeight: TYPOGRAPHY.fontWeight.regular as any,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  iconButton: {
    padding: SPACING.sm,
    borderRadius: 20,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});