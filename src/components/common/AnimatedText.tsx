/**
 * Animated Text Components - Apple-inspired Typography with Animations
 */

import React, { useEffect, useRef } from 'react';
import { Text, TextStyle, StyleProp, Animated } from 'react-native';
import { TYPOGRAPHY, COLORS, ANIMATION } from '../../theme/constants';

interface AnimatedTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  color?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideRight' | 'slideLeft' | 'scale' | 'none';
  delay?: number;
  duration?: number;
  fontSize?: number;
}

const createAnimatedTextComponent = (
  baseStyle: TextStyle,
  defaultAnimation: AnimatedTextProps['animation'] = 'fadeIn'
) => {
  return React.forwardRef<Text, AnimatedTextProps>(
    ({ children, style, color, animation = defaultAnimation, delay = 0, duration = 300, fontSize, ...props }, ref) => {
      const fadeAnim = useRef(new Animated.Value(0)).current;
      const translateAnim = useRef(new Animated.Value(20)).current;
      const scaleAnim = useRef(new Animated.Value(0.95)).current;

      useEffect(() => {
        const animations: Animated.CompositeAnimation[] = [];

        switch (animation) {
          case 'fadeIn':
            animations.push(
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
              })
            );
            break;
          case 'slideUp':
            animations.push(
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
                Animated.timing(translateAnim, {
                  toValue: 0,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
              ])
            );
            break;
          case 'slideDown':
            translateAnim.setValue(-20);
            animations.push(
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
                Animated.timing(translateAnim, {
                  toValue: 0,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
              ])
            );
            break;
          case 'slideRight':
            translateAnim.setValue(-20);
            animations.push(
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
                Animated.timing(translateAnim, {
                  toValue: 0,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
              ])
            );
            break;
          case 'slideLeft':
            animations.push(
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
                Animated.timing(translateAnim, {
                  toValue: 0,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
              ])
            );
            break;
          case 'scale':
            animations.push(
              Animated.parallel([
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration,
                  delay,
                  useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                  toValue: 1,
                  friction: 4,
                  tension: 40,
                  delay,
                  useNativeDriver: true,
                }),
              ])
            );
            break;
          case 'none':
            fadeAnim.setValue(1);
            translateAnim.setValue(0);
            scaleAnim.setValue(1);
            break;
        }

        if (animations.length > 0) {
          Animated.parallel(animations).start();
        }
      }, [animation, delay, duration]);

      const animatedStyle: any = {
        opacity: animation !== 'none' ? fadeAnim : 1,
      };

      if (animation === 'slideUp' || animation === 'slideDown') {
        animatedStyle.transform = [{ translateY: translateAnim }];
      } else if (animation === 'slideRight') {
        animatedStyle.transform = [{ translateX: translateAnim }];
      } else if (animation === 'slideLeft') {
        animatedStyle.transform = [{ translateX: Animated.multiply(translateAnim, -1) }];
      } else if (animation === 'scale') {
        animatedStyle.transform = [{ scale: scaleAnim }];
      }

      const finalStyle = [
        baseStyle,
        color ? { color } : {},
        fontSize ? { fontSize } : {},
        style,
      ];

      return (
        <Animated.Text
          ref={ref as any}
          style={[finalStyle, animatedStyle]}
          {...props}
        >
          {children}
        </Animated.Text>
      );
    }
  );
};

// Large Title (34pt)
export const LargeTitle = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.largeTitle,
  fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  color: COLORS.text.primary,
  letterSpacing: 0.5,
}, 'fadeIn');

// Heading (28pt)
export const Heading = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.title1,
  fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  color: COLORS.text.primary,
  letterSpacing: 0.3,
}, 'fadeIn');

// Title (22pt)
export const Title = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.title2,
  fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  color: COLORS.text.primary,
}, 'fadeIn');

// Subheading (20pt)
export const Subheading = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.title3,
  fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  color: COLORS.text.primary,
}, 'fadeIn');

// Body Text (17pt)
export const Body = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.body,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.primary,
  lineHeight: TYPOGRAPHY.fontSize.body * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Callout (16pt)
export const Callout = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.callout,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.primary,
  lineHeight: TYPOGRAPHY.fontSize.callout * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Subheadline (15pt)
export const Subheadline = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.subheadline,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.secondary,
  lineHeight: TYPOGRAPHY.fontSize.subheadline * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Footnote (13pt)
export const Footnote = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.footnote,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.secondary,
  lineHeight: TYPOGRAPHY.fontSize.footnote * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Caption (12pt)
export const Caption = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.caption1,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.tertiary,
  lineHeight: TYPOGRAPHY.fontSize.caption1 * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Caption2 (11pt)
export const Caption2 = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.caption2,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.tertiary,
  lineHeight: TYPOGRAPHY.fontSize.caption2 * TYPOGRAPHY.lineHeight.normal,
}, 'fadeIn');

// Arabic Text - Special component for Arabic typography
export const ArabicText = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.arabicRegular,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.primary,
  lineHeight: TYPOGRAPHY.fontSize.arabicRegular * TYPOGRAPHY.lineHeight.arabic,
  textAlign: 'right',
  writingDirection: 'rtl' as any,
}, 'fadeIn');

// Arabic Large
export const ArabicLarge = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.arabicLarge,
  fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  color: COLORS.text.primary,
  lineHeight: TYPOGRAPHY.fontSize.arabicLarge * TYPOGRAPHY.lineHeight.arabic,
  textAlign: 'right',
  writingDirection: 'rtl' as any,
}, 'scale');

// Arabic Medium
export const ArabicMedium = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.arabicMedium,
  fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  color: COLORS.text.primary,
  lineHeight: TYPOGRAPHY.fontSize.arabicMedium * TYPOGRAPHY.lineHeight.arabic,
  textAlign: 'right',
  writingDirection: 'rtl' as any,
}, 'fadeIn');

// Arabic Small
export const ArabicSmall = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.arabicSmall,
  fontWeight: TYPOGRAPHY.fontWeight.regular as any,
  color: COLORS.text.secondary,
  lineHeight: TYPOGRAPHY.fontSize.arabicSmall * TYPOGRAPHY.lineHeight.arabic,
  textAlign: 'right',
  writingDirection: 'rtl' as any,
}, 'fadeIn');

// Special Styled Components
export const GoldText = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.headline,
  fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  color: COLORS.secondary.gold,
  letterSpacing: 0.5,
}, 'fadeIn');

export const GradientText = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.headline,
  fontWeight: TYPOGRAPHY.fontWeight.bold as any,
  color: COLORS.primary.main,
  letterSpacing: 0.3,
}, 'slideUp');

export const ErrorText = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.footnote,
  fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  color: COLORS.semantic.error,
}, 'fadeIn');

export const SuccessText = createAnimatedTextComponent({
  fontSize: TYPOGRAPHY.fontSize.footnote,
  fontWeight: TYPOGRAPHY.fontWeight.medium as any,
  color: COLORS.semantic.success,
}, 'fadeIn');

// Export all components as a collection
export default {
  LargeTitle,
  Heading,
  Title,
  Subheading,
  Body,
  Callout,
  Subheadline,
  Footnote,
  Caption,
  Caption2,
  ArabicText,
  ArabicLarge,
  ArabicMedium,
  ArabicSmall,
  GoldText,
  GradientText,
  ErrorText,
  SuccessText,
};