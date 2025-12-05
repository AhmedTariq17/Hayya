/**
 * Adjust Prayer Times Screen
 * Allows users to fine-tune prayer time calculations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme & Components
import { useTheme } from '../contexts/ThemeContext';
import {
  PillarsColors,
  PillarsSpacing,
  PillarsBorderRadius,
  PillarsShadows,
  PillarsTypography,
  PillarsLayout,
  getPillarsTheme,
} from '../theme/pillarsTheme';
import { BackButton } from '../components/ui/BackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PrayerAdjustment {
  name: string;
  id: string;
  value: number;
  icon: string;
}

const AdjustPrayerTimesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = getPillarsTheme(isDark);

  // Prayer adjustments state (in minutes)
  const [adjustments, setAdjustments] = useState<PrayerAdjustment[]>([
    { name: 'Fajr', id: 'fajr', value: 0, icon: 'weather-sunset-up' },
    { name: 'Dhuhr', id: 'dhuhr', value: 0, icon: 'weather-sunny' },
    { name: 'Asr', id: 'asr', value: 0, icon: 'weather-sunny-alert' },
    { name: 'Maghrib', id: 'maghrib', value: 0, icon: 'weather-sunset-down' },
    { name: 'Isha', id: 'isha', value: 0, icon: 'weather-night' },
  ]);

  const [highLatitudeMethod, setHighLatitudeMethod] = useState('AngleBased');

  // Load saved adjustments
  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    try {
      const saved = await AsyncStorage.getItem('prayerAdjustments');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAdjustments(parsed.adjustments || adjustments);
        setHighLatitudeMethod(parsed.highLatitudeMethod || 'AngleBased');
      }
    } catch (error) {
      console.error('Error loading adjustments:', error);
    }
  };

  const saveAdjustments = async () => {
    try {
      await AsyncStorage.setItem('prayerAdjustments', JSON.stringify({
        adjustments,
        highLatitudeMethod,
      }));
      Alert.alert('Success', 'Prayer time adjustments saved successfully!');
    } catch (error) {
      console.error('Error saving adjustments:', error);
      Alert.alert('Error', 'Failed to save adjustments');
    }
  };

  const updateAdjustment = (id: string, value: number) => {
    setAdjustments(prev =>
      prev.map(adj => adj.id === id ? { ...adj, value } : adj)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetAdjustments = () => {
    Alert.alert(
      'Reset Adjustments',
      'Are you sure you want to reset all adjustments to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setAdjustments(prev => prev.map(adj => ({ ...adj, value: 0 })));
            setHighLatitudeMethod('AngleBased');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      ]
    );
  };

  const AdjustmentItem: React.FC<{ adjustment: PrayerAdjustment; index: number }> = ({ adjustment, index }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      'worklet';
      scale.value = withSpring(0.98, { damping: 15 });
    };

    const handlePressOut = () => {
      'worklet';
      scale.value = withSpring(1, { damping: 15 });
    };

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[animatedStyle, styles.adjustmentItem, { backgroundColor: theme.background.card }]}
      >
        <View style={styles.adjustmentHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${PillarsColors.gold[500]}15` }]}>
            <MaterialCommunityIcons
              name={adjustment.icon as any}
              size={24}
              color={PillarsColors.gold[500]}
            />
          </View>
          <View style={styles.adjustmentInfo}>
            <Text style={[styles.prayerName, { color: theme.text.primary }]}>
              {adjustment.name}
            </Text>
            <Text style={[styles.adjustmentValue, { color: theme.text.secondary }]}>
              {adjustment.value > 0 ? '+' : ''}{adjustment.value} minutes
            </Text>
          </View>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: theme.text.tertiary }]}>-30</Text>
          <Slider
            style={styles.slider}
            value={adjustment.value}
            onValueChange={(value: number) => updateAdjustment(adjustment.id, Math.round(value))}
            minimumValue={-30}
            maximumValue={30}
            step={1}
            minimumTrackTintColor={PillarsColors.gold[500]}
            maximumTrackTintColor={theme.divider}
            thumbTintColor={PillarsColors.gold[500]}
          />
          <Text style={[styles.sliderLabel, { color: theme.text.tertiary }]}>+30</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={
            isDark
              ? [PillarsColors.navy[950], PillarsColors.black[950]]
              : [PillarsColors.gold[50], PillarsColors.white]
          }
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={styles.headerContent}>
          <View style={styles.headerTop}>
            <BackButton onPress={() => navigation.goBack()} />
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
              Adjust Prayer Times
            </Text>
            <TouchableOpacity onPress={resetAdjustments} style={styles.resetButton}>
              <Ionicons name="refresh" size={24} color={theme.text.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={[styles.infoCard, { backgroundColor: `${PillarsColors.gold[500]}10` }]}
        >
          <Ionicons name="information-circle-outline" size={20} color={PillarsColors.gold[600]} />
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            Adjust prayer times to match your local mosque or personal preferences. Changes are applied in minutes.
          </Text>
        </Animated.View>

        {/* Prayer Adjustments */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Prayer Time Adjustments
          </Text>
          {adjustments.map((adjustment, index) => (
            <AdjustmentItem key={adjustment.id} adjustment={adjustment} index={index} />
          ))}
        </View>

        {/* High Latitude Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            High Latitude Method
          </Text>
          <View style={[styles.methodCard, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.methodDescription, { color: theme.text.secondary }]}>
              For locations above 48.5° latitude where Fajr or Isha times may be undefined
            </Text>
            <View style={styles.methodOptions}>
              {['AngleBased', 'OneSeventh', 'NightMiddle'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodOption,
                    {
                      backgroundColor: highLatitudeMethod === method
                        ? PillarsColors.gold[500]
                        : theme.divider
                    }
                  ]}
                  onPress={() => {
                    setHighLatitudeMethod(method);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.methodOptionText,
                      {
                        color: highLatitudeMethod === method
                          ? '#FFFFFF'
                          : theme.text.secondary
                      }
                    ]}
                  >
                    {method === 'AngleBased' ? 'Angle Based' :
                     method === 'OneSeventh' ? '1/7 of Night' :
                     'Middle of Night'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveAdjustments}
        >
          <LinearGradient
            colors={PillarsColors.gradients.navyGold as any}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.saveButtonText}>Save Adjustments</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: PillarsSpacing.xl,
  },
  headerContent: {
    paddingHorizontal: PillarsLayout.screenPadding,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: PillarsSpacing.md,
  },
  headerTitle: {
    fontSize: PillarsTypography.fontSize.xl,
    fontWeight: '700',
  },
  resetButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: PillarsLayout.screenPadding,
    paddingBottom: PillarsLayout.tabBarHeight + PillarsSpacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    padding: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.md,
    marginBottom: PillarsSpacing.xl,
    gap: PillarsSpacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.5,
  },
  section: {
    marginBottom: PillarsSpacing.xl,
  },
  sectionTitle: {
    fontSize: PillarsTypography.fontSize.lg,
    fontWeight: '700',
    marginBottom: PillarsSpacing.md,
  },
  adjustmentItem: {
    borderRadius: PillarsBorderRadius.md,
    padding: PillarsSpacing.lg,
    marginBottom: PillarsSpacing.md,
    ...PillarsShadows.sm,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: PillarsSpacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PillarsSpacing.md,
  },
  adjustmentInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  adjustmentValue: {
    fontSize: PillarsTypography.fontSize.sm,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PillarsSpacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '500',
    width: 30,
    textAlign: 'center',
  },
  methodCard: {
    borderRadius: PillarsBorderRadius.md,
    padding: PillarsSpacing.lg,
    ...PillarsShadows.sm,
  },
  methodDescription: {
    fontSize: PillarsTypography.fontSize.sm,
    lineHeight: PillarsTypography.fontSize.sm * 1.5,
    marginBottom: PillarsSpacing.md,
  },
  methodOptions: {
    flexDirection: 'row',
    gap: PillarsSpacing.sm,
  },
  methodOption: {
    flex: 1,
    paddingVertical: PillarsSpacing.sm,
    paddingHorizontal: PillarsSpacing.md,
    borderRadius: PillarsBorderRadius.sm,
    alignItems: 'center',
  },
  methodOptionText: {
    fontSize: PillarsTypography.fontSize.xs,
    fontWeight: '600',
  },
  saveButton: {
    height: 56,
    borderRadius: PillarsBorderRadius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: PillarsSpacing.lg,
    ...PillarsShadows.md,
  },
  saveButtonText: {
    fontSize: PillarsTypography.fontSize.md,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdjustPrayerTimesScreen;