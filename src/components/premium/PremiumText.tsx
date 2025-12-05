/**
 * Premium Text Components
 * Typography components with Apple-inspired styling
 */

import React, { memo } from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, AppleColors } from '../../theme/appleDesignSystem';

interface PremiumTextProps extends TextProps {
  variant?: 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' | 'body' | 'callout' | 'subheadline' | 'footnote' | 'caption1' | 'caption2';
  weight?: keyof typeof Typography.weights;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  animated?: boolean;
  animationType?: 'fade' | 'fadeDown' | 'fadeUp' | 'slideLeft' | 'slideRight';
  delay?: number;
  arabic?: boolean;
  gradient?: string[];
  style?: TextStyle | TextStyle[];
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export const PremiumText = memo<PremiumTextProps>(({
  children,
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  animated = false,
  animationType = 'fade',
  delay = 0,
  arabic = false,
  gradient,
  style,
  ...props
}) => {
  const { isDark } = useTheme();

  const getTextColor = (): string => {
    if (color) return color;
    if (isDark) return AppleColors.semantic.textDark.primary;
    return AppleColors.semantic.text.primary;
  };

  const getAnimation = () => {
    if (!animated) return undefined;

    switch (animationType) {
      case 'fadeDown':
        return FadeInDown.delay(delay).springify();
      case 'fadeUp':
        return FadeInUp.delay(delay).springify();
      case 'slideLeft':
        return SlideInLeft.delay(delay).springify();
      case 'slideRight':
        return SlideInRight.delay(delay).springify();
      default:
        return FadeIn.delay(delay).springify();
    }
  };

  const textStyle: TextStyle = {
    fontSize: Typography.sizes[variant],
    fontFamily: Typography.fonts.regular,
    fontWeight: Typography.weights[weight] as any,
    color: getTextColor(),
    textAlign: align,
    lineHeight: Typography.sizes[variant] * (arabic ? Typography.lineHeights.arabic : Typography.lineHeights.normal),
    ...(arabic && {
      fontFamily: Typography.fonts.regular, // Will be replaced with Arabic font
      writingDirection: 'rtl' as any,
    }),
  };

  const TextComponent = animated ? AnimatedText : Text;

  return (
    <TextComponent
      entering={getAnimation()}
      style={[textStyle, style]}
      {...props}
    >
      {children}
    </TextComponent>
  );
});

// Preset Components
export const LargeTitle = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="largeTitle" weight="bold" {...props} />
));

export const Title1 = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="title1" weight="bold" {...props} />
));

export const Title2 = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="title2" weight="semibold" {...props} />
));

export const Title3 = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="title3" weight="semibold" {...props} />
));

export const Headline = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="headline" weight="semibold" {...props} />
));

export const Body = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="body" {...props} />
));

export const Callout = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="callout" {...props} />
));

export const Subheadline = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="subheadline" {...props} />
));

export const Footnote = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="footnote" {...props} />
));

export const Caption1 = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="caption1" {...props} />
));

export const Caption2 = memo<Omit<PremiumTextProps, 'variant'>>((props) => (
  <PremiumText variant="caption2" {...props} />
));

// Arabic Text Component
export const ArabicText = memo<Omit<PremiumTextProps, 'arabic'>>((props) => (
  <PremiumText
    arabic
    align="center"
    weight="medium"
    color={AppleColors.islamic.emerald[600]}
    {...props}
  />
));

PremiumText.displayName = 'PremiumText';
LargeTitle.displayName = 'LargeTitle';
Title1.displayName = 'Title1';
Title2.displayName = 'Title2';
Title3.displayName = 'Title3';
Headline.displayName = 'Headline';
Body.displayName = 'Body';
Callout.displayName = 'Callout';
Subheadline.displayName = 'Subheadline';
Footnote.displayName = 'Footnote';
Caption1.displayName = 'Caption1';
Caption2.displayName = 'Caption2';
ArabicText.displayName = 'ArabicText';

export default PremiumText;