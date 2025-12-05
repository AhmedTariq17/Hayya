/**
 * Type fixes and utilities
 */

// Fix for SharedValue type
export type SharedValue<T> = {
  value: T;
};

// Gradient color type
export type GradientColors = readonly [string, string, ...string[]];

// Convert array to gradient colors
export const toGradientColors = (colors: string[]): GradientColors => {
  if (colors.length < 2) {
    return ['#000000', '#000000'];
  }
  return colors as any;
};