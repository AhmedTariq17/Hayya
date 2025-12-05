import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { GlassCard } from '../components/common/GlassCard';
import { GradientHeader } from '../components/common/GradientHeader';
import { ArabicText, Heading } from '../components/common/AnimatedText';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../theme/constants';
import { QuranService } from '../services/quranService';
import { StatisticsService } from '../services/statisticsService';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

const getArabicName = (surahName: string): string => {
  const arabicNames: { [key: string]: string } = {
    "Al-Fatihah": "الفاتحة",
    "Al-Baqarah": "البقرة",
    "Ali 'Imran": "آل عمران",
    "An-Nisa": "النساء",
    "Al-Ma'idah": "المائدة",
    "Al-An'am": "الأنعام",
    "Al-A'raf": "الأعراف",
    "Al-Anfal": "الأنفال",
    "At-Tawbah": "التوبة",
    "Yunus": "يونس",
    "Hud": "هود",
    "Yusuf": "يوسف",
    "Ar-Ra'd": "الرعد",
    "Ibrahim": "إبراهيم",
    "Al-Hijr": "الحجر",
    "An-Nahl": "النحل",
    "Al-Isra": "الإسراء",
    "Al-Kahf": "الكهف",
    "Maryam": "مريم",
    "Taha": "طه",
    "Al-Anbya": "الأنبياء",
    "Al-Hajj": "الحج",
    "Al-Mu'minun": "المؤمنون",
    "An-Nur": "النور",
    "Al-Furqan": "الفرقان",
    "Ash-Shu'ara": "الشعراء",
    "An-Naml": "النمل",
    "Al-Qasas": "القصص",
    "Al-'Ankabut": "العنكبوت",
    "Ar-Rum": "الروم",
    "Luqman": "لقمان",
    "As-Sajdah": "السجدة",
    "Al-Ahzab": "الأحزاب",
    "Saba": "سبإ",
    "Fatir": "فاطر",
    "Ya-Sin": "يس",
    "As-Saffat": "الصافات",
    "Sad": "ص",
    "Az-Zumar": "الزمر",
    "Ghafir": "غافر",
    "Fussilat": "فصلت",
    "Ash-Shuraa": "الشورى",
    "Az-Zukhruf": "الزخرف",
    "Ad-Dukhan": "الدخان",
    "Al-Jathiyah": "الجاثية",
    "Al-Ahqaf": "الأحقاف",
    "Muhammad": "محمد",
    "Al-Fath": "الفتح",
    "Al-Hujurat": "الحجرات",
    "Qaf": "ق",
    "Adh-Dhariyat": "الذاريات",
    "At-Tur": "الطور",
    "An-Najm": "النجم",
    "Al-Qamar": "القمر",
    "Ar-Rahman": "الرحمن",
    "Al-Waqi'ah": "الواقعة",
    "Al-Hadid": "الحديد",
    "Al-Mujadila": "المجادلة",
    "Al-Hashr": "الحشر",
    "Al-Mumtahanah": "الممتحنة",
    "As-Saf": "الصف",
    "Al-Jumu'ah": "الجمعة",
    "Al-Munafiqun": "المنافقون",
    "At-Taghabun": "التغابن",
    "At-Talaq": "الطلاق",
    "At-Tahrim": "التحريم",
    "Al-Mulk": "الملك",
    "Al-Qalam": "القلم",
    "Al-Haqqah": "الحاقة",
    "Al-Ma'arij": "المعارج",
    "Nuh": "نوح",
    "Al-Jinn": "الجن",
    "Al-Muzzammil": "المزمل",
    "Al-Muddaththir": "المدثر",
    "Al-Qiyamah": "القيامة",
    "Al-Insan": "الإنسان",
    "Al-Mursalat": "المرسلات",
    "An-Naba": "النبأ",
    "An-Nazi'at": "النازعات",
    "Abasa": "عبس",
    "At-Takwir": "التكوير",
    "Al-Infitar": "الإنفطار",
    "Al-Mutaffifin": "المطففين",
    "Al-Inshiqaq": "الإنشقاق",
    "Al-Buruj": "البروج",
    "At-Tariq": "الطارق",
    "Al-A'la": "الأعلى",
    "Al-Ghashiyah": "الغاشية",
    "Al-Fajr": "الفجر",
    "Al-Balad": "البلد",
    "Ash-Shams": "الشمس",
    "Al-Layl": "الليل",
    "Ad-Dhuhaa": "الضحى",
    "Ash-Sharh": "الشرح",
    "At-Tin": "التين",
    "Al-'Alaq": "العلق",
    "Al-Qadr": "القدر",
    "Al-Bayyinah": "البينة",
    "Az-Zalzalah": "الزلزلة",
    "Al-'Adiyat": "العاديات",
    "Al-Qari'ah": "القارعة",
    "At-Takathur": "التكاثر",
    "Al-'Asr": "العصر",
    "Al-Humazah": "الهمزة",
    "Al-Fil": "الفيل",
    "Quraysh": "قريش",
    "Al-Ma'un": "الماعون",
    "Al-Kawthar": "الكوثر",
    "Al-Kafirun": "الكافرون",
    "An-Nasr": "النصر",
    "Al-Masad": "المسد",
    "Al-Ikhlas": "الإخلاص",
    "Al-Falaq": "الفلق",
    "An-Nas": "الناس",
  };

  return arabicNames[surahName] || surahName;
};

const SurahCard: React.FC<{
  surah: Surah;
  onPress: () => void;
  delay: number;
  lastRead?: { surahNumber: number; ayahNumber: number };
}> = ({ surah, onPress, delay, lastRead }) => {
  const isLastRead = lastRead?.surahNumber === surah.number;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <GlassCard style={isLastRead ? [styles.surahCard, styles.lastReadCard] : styles.surahCard}>
          {isLastRead && (
            <View style={styles.lastReadBadge}>
              <Ionicons name="bookmark" size={12} color={COLORS.text.inverse} />
              <Text style={styles.lastReadText}>Last Read</Text>
            </View>
          )}

          <View style={styles.surahNumber}>
            <LinearGradient
              colors={isLastRead ? COLORS.accent.softGradient as any : COLORS.primary.gradient as any}
              style={styles.numberGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.numberText}>{surah.number}</Text>
            </LinearGradient>
          </View>

          <View style={styles.surahContent}>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{surah.name}</Text>
              <Text style={styles.surahEnglish}>{surah.englishNameTranslation}</Text>
              <View style={styles.surahMeta}>
                <View style={[
                  styles.revelationBadge,
                  { backgroundColor: surah.revelationType === 'Meccan' ? COLORS.accent.purple + '20' : COLORS.accent.teal + '20' }
                ]}>
                  <Text style={[
                    styles.revelationText,
                    { color: surah.revelationType === 'Meccan' ? COLORS.accent.purple : COLORS.accent.teal }
                  ]}>
                    {surah.revelationType}
                  </Text>
                </View>
                <Text style={styles.ayahCount}>{surah.numberOfAyahs} Ayahs</Text>
              </View>
            </View>

            <View style={styles.surahArabic}>
              <ArabicText fontSize={28} style={styles.arabicName}>
                {getArabicName(surah.name)}
              </ArabicText>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuranScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'meccan' | 'medinan'>('all');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRead, setLastRead] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get surah list from service
      const surahList = QuranService.getSurahList();
      setSurahs(surahList);

      // Load last read and bookmarks
      const [lastReadData, bookmarksData] = await Promise.all([
        QuranService.getLastRead(),
        QuranService.getBookmarks()
      ]);

      setLastRead(lastReadData);
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error('Error loading Quran data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSurahs = surahs.filter(surah => {
    const matchesSearch =
      surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getArabicName(surah.name).includes(searchQuery);

    const matchesFilter =
      filterType === 'all' ||
      surah.revelationType.toLowerCase() === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleSurahPress = useCallback(async (surah: Surah) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to surah detail (create this screen later)
    navigation.navigate('SurahDetail', { surah });

    // Update statistics for Quran reading
    try {
      await StatisticsService.addQuranPages(1);
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }, [navigation]);

  const handleFilterPress = (type: 'all' | 'meccan' | 'medinan') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterType(type);
  };

  const handleSearchPress = useCallback(async () => {
    if (searchQuery.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Navigate to search results
      navigation.navigate('QuranSearch', { searchQuery: searchQuery.trim() });
    }
  }, [searchQuery, navigation]);

  const handleBookmarksPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('QuranBookmarks', { bookmarks });
  }, [bookmarks, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={styles.loadingText}>Loading Quran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="القرآن الكريم"
        subtitle="The Holy Quran"
        showBackButton
        navigation={navigation}
        scrollY={scrollY}
        rightIcon="bookmarks"
        onRightPress={handleBookmarksPress}
      />

      <View style={styles.content}>
        {/* Featured Card - Basmala */}
        <Animated.View entering={FadeIn.delay(100).springify()}>
          <GlassCard style={styles.basmalaCard} elevation="lg">
            <LinearGradient
              colors={COLORS.primary.softGradient as any}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <ArabicText fontSize={32} style={styles.basmala}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </ArabicText>
            <Text style={styles.basmalaTranslation}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>114</Text>
                <Text style={styles.statLabel}>Surahs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>6,236</Text>
                <Text style={styles.statLabel}>Ayahs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>30</Text>
                <Text style={styles.statLabel}>Juz</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Continue Reading Card */}
        {lastRead && (
          <Animated.View entering={FadeIn.delay(150).springify()}>
            <TouchableOpacity
              onPress={() => {
                const surah = surahs.find(s => s.number === lastRead.surahNumber);
                if (surah) handleSurahPress(surah);
              }}
            >
              <GlassCard style={styles.continueCard}>
                <LinearGradient
                  colors={COLORS.accent.softGradient as any}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={styles.continueContent}>
                  <View style={styles.continueLeft}>
                    <Ionicons name="book" size={24} color={COLORS.text.inverse} />
                    <View style={styles.continueInfo}>
                      <Text style={styles.continueTitle}>Continue Reading</Text>
                      <Text style={styles.continueSubtitle}>
                        {lastRead.surahName} • Ayah {lastRead.ayahNumber}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.text.inverse} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Surahs or Ayahs..."
              placeholderTextColor={COLORS.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchPress}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity onPress={() => handleFilterPress('all')}>
            <View style={[
              styles.filterChip,
              filterType === 'all' && styles.filterChipActive
            ]}>
              <Text style={[
                styles.filterText,
                filterType === 'all' && styles.filterTextActive
              ]}>
                All ({surahs.length})
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterPress('meccan')}>
            <View style={[
              styles.filterChip,
              filterType === 'meccan' && styles.filterChipActive
            ]}>
              <MaterialCommunityIcons
                name={"mosque" as any}
                size={16}
                color={filterType === 'meccan' ? COLORS.text.inverse : COLORS.text.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={[
                styles.filterText,
                filterType === 'meccan' && styles.filterTextActive
              ]}>
                Meccan (86)
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterPress('medinan')}>
            <View style={[
              styles.filterChip,
              filterType === 'medinan' && styles.filterChipActive
            ]}>
              <MaterialCommunityIcons
                name={"mosque" as any}
                size={16}
                color={filterType === 'medinan' ? COLORS.text.inverse : COLORS.text.primary}
                style={{ marginRight: 4 }}
              />
              <Text style={[
                styles.filterText,
                filterType === 'medinan' && styles.filterTextActive
              ]}>
                Medinan (28)
              </Text>
            </View>
          </TouchableOpacity>

          {bookmarks.length > 0 && (
            <TouchableOpacity onPress={handleBookmarksPress}>
              <View style={styles.filterChip}>
                <Ionicons
                  name="bookmarks"
                  size={16}
                  color={COLORS.text.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.filterText}>
                  Bookmarks ({bookmarks.length})
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Surahs List */}
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.number.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <SurahCard
              surah={item}
              onPress={() => handleSurahPress(item)}
              delay={Math.min(index * 30, 300)}
              lastRead={lastRead}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={COLORS.text.secondary} />
              <Text style={styles.emptyText}>No surahs found</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  content: {
    flex: 1,
  },
  basmalaCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  basmala: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text.inverse,
  },
  basmalaTranslation: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.title2,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.inverse,
    opacity: 0.8,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  continueInfo: {
    marginLeft: SPACING.md,
  },
  continueTitle: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.inverse,
  },
  continueSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    color: COLORS.text.inverse,
    opacity: 0.9,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.primary,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.background.primary,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.neutral.gray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  filterText: {
    fontSize: TYPOGRAPHY.fontSize.footnote,
    fontWeight: TYPOGRAPHY.fontWeight.medium as any,
    color: COLORS.text.primary,
  },
  filterTextActive: {
    color: COLORS.text.inverse,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  surahCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  lastReadCard: {
    borderWidth: 2,
    borderColor: COLORS.accent.teal,
  },
  lastReadBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: COLORS.accent.teal,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  lastReadText: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.inverse,
    marginLeft: 4,
  },
  surahNumber: {
    marginRight: SPACING.md,
  },
  numberGradient: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.bold as any,
    color: COLORS.text.inverse,
  },
  surahContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: TYPOGRAPHY.fontSize.headline,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  surahEnglish: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  surahMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revelationBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.sm,
  },
  revelationText: {
    fontSize: TYPOGRAPHY.fontSize.caption2,
    fontWeight: TYPOGRAPHY.fontWeight.semibold as any,
  },
  ayahCount: {
    fontSize: TYPOGRAPHY.fontSize.caption1,
    color: COLORS.text.secondary,
  },
  surahArabic: {
    justifyContent: 'center',
  },
  arabicName: {
    color: COLORS.primary.main,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.subheadline,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
});

export default QuranScreen;