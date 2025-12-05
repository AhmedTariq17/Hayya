/**
 * Accessibility Utilities
 * Helper functions for screen reader support and accessibility features
 */

import { AccessibilityRole, AccessibilityState } from 'react-native';

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

/**
 * Create accessibility props for buttons
 */
export const createButtonAccessibility = (
  label: string,
  hint?: string,
  disabled = false
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'button',
  accessibilityState: { disabled },
});

/**
 * Create accessibility props for text elements
 */
export const createTextAccessibility = (
  label: string,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'text',
});

/**
 * Create accessibility props for headers
 */
export const createHeaderAccessibility = (
  label: string,
  level: 1 | 2 | 3 = 1
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: 'header',
  accessibilityValue: { text: `Heading level ${level}` },
});

/**
 * Create accessibility props for images
 */
export const createImageAccessibility = (
  label: string,
  decorative = false
): AccessibilityProps => ({
  accessible: !decorative,
  accessibilityLabel: decorative ? undefined : label,
  accessibilityRole: 'image',
});

/**
 * Create accessibility props for links
 */
export const createLinkAccessibility = (
  label: string,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint || 'Double tap to open',
  accessibilityRole: 'link',
});

/**
 * Create accessibility props for search inputs
 */
export const createSearchAccessibility = (
  placeholder: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: 'Search',
  accessibilityHint: `Enter text to search for ${placeholder}`,
  accessibilityRole: 'search',
});

/**
 * Create accessibility props for adjustable values (sliders, counters)
 */
export const createAdjustableAccessibility = (
  label: string,
  value: number,
  min: number,
  max: number,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint || 'Swipe up or down to adjust value',
  accessibilityRole: 'adjustable',
  accessibilityValue: {
    min,
    max,
    now: value,
    text: `${value}`,
  },
});

/**
 * Create accessibility props for tab navigation
 */
export const createTabAccessibility = (
  label: string,
  index: number,
  total: number,
  selected = false
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: `${label}, tab ${index + 1} of ${total}`,
  accessibilityRole: 'tab',
  accessibilityState: { selected },
});

/**
 * Create accessibility props for checkboxes/toggles
 */
export const createToggleAccessibility = (
  label: string,
  checked: boolean,
  hint?: string
): AccessibilityProps => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint || 'Double tap to toggle',
  accessibilityRole: 'checkbox',
  accessibilityState: { checked },
});

/**
 * Format time for screen readers
 */
export const formatTimeForAccessibility = (
  hours: number,
  minutes: number,
  seconds?: number
): string => {
  let result = '';
  if (hours > 0) {
    result += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  if (minutes > 0) {
    if (result) result += ', ';
    result += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  if (seconds !== undefined && seconds > 0) {
    if (result) result += ', ';
    result += `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  }
  return result || '0 seconds';
};

/**
 * Format prayer times for screen readers
 */
export const formatPrayerTimeForAccessibility = (
  prayerName: string,
  time: string,
  completed = false
): string => {
  const status = completed ? 'completed' : 'pending';
  return `${prayerName} prayer at ${time}, ${status}`;
};

/**
 * Format counter for screen readers
 */
export const formatCounterForAccessibility = (
  count: number,
  target: number,
  label: string
): string => {
  const remaining = target - count;
  const percentage = Math.round((count / target) * 100);
  return `${label}: ${count} of ${target}, ${remaining} remaining, ${percentage} percent complete`;
};

/**
 * Format Islamic date for screen readers
 */
export const formatIslamicDateForAccessibility = (
  day: number,
  month: string,
  year: number
): string => {
  return `${day} ${month}, ${year} Hijri`;
};

/**
 * Announce to screen reader (VoiceOver/TalkBack)
 * Use for dynamic content updates
 */
export const announceForAccessibility = (message: string): void => {
  // This requires expo-screen-capture or react-native-accessibility-info
  // For now, we'll just console log in development
  if (__DEV__) {
    console.log(`[Accessibility Announcement]: ${message}`);
  }
};
