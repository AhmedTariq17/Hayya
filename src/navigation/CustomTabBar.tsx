import React, { useEffect, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';

interface TabIconProps {
  name: string;
  focused: boolean;
  color: string;
  size: number;
  route: string;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const TabIcon = React.memo<TabIconProps>(({
  route,
  focused,
  color,
  size,
}) => {
  const scale = useSharedValue(focused ? 1.1 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
    });
  }, [focused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconName = useMemo(() => {
    switch (route) {
      case 'Home':
        return focused ? 'home' : 'home-outline';
      case 'PrayerTimes':
        return focused ? 'time' : 'time-outline';
      case 'Quran':
        return focused ? 'book' : 'book-outline';
      case 'Qibla':
        return focused ? 'compass' : 'compass-outline';
      case 'More':
        return focused ? 'grid' : 'grid-outline';
      default:
        return 'help-circle-outline';
    }
  }, [route, focused]);

  return (
    <Animated.View style={animatedIconStyle}>
      <Ionicons name={iconName as any} size={size} color={color} />
    </Animated.View>
  );
});

const TabButton = React.memo<{
  route: any;
  index: number;
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  primaryColor: string;
  secondaryColor: string;
}>(({ route, isFocused, options, onPress, onLongPress, primaryColor, secondaryColor }) => {
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}
      activeOpacity={0.7}
    >
      <View style={styles.tabContent}>
        <TabIcon
          name={route.name}
          route={route.name}
          focused={isFocused}
          color={isFocused ? primaryColor : secondaryColor}
          size={24}
        />
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? primaryColor : secondaryColor,
              opacity: isFocused ? 1 : 0.6,
            },
          ]}
          numberOfLines={1}
        >
          {label as string}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabWidth = 100 / state.routes.length;

  const indicatorPosition = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 100,
    });
  }, [state.index, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%`,
  }));

  const backgroundColor = isDark ? theme.background.elevated : theme.background.primary;
  const primaryColor = theme.primary;
  const secondaryColor = isDark ? theme.textSecondary : theme.darkGray;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : SPACING.md,
        },
      ]}
    >
      {/* Background with subtle gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(28, 28, 30, 0.98)', 'rgba(28, 28, 30, 1)']
            : ['rgba(255,255,255,0.98)', 'rgba(255,255,255,1)']
        }
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated indicator */}
      <Animated.View
        style={[
          styles.indicator,
          { width: `${tabWidth}%` },
          animatedIndicatorStyle,
        ]}
      >
        <AnimatedLinearGradient
          colors={[theme.primary, theme.primaryLight] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.indicatorGradient}
        />
      </Animated.View>

      {/* Tab buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderTopWidth: 0,
    ...SHADOWS.lg,
    elevation: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    marginTop: 4,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
  },
  indicatorGradient: {
    flex: 1,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.sm,
  },
});