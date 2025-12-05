/**
 * Standardized Back Button Component
 * Consistent across all screens with theme support
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { getPillarsTheme, PillarsShadows, PillarsColors } from '../../theme/pillarsTheme';

interface BackButtonProps {
  onPress: () => void;
  variant?: 'default' | 'transparent' | 'filled';
  color?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  variant = 'default',
  color
}) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Determine the icon color based on variant and theme
  const getIconColor = () => {
    if (color) return color;

    switch (variant) {
      case 'transparent':
        return theme.text.primary;
      case 'filled':
        return isDark ? '#FFFFFF' : theme.text.primary;
      default:
        return theme.text.primary;
    }
  };

  // Determine background style based on variant
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'transparent':
        return {};
      case 'filled':
        return {
          backgroundColor: isDark
            ? PillarsColors.glass.white[10]
            : PillarsColors.glass.black[5],
          ...PillarsShadows.sm,
        };
      default:
        return {
          backgroundColor: isDark
            ? theme.background.card
            : theme.background.card,
          ...PillarsShadows.sm,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getBackgroundStyle()]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="arrow-back"
        size={24}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BackButton;