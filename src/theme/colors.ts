export const colors = {
  // Primary Islamic green palette
  primary: '#2D7E5B',
  primaryLight: '#4A9B78',
  primaryDark: '#1F5740',

  // Gold accents for premium feel
  gold: '#D4AF37',
  goldLight: '#F4D03F',
  goldDark: '#B8941F',

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#EFEFF4',
    elevated: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#0A1929',
    card: '#FFFFFF',
    cardDark: '#132F4C',
  },

  // Text colors (nested structure for compatibility)
  text: {
    primary: '#000000',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
    inverse: '#FFFFFF',
  },

  // Flat text colors for convenience
  textPrimary: '#000000',
  textSecondary: 'rgba(60, 60, 67, 0.6)',
  textTertiary: 'rgba(60, 60, 67, 0.3)',
  darkGray: '#8E8E93',

  // Semantic colors
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',

  // Prayer time colors
  prayer: {
    fajr: '#6B46C1',
    sunrise: '#FF9F1C',
    dhuhr: '#F4A261',
    asr: '#E76F51',
    maghrib: '#E63946',
    isha: '#264653',
  },

  // Gradients
  gradients: {
    primary: ['#2D7E5B', '#4A9B78'] as const,
    gold: ['#D4AF37', '#F4D03F'] as const,
    islamic: ['#2D7E5B', '#1F5740', '#0F3A2D'] as const,
    night: ['#0A1929', '#132F4C', '#1E4976'] as const,
  },
};

export const darkColors = {
  ...colors,
  primary: '#4A9B78',
  primaryLight: '#5FBD98',
  primaryDark: '#2D7E5B',

  background: {
    primary: '#000000',
    secondary: '#1C1C1E',
    tertiary: '#2C2C2E',
    elevated: '#1C1C1E',
    light: '#1C1C1E',
    dark: '#000000',
    card: '#2C2C2E',
    cardDark: '#1C1C1E',
  },

  // Text colors (nested structure for compatibility)
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.3)',
    inverse: '#000000',
  },

  // Flat text colors for convenience
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.3)',
  darkGray: '#8E8E93',
};
