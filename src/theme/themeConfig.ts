/**
 * Global Theme Configuration
 * Royal Blue & Gold Theme - World-Class Hayya App Design
 */

export const ThemeConfig = {
  light: {
    // Backgrounds - Light Royal Theme
    background: {
      primary: '#FFFFFF',         // Pure white
      secondary: '#F8FAFF',        // Subtle blue tint
      elevated: '#FFFFFF',         // Elevated cards
      card: '#FFFFFF',            // Card background
      modal: '#FFFFFF',           // Modal background
      accent: '#EBF2FF',          // Light royal blue accent
    },

    // Text Colors - Optimized for readability
    text: {
      primary: '#0A1628',         // Midnight blue for main text
      secondary: 'rgba(30, 58, 138, 0.75)',  // Royal blue secondary
      tertiary: 'rgba(30, 58, 138, 0.5)',    // Royal blue tertiary
      inverse: '#FFFFFF',         // White on dark backgrounds
      link: '#1E3A8A',           // Royal blue links
      gold: '#D4A017',           // Gold accent text
    },

    // UI Elements
    ui: {
      border: 'rgba(30, 58, 138, 0.15)',    // Subtle royal blue border
      separator: 'rgba(30, 58, 138, 0.08)',  // Very subtle separator
      overlay: 'rgba(10, 22, 40, 0.5)',      // Dark blue overlay
      shadow: '#0A1628',         // Midnight blue shadows
    },

    // Status Colors
    status: {
      success: '#10B981',        // Emerald green
      warning: '#F59E0B',        // Amber
      error: '#DC2626',          // Refined red
      info: '#1E3A8A',          // Royal blue
    },

    // Islamic Theme - Royal Blue & Gold
    islamic: {
      primary: '#1E3A8A',        // Primary royal blue
      secondary: '#0F52BA',      // Sapphire blue
      accent: '#D4A017',         // Royal gold
      gold: '#FFD54D',          // Bright gold
      pearl: '#FAF7F5',         // Pearl white
      midnight: '#0A1628',      // Midnight blue
    },
  },

  dark: {
    // Backgrounds - Dark Royal Theme
    background: {
      primary: '#0A1628',        // Midnight blue background
      secondary: '#0F1B47',      // Darkest royal blue
      elevated: '#172B6A',       // Elevated dark blue
      card: '#142459',          // Card dark blue
      modal: '#172B6A',         // Modal dark blue
      accent: '#1E3A8A',        // Royal blue accent
    },

    // Text Colors - High contrast for dark mode
    text: {
      primary: '#FAF7F5',        // Pearl white primary
      secondary: 'rgba(250, 247, 245, 0.85)', // Pearl secondary
      tertiary: 'rgba(250, 247, 245, 0.6)',   // Pearl tertiary
      inverse: '#0A1628',        // Midnight blue
      link: '#7CA8F5',          // Light royal blue
      gold: '#FFD54D',          // Bright gold for dark mode
    },

    // UI Elements
    ui: {
      border: 'rgba(212, 160, 23, 0.2)',     // Gold border
      separator: 'rgba(250, 247, 245, 0.08)', // Pearl separator
      overlay: 'rgba(10, 22, 40, 0.85)',      // Deep blue overlay
      shadow: '#000000',         // Pure black shadows
    },

    // Status Colors - Adjusted for dark mode
    status: {
      success: '#10B981',        // Emerald green
      warning: '#FCD34D',        // Soft gold warning
      error: '#EF4444',          // Brighter red for dark
      info: '#5189F1',          // Lighter royal blue
    },

    // Islamic Theme - Royal Blue & Gold Dark
    islamic: {
      primary: '#5189F1',        // Lighter royal blue
      secondary: '#7CA8F5',      // Even lighter blue
      accent: '#FFD54D',         // Bright gold
      gold: '#D4A017',          // Royal gold
      pearl: '#FAF7F5',         // Pearl white
      midnight: '#0A1628',      // Midnight blue
    },
  },
};

// Helper function to get theme
export const getTheme = (isDark: boolean) => {
  return isDark ? ThemeConfig.dark : ThemeConfig.light;
};

// Royal Blue & Gold Gradient Presets
export const Gradients = {
  islamic: ['#1E3A8A', '#0F52BA'],      // Royal blue gradient
  gold: ['#D4A017', '#FFD54D'],         // Royal gold gradient
  sunset: ['#FFD54D', '#FFF0B3'],       // Gold sunset
  ocean: ['#0A1628', '#1E3A8A'],        // Deep ocean blue
  purple: ['#1E3A8A', '#5189F1'],       // Royal blue spectrum
  emerald: ['#10B981', '#065F46'],      // Keep emerald for success states
  royal: ['#0A1628', '#1E3A8A', '#D4A017'],  // Signature royal gradient
  luxury: ['#1E3A8A', '#D4A017'],       // Blue to gold luxury
};

// Spacing constants
export const AppSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const AppBorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography
export const AppTypography = {
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
  },
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
  },
};