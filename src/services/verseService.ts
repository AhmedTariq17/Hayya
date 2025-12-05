import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const VERSE_CACHE_KEY = '@daily_verse_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Verse {
  arabic: string;
  translation: string;
  reference: string;
  surah: string;
  ayah: number;
  audio?: string;
}

interface CachedVerse {
  verse: Verse;
  timestamp: number;
  date: string;
}

export class VerseService {
  /**
   * Get a daily verse (Ayah of the Day)
   */
  static async getDailyVerse(): Promise<Verse> {
    try {
      // Check cache first
      const cached = await this.getCachedVerse();
      if (cached && this.isCacheValid(cached)) {
        return cached.verse;
      }

      // Generate random verse (1-6236 total verses in Quran)
      const randomAyah = Math.floor(Math.random() * 6236) + 1;

      // Fetch from Al-Quran Cloud API (free, no key required)
      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/en.asad`)
      ]);

      if (arabicResponse.data?.data && englishResponse.data?.data) {
        const arabicData = arabicResponse.data.data;
        const englishData = englishResponse.data.data;

        const verse: Verse = {
          arabic: arabicData.text,
          translation: englishData.text,
          reference: `${englishData.surah.englishName} ${englishData.surah.number}:${englishData.numberInSurah}`,
          surah: englishData.surah.englishName,
          ayah: englishData.numberInSurah,
          audio: arabicData.audio,
        };

        // Cache the verse
        await this.cacheVerse(verse);

        return verse;
      }

      // Fallback to default verse if API fails
      return this.getDefaultVerse();
    } catch (error) {
      console.error('Error fetching daily verse:', error);

      // Try to use cached verse even if expired
      const cached = await this.getCachedVerse();
      if (cached) {
        return cached.verse;
      }

      // Return default verse as last resort
      return this.getDefaultVerse();
    }
  }

  /**
   * Get a specific verse by surah and ayah number
   */
  static async getVerse(surah: number, ayah: number): Promise<Verse> {
    try {
      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`)
      ]);

      if (arabicResponse.data?.data && englishResponse.data?.data) {
        const arabicData = arabicResponse.data.data;
        const englishData = englishResponse.data.data;

        return {
          arabic: arabicData.text,
          translation: englishData.text,
          reference: `${englishData.surah.englishName} ${englishData.surah.number}:${englishData.numberInSurah}`,
          surah: englishData.surah.englishName,
          ayah: englishData.numberInSurah,
          audio: arabicData.audio,
        };
      }

      throw new Error('Failed to fetch verse');
    } catch (error) {
      console.error('Error fetching specific verse:', error);
      throw error;
    }
  }

  /**
   * Get verses for a specific surah
   */
  static async getSurahVerses(surahNumber: number): Promise<Verse[]> {
    try {
      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`)
      ]);

      if (arabicResponse.data?.data && englishResponse.data?.data) {
        const arabicData = arabicResponse.data.data;
        const englishData = englishResponse.data.data;

        return arabicData.ayahs.map((arabicAyah: any, index: number) => {
          const englishAyah = englishData.ayahs[index];
          return {
            arabic: arabicAyah.text,
            translation: englishAyah.text,
            reference: `${englishData.englishName} ${englishData.number}:${arabicAyah.numberInSurah}`,
            surah: englishData.englishName,
            ayah: arabicAyah.numberInSurah,
            audio: arabicAyah.audio,
          };
        });
      }

      throw new Error('Failed to fetch surah verses');
    } catch (error) {
      console.error('Error fetching surah verses:', error);
      throw error;
    }
  }

  /**
   * Search verses by keyword
   */
  static async searchVerses(keyword: string, language: 'en' | 'ar' = 'en'): Promise<Verse[]> {
    try {
      const edition = language === 'ar' ? 'ar.alafasy' : 'en.asad';
      const response = await axios.get(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/all/${edition}`
      );

      if (response.data?.data?.matches) {
        const matches = response.data.data.matches;

        // Limit to first 20 results
        return matches.slice(0, 20).map((match: any) => ({
          arabic: match.text,
          translation: match.text, // Will be in the language searched
          reference: `${match.surah.englishName} ${match.surah.number}:${match.numberInSurah}`,
          surah: match.surah.englishName,
          ayah: match.numberInSurah,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  /**
   * Get default verse (fallback)
   */
  private static getDefaultVerse(): Verse {
    const defaultVerses: Verse[] = [
      {
        arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
        translation: 'And whoever fears Allah - He will make for him a way out',
        reference: 'At-Talaq 65:2',
        surah: 'At-Talaq',
        ayah: 2,
      },
      {
        arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Indeed, with hardship comes ease',
        reference: 'Ash-Sharh 94:5',
        surah: 'Ash-Sharh',
        ayah: 5,
      },
      {
        arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ',
        translation: 'And Allah is the best of providers',
        reference: 'Al-Jumu\'ah 62:11',
        surah: 'Al-Jumu\'ah',
        ayah: 11,
      },
      {
        arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
        translation: 'Indeed, Allah is with the patient',
        reference: 'Al-Baqarah 2:153',
        surah: 'Al-Baqarah',
        ayah: 153,
      },
      {
        arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
        translation: 'And He is with you wherever you are',
        reference: 'Al-Hadid 57:4',
        surah: 'Al-Hadid',
        ayah: 4,
      },
    ];

    // Select a verse based on the day of the year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return defaultVerses[dayOfYear % defaultVerses.length];
  }

  /**
   * Cache verse
   */
  private static async cacheVerse(verse: Verse): Promise<void> {
    try {
      const cached: CachedVerse = {
        verse,
        timestamp: Date.now(),
        date: new Date().toDateString(),
      };
      await AsyncStorage.setItem(VERSE_CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache verse:', error);
    }
  }

  /**
   * Get cached verse
   */
  private static async getCachedVerse(): Promise<CachedVerse | null> {
    try {
      const cached = await AsyncStorage.getItem(VERSE_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to get cached verse:', error);
    }
    return null;
  }

  /**
   * Check if cache is valid (same day)
   */
  private static isCacheValid(cached: CachedVerse): boolean {
    const today = new Date().toDateString();
    return cached.date === today;
  }

  /**
   * Clear cached verse
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(VERSE_CACHE_KEY);
    } catch (error) {
      console.warn('Failed to clear verse cache:', error);
    }
  }
}