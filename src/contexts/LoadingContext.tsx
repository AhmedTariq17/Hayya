/**
 * Loading Context
 * Global loading state management with beautiful UI
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  PillarsTypography,
  getPillarsTheme,
} from '../theme/pillarsTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

const LoadingOverlay: React.FC<{ message: string; isDark: boolean }> = ({ message, isDark }) => {
  const theme = getPillarsTheme(isDark);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    // Rotating animation
    rotation.value = withRepeat(
      withSpring(360, { duration: 2000 }),
      -1,
      false
    );

    // Pulsing animation
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { duration: 1000 }),
        withSpring(1, { duration: 1000 })
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

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.modalContainer}>
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={[styles.loadingCard, { backgroundColor: theme.background.card }]}
        >
          {/* Animated Icon Container */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={PillarsColors.gradients.navyGold as any}
              style={styles.gradientBackground}
            />
            <Animated.View style={animatedStyle}>
              <MaterialCommunityIcons
                name="mosque"
                size={48}
                color="#FFFFFF"
              />
            </Animated.View>
          </View>

          {/* Loading Spinner */}
          <ActivityIndicator
            size="large"
            color={PillarsColors.gold[500]}
            style={styles.spinner}
          />

          {/* Loading Message */}
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            {message}
          </Text>

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                entering={FadeIn.delay(index * 200).duration(500)}
                style={[
                  styles.dot,
                  { backgroundColor: PillarsColors.gold[500] }
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const { isDark } = useTheme();

  const showLoading = useCallback((message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
  }, []);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>, message?: string): Promise<T> => {
      try {
        showLoading(message);
        const result = await fn();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        withLoading,
      }}
    >
      {children}
      {isLoading && <LoadingOverlay message={loadingMessage} isDark={isDark} />}
    </LoadingContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingCard: {
    width: Math.min(SCREEN_WIDTH * 0.8, 320),
    padding: PillarsSpacing.xxl,
    borderRadius: PillarsBorderRadius.xl,
    alignItems: 'center',
    ...PillarsShadows.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PillarsSpacing.xl,
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  spinner: {
    marginBottom: PillarsSpacing.lg,
  },
  loadingText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: PillarsSpacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: PillarsSpacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default LoadingProvider;