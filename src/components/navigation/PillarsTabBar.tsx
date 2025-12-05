/**
 * Pillars-Inspired Premium Tab Bar
 * Modern, minimalist design with smooth animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/ThemeContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  PillarsAnimations,
  getPillarsTheme,
} from '../../theme/pillarsTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItemProps {
  route: any;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  index: number;
  totalTabs: number;
}

const TabItem: React.FC<TabItemProps> = ({
  route,
  label,
  isFocused,
  onPress,
  onLongPress,
  index,
  totalTabs,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const animatedValue = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    animatedValue.value = withSpring(isFocused ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [isFocused]);

  const getIcon = () => {
    const iconProps = {
      size: 24,
      color: isFocused ? theme.primary : theme.text.tertiary,
    };

    switch (route.name) {
      case 'Home':
        return (
          <Ionicons
            name={isFocused ? 'home' : 'home-outline'}
            {...iconProps}
          />
        );
      case 'PrayerTimes':
        return (
          <MaterialCommunityIcons
            name={isFocused ? 'mosque' : 'mosque-outline'}
            {...iconProps}
          />
        );
      case 'Qibla':
        return (
          <MaterialCommunityIcons
            name="compass"
            {...iconProps}
          />
        );
      case 'Settings':
        return (
          <Ionicons
            name={isFocused ? 'settings' : 'settings-outline'}
            {...iconProps}
          />
        );
      default:
        return (
          <Ionicons
            name={isFocused ? 'ellipse' : 'ellipse-outline'}
            {...iconProps}
          />
        );
    }
  };

  const animatedIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [1, 1.1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      animatedValue.value,
      [0, 1],
      [0, -2],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedValue.value,
      [0, 1],
      [0.6, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [0.9, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedValue.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      animatedValue.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handlePress = () => {
    if (!isFocused) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tabItem}
    >
      <View style={styles.tabContent}>
        <Animated.View style={animatedIconStyle}>
          {getIcon()}
        </Animated.View>

        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? theme.primary : theme.text.tertiary,
            },
            animatedLabelStyle,
          ]}
        >
          {label}
        </Animated.Text>

        {/* Active Indicator Dot */}
        <Animated.View
          style={[
            styles.activeDot,
            {
              backgroundColor: PillarsColors.gold[500],
            },
            animatedDotStyle,
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const PillarsTabBar: React.FC<TabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);
  const insets = useSafeAreaInsets();
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const tabWidth = SCREEN_WIDTH / state.routes.length;
    indicatorWidth.value = tabWidth - PillarsSpacing.xl * 2;
    indicatorPosition.value = withSpring(
      state.index * tabWidth + PillarsSpacing.xl,
      {
        damping: 15,
        stiffness: 150,
      }
    );
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: indicatorWidth.value,
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? PillarsColors.glass.black[95]
            : PillarsColors.glass.white[95],
          paddingBottom: insets.bottom || PillarsSpacing.md,
        },
      ]}
    >
      {/* Background Blur Effect */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={isDark ? 80 : 95}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Top Border with Gradient */}
      <LinearGradient
        colors={
          isDark
            ? [PillarsColors.glass.gold[20], 'transparent'] as any
            : [PillarsColors.glass.navy[10], 'transparent'] as any
        }
        style={styles.topBorder}
      />

      {/* Active Tab Indicator */}
      <Animated.View
        style={[
          styles.activeIndicator,
          animatedIndicatorStyle,
        ]}
      >
        <LinearGradient
          colors={PillarsColors.gradients.navyGold as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.indicatorGradient}
        />
      </Animated.View>

      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
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
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              index={index}
              totalTabs={state.routes.length}
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
    borderTopLeftRadius: PillarsBorderRadius.sheet,
    borderTopRightRadius: PillarsBorderRadius.sheet,
    overflow: 'hidden',
    ...PillarsShadows.xl,
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
    height: 65,
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 1.5,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 1.5,
  },
});

export default PillarsTabBar;