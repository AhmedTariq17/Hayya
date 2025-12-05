/**
 * Utility Types for the Hayya App
 */

import { ColorValue } from 'react-native';

// Gradient Colors Type
export type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

// Helper function to create gradient arrays with proper type
export const createGradient = <T extends GradientColors>(...colors: T): T => {
  return colors;
};

// Helper for two-color gradients
export const gradient2 = (color1: string, color2: string): [string, string] => {
  return [color1, color2];
};

// Helper for three-color gradients
export const gradient3 = (color1: string, color2: string, color3: string): [string, string, string] => {
  return [color1, color2, color3];
};

// Icon names type helper
export type IoniconsGlyphs = string; // Use string for flexibility with icons

// SharedValue type fix for react-native-reanimated
export type SharedValue<T> = {
  value: T;
  addListener: (id: number, listener: (value: T) => void) => void;
  removeListener: (id: number) => void;
  modify: (modifier: (value: T) => T) => void;
};

// Font weight types
export type FontWeightType =
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | 'normal' | 'bold' | 'light' | 'medium' | 'semibold' | 'heavy' | 'ultralight';

// Helper to ensure proper font weight
export const fontWeight = (weight: string): FontWeightType => {
  return weight as FontWeightType;
};