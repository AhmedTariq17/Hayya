/**
 * Platform-specific shadow utility
 * Handles shadow rendering differences between web and native
 */

import { Platform } from 'react-native';

interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

interface WebShadowStyle {
  boxShadow?: string;
  elevation?: number;
}

/**
 * Converts native shadow props to web-compatible boxShadow
 */
export function getPlatformShadow(shadow: ShadowStyle): ShadowStyle | WebShadowStyle {
  if (Platform.OS === 'web') {
    const {
      shadowColor = '#000',
      shadowOffset = { width: 0, height: 0 },
      shadowOpacity = 0,
      shadowRadius = 0,
    } = shadow;

    // Convert to rgba
    const opacity = shadowOpacity;
    const color = shadowColor === '#000'
      ? `rgba(0, 0, 0, ${opacity})`
      : `${shadowColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;

    return {
      boxShadow: `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${color}`,
      elevation: shadow.elevation,
    };
  }

  return shadow;
}

/**
 * Creates shadow styles for all platforms
 */
export const createShadow = {
  xs: () => getPlatformShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  }),

  sm: () => getPlatformShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  }),

  md: () => getPlatformShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  }),

  lg: () => getPlatformShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  }),

  xl: () => getPlatformShadow({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  }),

  none: () => ({}),
};

// Export web-safe shadows
export const SAFE_SHADOWS = {
  xs: createShadow.xs(),
  sm: createShadow.sm(),
  md: createShadow.md(),
  lg: createShadow.lg(),
  xl: createShadow.xl(),
  none: createShadow.none(),
};