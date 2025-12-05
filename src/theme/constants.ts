/**
 * Theme Constants - Apple-inspired Design System
 */

// Premium Color Palette - Royal Blue & Gold Theme
export const COLORS = {
  // Primary Colors - Royal Blue
  primary: {
    main: '#1E3A8A', // Deep Royal Blue
    light: '#5189F1',
    dark: '#0A1628',
    gradient: ['#1E3A8A', '#5189F1'],
    softGradient: ['#0A1628', '#1E3A8A', '#5189F1'],
  },

  // Secondary Colors - Royal Gold
  secondary: {
    gold: '#D4A017', // Royal Gold
    lightGold: '#FFD54D',
    darkGold: '#AA8011',
    gradient: ['#D4A017', '#FFD54D'],
    richGradient: ['#AA8011', '#D4A017', '#FFD54D'],
  },

  // Accent Colors
  accent: {
    teal: '#2A9D8F',
    tealLight: '#40E0D0',
    purple: '#7B68EE',
    purpleLight: '#9B88FF',
    coral: '#E76F51',
    coralLight: '#FF8A6D',
    sky: '#56CCF2',
    skyLight: '#7DE8FF',
    mint: '#50C7A8',
    mintLight: '#6FE7C8',
    gray: '#8E8E93', // Added missing gray
    // Gradient combinations
    tealGradient: ['#2A9D8F', '#40E0D0'] as [string, string],
    purpleGradient: ['#7B68EE', '#9B88FF'] as [string, string],
    coralGradient: ['#E76F51', '#FF8A6D'] as [string, string],
    skyGradient: ['#56CCF2', '#7DE8FF'] as [string, string],
    sunsetGradient: ['#FF6B6B', '#FFB347', '#FFA07A'] as [string, string, string],
    oceanGradient: ['#0077BE', '#2A9D8F', '#40E0D0'] as [string, string, string],
    softGradient: ['#7DE8FF', '#56CCF2', '#2A9D8F'] as [string, string, string], // Added missing softGradient
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F5F5F7',
    gray: '#E5E5E7',
    mediumGray: '#C7C7CC',
    darkGray: '#8E8E93',
    charcoal: '#3A3A3C',
    black: '#000000',
  },

  // Semantic Colors
  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#EFEFF4',
    elevated: '#FFFFFF',
    card: '#FFFFFF',
  },

  // Dark Mode Colors
  dark: {
    background: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
      elevated: '#1C1C1E',
      card: '#2C2C2E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.6)',
      tertiary: 'rgba(255, 255, 255, 0.3)',
    },
  },

  // Text Colors
  text: {
    primary: '#000000',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
    inverse: '#FFFFFF',
  },

  // Prayer Time Specific Colors - Royal Theme
  prayer: {
    fajr: '#0A1628',     // Midnight blue for dawn
    sunrise: '#FFD54D',  // Bright gold for sunrise
    dhuhr: '#D4A017',    // Royal gold for noon
    asr: '#5189F1',      // Light royal blue for afternoon
    maghrib: '#1E3A8A',  // Royal blue for sunset
    isha: '#0F1B47',     // Deep blue for night
  },
};

// Typography System
export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    arabic: 'System', // Will be replaced with Arabic font
  },

  // Font Sizes (iOS-inspired scale)
  fontSize: {
    largeTitle: 34,
    title1: 28,
    title2: 22,
    title3: 20,
    headline: 17,
    body: 17,
    callout: 16,
    subheadline: 15,
    footnote: 13,
    caption1: 12,
    caption2: 11,

    // Arabic Text Sizes
    arabicLarge: 36,
    arabicMedium: 28,
    arabicRegular: 22,
    arabicSmall: 18,
  },

  // Line Heights
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
    arabic: 2.0,
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

// Spacing System (8pt grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border Radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,

  // Component-specific
  card: 16,
  button: 12,
  input: 10,
  modal: 20,
  bottomSheet: 24,
};

// Shadows (iOS-inspired with enhanced depth)
export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // Premium shadows with royal theme tints
  premium: {
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  gold: {
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  colorful: {
    shadowColor: '#5189F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 10,
  },
};

// Glass Morphism Effects
export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heavy: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};

// Animation Durations
export const ANIMATION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Z-Index Layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
};

// Layout Constants
export const LAYOUT = {
  window: {
    width: 0, // Will be set dynamically
    height: 0, // Will be set dynamically
  },
  isSmallDevice: false, // Will be set dynamically
  headerHeight: 56,
  tabBarHeight: 49,
  statusBarHeight: 0, // Will be set dynamically
  bottomSheetSnapPoints: ['25%', '50%', '90%'],
};

// Haptic Feedback Types
export const HAPTICS = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  selection: 'selection',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
};

// Legacy Aliases for backward compatibility
export const SIZES = {
  padding: SPACING.md,
  margin: SPACING.md,
  radius: RADIUS.md,
  base: SPACING.sm,
  font: TYPOGRAPHY.fontSize.body,
  width: LAYOUT.window.width,
  height: LAYOUT.window.height,
};

export const FONTS = {
  largeTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.largeTitle,
    lineHeight: TYPOGRAPHY.fontSize.largeTitle * TYPOGRAPHY.lineHeight.tight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  h1: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.title1,
    lineHeight: TYPOGRAPHY.fontSize.title1 * TYPOGRAPHY.lineHeight.tight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  h2: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.title2,
    lineHeight: TYPOGRAPHY.fontSize.title2 * TYPOGRAPHY.lineHeight.tight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  h3: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: TYPOGRAPHY.fontSize.title3,
    lineHeight: TYPOGRAPHY.fontSize.title3 * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.body,
    lineHeight: TYPOGRAPHY.fontSize.body * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  callout: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.callout,
    lineHeight: TYPOGRAPHY.fontSize.callout * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  subheadline: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    lineHeight: TYPOGRAPHY.fontSize.subheadline * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  footnote: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.footnote,
    lineHeight: TYPOGRAPHY.fontSize.footnote * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.caption1,
    lineHeight: TYPOGRAPHY.fontSize.caption1 * TYPOGRAPHY.lineHeight.normal,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
  },
};