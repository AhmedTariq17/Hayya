/**
 * Pillars-Inspired Premium Theme
 * World-class color scheme with navy blue, gold, and black
 * Inspired by modern Hayya app design
 */

export const PillarsColors = {
  // White (added for compatibility)
  white: '#FFFFFF',
  // Primary Navy Blue Palette
  navy: {
    50: '#E6E9F0',
    100: '#C2CAD9',
    200: '#9DA8C0',
    300: '#7886A7',
    400: '#5C6D94',
    500: '#405381', // Main Navy
    600: '#3A4B79',
    700: '#32406E',
    800: '#2A3664',
    900: '#1C2551',
    950: '#0F1A3A', // Deep Navy
  },

  // Premium Gold Palette
  gold: {
    50: '#FFF9E6',
    100: '#FFF1C2',
    200: '#FFE89D',
    300: '#FFDE78',
    400: '#FFD65C',
    500: '#FFCE40', // Main Gold
    600: '#E6B93A',
    700: '#CC9F32',
    800: '#B3862A',
    900: '#8C6A1C',
    950: '#664C0E',
  },

  // Black & Neutral Palette
  black: {
    50: '#F7F7F8',
    100: '#E8E9EB',
    200: '#D1D3D7',
    300: '#B3B6BD',
    400: '#8B8F98',
    500: '#646973',
    600: '#4A4E57',
    700: '#3A3D45',
    800: '#2A2C33',
    900: '#1A1B20',
    950: '#0D0E11', // Pure Black
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',

    // Prayer Time Specific
    fajr: '#5C6BC0',    // Indigo - Dawn
    sunrise: '#FF9800',  // Orange - Sunrise
    dhuhr: '#FFD600',   // Yellow - Noon
    asr: '#FF6F00',     // Amber - Afternoon
    maghrib: '#E91E63', // Pink - Sunset
    isha: '#3F51B5',    // Deep Blue - Night
  },

  // Glass & Overlay Effects
  glass: {
    white: {
      5: 'rgba(255, 255, 255, 0.05)',
      10: 'rgba(255, 255, 255, 0.1)',
      20: 'rgba(255, 255, 255, 0.2)',
      30: 'rgba(255, 255, 255, 0.3)',
      40: 'rgba(255, 255, 255, 0.4)',
      60: 'rgba(255, 255, 255, 0.6)',
      80: 'rgba(255, 255, 255, 0.8)',
      95: 'rgba(255, 255, 255, 0.95)',
    },
    black: {
      5: 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.1)',
      20: 'rgba(0, 0, 0, 0.2)',
      30: 'rgba(0, 0, 0, 0.3)',
      40: 'rgba(0, 0, 0, 0.4)',
      60: 'rgba(0, 0, 0, 0.6)',
      80: 'rgba(0, 0, 0, 0.8)',
      95: 'rgba(0, 0, 0, 0.95)',
    },
    navy: {
      10: 'rgba(64, 83, 129, 0.1)',
      20: 'rgba(64, 83, 129, 0.2)',
      40: 'rgba(64, 83, 129, 0.4)',
      60: 'rgba(64, 83, 129, 0.6)',
      80: 'rgba(64, 83, 129, 0.8)',
    },
    gold: {
      10: 'rgba(255, 206, 64, 0.1)',
      20: 'rgba(255, 206, 64, 0.2)',
      40: 'rgba(255, 206, 64, 0.4)',
      60: 'rgba(255, 206, 64, 0.6)',
    },
  },

  // Premium Gradients
  gradients: {
    // Main Gradients
    navyGold: ['#405381', '#5C6D94', '#FFCE40'],
    goldNavy: ['#FFCE40', '#E6B93A', '#405381'],
    darkNavy: ['#1C2551', '#2A3664', '#405381'],
    lightGold: ['#FFF9E6', '#FFE89D', '#FFCE40'],

    // Prayer Time Gradients
    fajr: ['#1A237E', '#283593', '#5C6BC0'],
    sunrise: ['#E65100', '#F57C00', '#FF9800'],
    dhuhr: ['#F57F17', '#F9A825', '#FFD600'],
    asr: ['#E65100', '#EF6C00', '#FF6F00'],
    maghrib: ['#880E4F', '#AD1457', '#E91E63'],
    isha: ['#1A237E', '#283593', '#3F51B5'],

    // UI Gradients
    card: ['#FFFFFF', '#F7F7F8', '#E8E9EB'],
    cardDark: ['#2A2C33', '#1A1B20', '#0D0E11'],
    premium: ['#FFCE40', '#E6B93A', '#CC9F32'],
    shimmer: ['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent'],
  },
};

// Typography System
export const PillarsTypography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    arabic: 'System', // Will be replaced with Arabic font
  },

  // Font Sizes (using iOS scale)
  fontSize: {
    xxxl: 34,   // Large Title
    xxl: 28,    // Title 1
    xl: 22,     // Title 2
    lg: 20,     // Title 3
    md: 17,     // Body
    sm: 15,     // Callout
    xs: 13,     // Footnote
    xxs: 11,    // Caption
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

// Spacing System
export const PillarsSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// Border Radius System
export const PillarsBorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,

  // Component Specific
  button: 12,
  card: 20,
  input: 12,
  modal: 24,
  sheet: 32,
};

// Shadow System
export const PillarsShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 16,
  },

  // Colored Shadows
  gold: {
    shadowColor: '#FFCE40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  navy: {
    shadowColor: '#405381',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Animation Configurations
export const PillarsAnimations = {
  // Durations
  duration: {
    instant: 0,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1000,
  },

  // Spring Configurations
  spring: {
    gentle: {
      damping: 15,
      stiffness: 100,
    },
    bouncy: {
      damping: 10,
      stiffness: 200,
    },
    stiff: {
      damping: 20,
      stiffness: 300,
    },
  },

  // Easing
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    sharp: [0.4, 0, 0.6, 1],
  },
};

// Layout Constants
export const PillarsLayout = {
  // Safe Areas
  safeArea: {
    top: 44,
    bottom: 34,
  },

  // Component Heights
  headerHeight: 56,
  tabBarHeight: 80,
  buttonHeight: {
    small: 36,
    medium: 48,
    large: 56,
  },

  // Container Padding
  containerPadding: 20,
  screenPadding: 16,

  // Grid System
  grid: {
    columns: 12,
    gutter: 16,
  },
};

// Z-Index System
export const PillarsZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
};

// Theme Configuration
export const getPillarsTheme = (isDark: boolean) => {
  return {
    // Backgrounds
    background: {
      primary: isDark ? PillarsColors.black[950] : '#FFFFFF',
      secondary: isDark ? PillarsColors.black[900] : PillarsColors.black[50],
      tertiary: isDark ? PillarsColors.black[800] : PillarsColors.black[100],
      card: isDark ? PillarsColors.black[900] : '#FFFFFF',
      elevated: isDark ? PillarsColors.black[800] : '#FFFFFF',
    },

    // Text Colors
    text: {
      primary: isDark ? '#FFFFFF' : PillarsColors.black[900],
      secondary: isDark ? PillarsColors.black[200] : PillarsColors.black[600],
      tertiary: isDark ? PillarsColors.black[400] : PillarsColors.black[500],
      inverse: isDark ? PillarsColors.black[900] : '#FFFFFF',
      gold: PillarsColors.gold[500],
      navy: isDark ? PillarsColors.navy[400] : PillarsColors.navy[600],
    },

    // Main Colors
    primary: PillarsColors.navy[500],
    primaryLight: PillarsColors.navy[400],
    primaryDark: PillarsColors.navy[700],

    secondary: PillarsColors.gold[500],
    secondaryLight: PillarsColors.gold[400],
    secondaryDark: PillarsColors.gold[700],

    // UI Elements
    border: isDark ? PillarsColors.black[800] : PillarsColors.black[200],
    divider: isDark ? PillarsColors.glass.white[10] : PillarsColors.glass.black[10],
    overlay: isDark ? PillarsColors.glass.black[60] : PillarsColors.glass.black[40],

    // Status Colors
    success: PillarsColors.semantic.success,
    warning: PillarsColors.semantic.warning,
    error: PillarsColors.semantic.error,
    info: PillarsColors.semantic.info,

    // Gradients
    gradients: PillarsColors.gradients,

    // Glass Effects
    glass: PillarsColors.glass,
  };
};

export default {
  colors: PillarsColors,
  typography: PillarsTypography,
  spacing: PillarsSpacing,
  borderRadius: PillarsBorderRadius,
  shadows: PillarsShadows,
  animations: PillarsAnimations,
  layout: PillarsLayout,
  zIndex: PillarsZIndex,
  getTheme: getPillarsTheme,
};