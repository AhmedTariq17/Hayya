/**
 * Premium Tab Bar Component
 * Apple-inspired bottom tab navigation
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';

import { useTheme } from '../contexts/ThemeContext';
import { Caption2 } from '../components/premium/PremiumText';
import {
  AppleColors,
  Spacing,
  BorderRadius,
  Elevation,
  Typography,
  Layout,
  Animations,
  ZIndex,
} from '../theme/appleDesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface TabIconProps {
  route: string;
  focused: boolean;
  color: string;
  index: number;
}

const TabIcon = React.memo<TabIconProps>(({ route, focused, color, index }) => {
  const scale = useSharedValue(focused ? 1 : 1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, Animations.spring.bouncy);
      rotation.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withSpring(0, Animations.spring.bouncy)
      );
    } else {
      scale.value = withSpring(1, Animations.spring.gentle);
      rotation.value = withSpring(0, Animations.spring.gentle);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const getIconName = () => {
    switch (route) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'PrayerTimes':
        return focused ? 'time' : 'time-outline';
      case 'Qibla':
        return focused ? 'compass' : 'compass-outline';
      case 'More':
        return focused ? 'grid' : 'grid-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <MotiView
        animate={{
          scale: focused ? [1, 1.1, 1] : 1,
        }}
        transition={{
          type: 'spring',
          duration: 500,
        }}
      >
        <Ionicons
          name={getIconName()}
          size={focused ? 26 : 24}
          color={color}
        />
      </MotiView>
    </Animated.View>
  );
});


interface TabButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
}

const TabButton = React.memo<TabButtonProps>(({
  route,
  index,
  isFocused,
  options,
  onPress,
  onLongPress,
  isDark,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, Animations.spring.gentle);
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, Animations.spring.bouncy);
    opacity.value = withTiming(1, { duration: 200 });
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const label = options.tabBarLabel || options.title || route.name;

  const primaryColor = isDark
    ? AppleColors.islamic.gold[500]
    : AppleColors.islamic.royalBlue[500];
  const inactiveColor = isDark
    ? AppleColors.semantic.textDark.secondary
    : AppleColors.semantic.text.secondary;

  return (
    <AnimatedTouchable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tab, animatedButtonStyle]}
      activeOpacity={1}
    >
      <View style={styles.tabContent}>
        {isFocused && (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.15 }}
            transition={{ type: 'timing', duration: 400 }}
            style={[
              styles.focusIndicator,
              { backgroundColor: primaryColor },
            ]}
          />
        )}

        <TabIcon
          route={route.name}
          focused={isFocused}
          color={isFocused ? primaryColor : inactiveColor}
          index={index}
        />

        <Caption2
          weight={isFocused ? 'semibold' : 'regular'}
          color={isFocused ? primaryColor : inactiveColor}
          style={styles.label}
        >
          {label}
        </Caption2>

        {/* Active Dot Indicator */}
        {isFocused && (
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            style={[
              styles.activeDot,
              { backgroundColor: primaryColor },
            ]}
          />
        )}
      </View>
    </AnimatedTouchable>
  );
});

export const PremiumTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const tabWidth = SCREEN_WIDTH / state.routes.length;
  const indicatorPosition = useSharedValue(state.index * tabWidth);
  const indicatorOpacity = useSharedValue(1);

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, Animations.spring.gentle);
    indicatorOpacity.value = withSequence(
      withTiming(0.5, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
    opacity: indicatorOpacity.value,
  }));

  const hapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom - 10, 5) : Spacing.sm,
        },
      ]}
    >
      {/* Blur Background for iOS */}
      {Platform.OS === 'ios' ? (
        <AnimatedBlurView
          intensity={isDark ? 90 : 95}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: isDark
                ? AppleColors.semantic.backgroundDark.elevated
                : AppleColors.semantic.background.elevated,
            },
          ]}
        />
      )}

      {/* Top Border with Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)'] as any
            : ['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)'] as any
        }
        style={styles.topBorder}
      />

      {/* Animated Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { width: tabWidth },
          animatedIndicatorStyle,
        ]}
      >
        <LinearGradient
          colors={AppleColors.gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.indicatorGradient}
        />
      </Animated.View>

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            runOnJS(hapticFeedback)();

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            runOnJS(() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            })();

            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
              isDark={isDark}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 70,
    ...Elevation.level4,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    marginTop: Spacing.xxs,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 2,
  },
  indicatorGradient: {
    flex: 1,
    borderBottomLeftRadius: BorderRadius.xs,
    borderBottomRightRadius: BorderRadius.xs,
  },
  focusIndicator: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default PremiumTabBar;