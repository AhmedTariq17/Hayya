/**
 * Apple-Inspired Design System
 * Premium, polished design tokens for world-class UI
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device Detection
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const isLargeDevice = SCREEN_WIDTH >= 414;
const isTablet = SCREEN_WIDTH >= 768;

// Premium Color System - Royal Blue & Gold Theme
export const AppleColors = {
  // System Colors - Refined for Royal Theme
  system: {
    blue: '#1E3A8A',      // Deep Royal Blue
    green: '#10B981',     // Emerald for success states
    indigo: '#4338CA',    // Deep Indigo
    orange: '#F59E0B',    // Amber
    pink: '#EC4899',      // Pink (muted)
    purple: '#7C3AED',    // Purple (muted)
    red: '#DC2626',       // Refined Red for errors
    teal: '#0EA5E9',      // Sky Blue
    yellow: '#FCD34D',    // Soft Gold
    gray: '#64748B',      // Slate Gray
  },

  // Islamic Theme Colors - Royal Blue & Gold
  islamic: {
    // Royal Blue Palette
    royalBlue: {
      50: '#EBF2FF',   // Lightest Blue
      100: '#D4E2FC',  // Very Light Blue
      200: '#A8C5F9',  // Light Blue
      300: '#7CA8F5',  // Medium Light Blue
      400: '#5189F1',  // Medium Blue
      500: '#1E3A8A',  // Primary Royal Blue
      600: '#1B337A',  // Dark Royal Blue
      700: '#172B6A',  // Darker Royal Blue
      800: '#142459',  // Very Dark Blue
      900: '#0F1B47',  // Darkest Blue
    },
    // Luxurious Gold Palette
    gold: {
      50: '#FFFEF5',   // Lightest Gold
      100: '#FFF9E1',  // Very Light Gold
      200: '#FFF0B3',  // Light Gold
      300: '#FFE380',  // Medium Light Gold
      400: '#FFD54D',  // Medium Gold
      500: '#D4A017',  // Primary Royal Gold
      600: '#BF9014',  // Dark Gold
      700: '#AA8011',  // Darker Gold
      800: '#95700E',  // Very Dark Gold
      900: '#80600B',  // Darkest Gold
    },
    // Legacy Emerald (mapped to royal blue for compatibility)
    emerald: {
      50: '#EBF2FF',   // Mapped to royal blue
      100: '#D4E2FC',
      200: '#A8C5F9',
      300: '#7CA8F5',
      400: '#5189F1',
      500: '#1E3A8A',  // Primary Royal Blue
      600: '#1B337A',
      700: '#172B6A',
      800: '#142459',
      900: '#0F1B47',
    },
    // Accent Colors for Royal Theme
    accent: {
      pearl: '#FAF7F5',       // Off-white pearl
      ivory: '#FFFFF0',       // Ivory white
      champagne: '#F7E7CE',   // Champagne gold
      midnight: '#0A1628',    // Midnight blue
      sapphire: '#0F52BA',    // Sapphire blue
      platinum: '#E5E4E2',    // Platinum silver
    }
  },

  // Semantic Colors - Royal Theme
  semantic: {
    background: {
      primary: '#FFFFFF',           // Pure white
      secondary: '#F8FAFF',         // Hint of blue tint
      tertiary: '#EBF2FF',          // Light blue tint
      grouped: '#F8FAFF',           // Subtle blue background
      elevated: '#FFFFFF',          // Card background
    },
    backgroundDark: {
      primary: '#0A1628',           // Midnight blue background
      secondary: '#0F1B47',         // Darkest royal blue
      tertiary: '#142459',          // Very dark blue
      grouped: '#0F1B47',           // Grouped dark blue
      elevated: '#172B6A',          // Elevated dark blue
    },
    text: {
      primary: '#0A1628',           // Midnight blue text
      secondary: 'rgba(30, 58, 138, 0.75)',  // Royal blue secondary
      tertiary: 'rgba(30, 58, 138, 0.5)',    // Royal blue tertiary
      quaternary: 'rgba(30, 58, 138, 0.25)', // Royal blue quaternary
      inverse: '#FFFFFF',
      gold: '#D4A017',              // Gold accent text
    },
    textDark: {
      primary: '#FAF7F5',           // Pearl white text
      secondary: 'rgba(250, 247, 245, 0.85)', // Pearl white secondary
      tertiary: 'rgba(250, 247, 245, 0.6)',   // Pearl white tertiary
      quaternary: 'rgba(250, 247, 245, 0.35)', // Pearl white quaternary
      inverse: '#0A1628',
      gold: '#FFD54D',              // Bright gold for dark mode
    },
    separator: {
      opaque: 'rgba(30, 58, 138, 0.2)',     // Royal blue separator
      nonOpaque: 'rgba(30, 58, 138, 0.08)', // Subtle blue separator
    },
    separatorDark: {
      opaque: 'rgba(212, 160, 23, 0.25)',    // Gold separator dark
      nonOpaque: 'rgba(250, 247, 245, 0.1)', // Pearl separator dark
    },
    error: '#DC2626',             // Refined red
    success: '#10B981',           // Emerald green
    warning: '#F59E0B',           // Amber warning
  },

  // Material You Inspired Surfaces
  surface: {
    level0: 'transparent',
    level1: 'rgba(0, 0, 0, 0.04)',
    level2: 'rgba(0, 0, 0, 0.08)',
    level3: 'rgba(0, 0, 0, 0.11)',
    level4: 'rgba(0, 0, 0, 0.12)',
    level5: 'rgba(0, 0, 0, 0.14)',
  },

  // Gradient Presets - Royal Theme
  gradients: {
    premium: ['#1E3A8A', '#0F52BA', '#5189F1'] as [string, string, string],  // Royal blue gradient
    sunset: ['#D4A017', '#FFD54D', '#FFF0B3'] as [string, string, string],    // Gold sunset
    ocean: ['#0A1628', '#1E3A8A', '#0F52BA'] as [string, string, string],     // Deep ocean blue
    aurora: ['#1E3A8A', '#D4A017', '#FFD54D'] as [string, string, string],    // Blue to gold aurora
    mystic: ['#0F1B47', '#1E3A8A', '#D4A017'] as [string, string, string],    // Mystic royal
    golden: ['#D4A017', '#FFD54D', '#FFF9E1'] as [string, string, string],    // Pure gold gradient
    royal: ['#0A1628', '#1E3A8A', '#5189F1'] as [string, string, string],     // Royal blue spectrum
    luxury: ['#1E3A8A', '#D4A017', '#1E3A8A'] as [string, string, string],    // Royal luxury blend
  },
};

// Typography System (SF Pro inspired)
export const Typography = {
  // Font Families
  fonts: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  // Dynamic Type Sizes (iOS HIG)
  sizes: {
    // Extra Large Titles
    largeTitle: isSmallDevice ? 31 : 34,
    title1: isSmallDevice ? 25 : 28,
    title2: isSmallDevice ? 19 : 22,
    title3: isSmallDevice ? 17 : 20,

    // Body Text
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,

    // Captions
    caption1: 12,
    caption2: 11,

    // Special
    arabicLarge: 32,
    arabicMedium: 24,
    arabicSmall: 18,
  },

  // Line Heights
  lineHeights: {
    tight: 1.0,
    snug: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
    arabic: 2.2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.3,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
    widest: 1.0,
  },

  // Font Weights
  weights: {
    ultralight: '100',
    thin: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
    black: '900',
  },
};

// Spacing System (8pt Grid)
export const Spacing = {
  // Base Spacing
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,

  // Component Spacing
  gutter: isSmallDevice ? 16 : 20,
  containerPadding: isSmallDevice ? 16 : 24,
  sectionSpacing: isSmallDevice ? 24 : 32,
  cardPadding: 16,
  listItemPadding: 12,

  // Dynamic Spacing
  dynamic: (multiplier: number) => 8 * multiplier,
};

// Elevation & Shadows (Material Design 3 inspired)
export const Elevation = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  level1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  level2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  level3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  level4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },

  level5: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },

  // Special Shadows
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 24,
  },

  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Border Radius System
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  full: 999,

  // Component Specific
  button: {
    small: 8,
    medium: 12,
    large: 14,
    pill: 999,
  },

  card: {
    small: 12,
    medium: 16,
    large: 20,
  },

  input: 10,
  modal: 20,
  sheet: 28,
};

// Animation Configurations
export const Animations = {
  // Spring Animations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
      mass: 0.9,
    },
    stiff: {
      damping: 30,
      stiffness: 400,
      mass: 1,
    },
  },

  // Timing Animations
  timing: {
    fast: 200,
    medium: 300,
    slow: 500,
    verySlow: 800,
  },

  // Easing Functions
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Layout Constants
export const Layout = {
  window: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  // Safe Areas
  safeArea: {
    top: Platform.OS === 'ios' ? 44 : 0,
    bottom: Platform.OS === 'ios' ? 34 : 0,
  },

  // Component Heights
  headerHeight: Platform.OS === 'ios' ? 44 : 56,
  tabBarHeight: Platform.OS === 'ios' ? 49 : 56,

  // Grid System
  grid: {
    columns: 12,
    gutterWidth: Spacing.gutter,
    containerMaxWidth: 1200,
  },

  // Breakpoints
  breakpoints: {
    small: 320,
    medium: 768,
    large: 1024,
    xlarge: 1440,
  },
};

// Blur Effects (iOS Style)
export const BlurEffects = {
  ultraThin: {
    blurType: 'ultraThinMaterial',
    blurAmount: 20,
  },
  thin: {
    blurType: 'thinMaterial',
    blurAmount: 30,
  },
  regular: {
    blurType: 'regularMaterial',
    blurAmount: 40,
  },
  thick: {
    blurType: 'thickMaterial',
    blurAmount: 60,
  },
  chrome: {
    blurType: 'chromeMaterial',
    blurAmount: 80,
  },
};

// Z-Index Layers
export const ZIndex = {
  background: -1,
  base: 0,
  content: 10,
  elevated: 100,
  dropdown: 1000,
  sticky: 1100,
  modal: 2000,
  overlay: 3000,
  popover: 4000,
  tooltip: 5000,
  toast: 6000,
  maximum: 9999,
};

// Haptic Feedback Types
export const Haptics = {
  selection: 'selection',
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  soft: 'soft',
  rigid: 'rigid',
};

// Motion Principles
export const Motion = {
  // Transition types
  transitions: {
    fade: {
      in: { opacity: 1, duration: Animations.timing.fast },
      out: { opacity: 0, duration: Animations.timing.fast },
    },
    scale: {
      in: { scale: 1, opacity: 1, duration: Animations.timing.medium },
      out: { scale: 0.95, opacity: 0, duration: Animations.timing.medium },
    },
    slide: {
      left: { translateX: -SCREEN_WIDTH, duration: Animations.timing.medium },
      right: { translateX: SCREEN_WIDTH, duration: Animations.timing.medium },
      up: { translateY: -SCREEN_HEIGHT, duration: Animations.timing.medium },
      down: { translateY: SCREEN_HEIGHT, duration: Animations.timing.medium },
    },
  },

  // Gesture Thresholds
  gestures: {
    swipeThreshold: 50,
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
    gestureDistanceThreshold: 175,
  },
};

export default {
  colors: AppleColors,
  typography: Typography,
  spacing: Spacing,
  elevation: Elevation,
  borderRadius: BorderRadius,
  animations: Animations,
  layout: Layout,
  blur: BlurEffects,
  zIndex: ZIndex,
  haptics: Haptics,
  motion: Motion,
};