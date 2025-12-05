import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';
import {spacing, fontSize, borderRadius} from '../theme';
import {useNavigation} from '@react-navigation/native';

interface LearningCard {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  gradientColors: readonly [string, string];
  screen?: string;
}

const LearnScreen = () => {
  const {theme, isDark} = useTheme();
  const navigation = useNavigation();

  const learningCards: LearningCard[] = [
    {
      id: '1',
      title: 'Tasbih Counter',
      subtitle: 'Digital Dhikr Counter',
      icon: 'repeat',
      gradientColors: [theme.gold, theme.goldLight] as const,
      screen: 'Tasbih',
    },
    {
      id: '2',
      title: 'Learn Arabic',
      subtitle: 'Basic Islamic Phrases',
      icon: 'language',
      gradientColors: ['#2563EB', '#60A5FA'] as const,
    },
  ];

  const handleCardPress = (card: LearningCard) => {
    if (card.screen) {
      // @ts-ignore
      navigation.navigate(card.screen);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background.light}]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? theme.gradients.night : theme.gradients.islamic}
        style={styles.header}>
        <Text style={[styles.title, {color: theme.text.inverse}]}>
          Learn Islam
        </Text>
        <Text style={[styles.subtitle, {color: theme.text.inverse}]}>
          Deepen your knowledge and faith
        </Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {learningCards.map(card => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.9}>
              <LinearGradient
                colors={card.gradientColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.card}>
                <View style={styles.cardIcon}>
                  <Icon name={card.icon} size={32} color="white" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
                <Icon name="chevron-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesSection}>
          <Text style={[styles.sectionTitle, {color: theme.text.primary}]}>
            Resources
          </Text>
          <View
            style={[
              styles.resourceCard,
              {backgroundColor: theme.background.card},
            ]}>
            <Icon name="book-outline" size={24} color={theme.primary} />
            <Text style={[styles.resourceText, {color: theme.text.primary}]}>
              Recommended Islamic Books
            </Text>
          </View>
          <View
            style={[
              styles.resourceCard,
              {backgroundColor: theme.background.card},
            ]}>
            <Icon name="link-outline" size={24} color={theme.primary} />
            <Text style={[styles.resourceText, {color: theme.text.primary}]}>
              Useful Islamic Websites
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    opacity: 0.9,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  resourcesSection: {
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  resourceText: {
    fontSize: fontSize.md,
    marginLeft: spacing.md,
    flex: 1,
  },
});

export default LearnScreen;
