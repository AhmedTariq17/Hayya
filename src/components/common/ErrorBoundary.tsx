/**
 * ErrorBoundary Component
 * Catches errors in child components to prevent app crashes
 * Provides fallback UI for better user experience
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../theme/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would log this to an error tracking service
    // like Sentry, Bugsnag, or Firebase Crashlytics
  }

  handleReset = (): void => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <LinearGradient
            colors={[COLORS.primary.main + '10', COLORS.background.secondary]}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[COLORS.semantic.error + '20', COLORS.semantic.error + '10']}
                style={styles.iconGradient}
              >
                <Ionicons name="alert-circle" size={80} color={COLORS.semantic.error} />
              </LinearGradient>
            </View>

            {/* Error Message */}
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              We apologize for the inconvenience. The app encountered an unexpected error.
            </Text>

            {/* Error Details (Development Only) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails} showsVerticalScrollIndicator={false}>
                <View style={styles.errorBox}>
                  <Text style={styles.errorTitle}>Error Details:</Text>
                  <Text style={styles.errorText}>{this.state.error.toString()}</Text>

                  {this.state.errorInfo && (
                    <>
                      <Text style={[styles.errorTitle, { marginTop: SPACING.md }]}>
                        Component Stack:
                      </Text>
                      <Text style={styles.errorText}>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </View>
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={this.handleReset}
              >
                <LinearGradient
                  colors={[COLORS.primary.main, COLORS.primary.dark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="refresh" size={20} color={COLORS.text.inverse} />
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    // In a real app, this would report the error
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    alert('Error has been reported. Thank you for helping us improve!');
                  }}
                >
                  <Ionicons name="bug-outline" size={20} color={COLORS.primary.main} />
                  <Text style={styles.secondaryButtonText}>Report Issue</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Helpful Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>What you can try:</Text>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.semantic.success} />
                <Text style={styles.tipText}>Restart the app</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.semantic.success} />
                <Text style={styles.tipText}>Check your internet connection</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.semantic.success} />
                <Text style={styles.tipText}>Update to the latest version</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xxl,
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.title1,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.callout * TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    marginBottom: SPACING.xl,
  },
  errorBox: {
    backgroundColor: COLORS.neutral.lightGray,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.semantic.error,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  primaryButton: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.inverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.callout,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.primary.main,
  },
  tipsContainer: {
    width: '100%',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.gray,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.secondary,
  },
});

export default ErrorBoundary;
