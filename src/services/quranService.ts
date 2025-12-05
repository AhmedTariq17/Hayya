import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const CACHE_KEY_PREFIX = '@quran_cache_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const BOOKMARKS_KEY = '@quran_bookmarks';
const LAST_READ_KEY = '@quran_last_read';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation?: string;
  audio?: string;
  surah?: {
    number: number;
    name: string;
    englishName: string;
  };
  page?: number;
  juz?: number;
}

interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
  surahName: string;
}

interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  translation: string;
  timestamp: number;
}

export class QuranService {
  // List of all 114 Surahs
  static readonly SURAH_LIST: Surah[] = [
    { number: 1, name: "Al-Fatihah", englishName: "The Opening", englishNameTranslation: "The Opening", revelationType: "Meccan", numberOfAyahs: 7 },
    { number: 2, name: "Al-Baqarah", englishName: "The Cow", englishNameTranslation: "The Cow", revelationType: "Medinan", numberOfAyahs: 286 },
    { number: 3, name: "Ali 'Imran", englishName: "Family of Imran", englishNameTranslation: "Family of Imran", revelationType: "Medinan", numberOfAyahs: 200 },
    { number: 4, name: "An-Nisa", englishName: "The Women", englishNameTranslation: "The Women", revelationType: "Medinan", numberOfAyahs: 176 },
    { number: 5, name: "Al-Ma'idah", englishName: "The Table", englishNameTranslation: "The Table", revelationType: "Medinan", numberOfAyahs: 120 },
    { number: 6, name: "Al-An'am", englishName: "The Cattle", englishNameTranslation: "The Cattle", revelationType: "Meccan", numberOfAyahs: 165 },
    { number: 7, name: "Al-A'raf", englishName: "The Heights", englishNameTranslation: "The Heights", revelationType: "Meccan", numberOfAyahs: 206 },
    { number: 8, name: "Al-Anfal", englishName: "The Spoils of War", englishNameTranslation: "The Spoils of War", revelationType: "Medinan", numberOfAyahs: 75 },
    { number: 9, name: "At-Tawbah", englishName: "The Repentance", englishNameTranslation: "The Repentance", revelationType: "Medinan", numberOfAyahs: 129 },
    { number: 10, name: "Yunus", englishName: "Jonah", englishNameTranslation: "Jonah", revelationType: "Meccan", numberOfAyahs: 109 },
    { number: 11, name: "Hud", englishName: "Hud", englishNameTranslation: "Hud", revelationType: "Meccan", numberOfAyahs: 123 },
    { number: 12, name: "Yusuf", englishName: "Joseph", englishNameTranslation: "Joseph", revelationType: "Meccan", numberOfAyahs: 111 },
    { number: 13, name: "Ar-Ra'd", englishName: "The Thunder", englishNameTranslation: "The Thunder", revelationType: "Medinan", numberOfAyahs: 43 },
    { number: 14, name: "Ibrahim", englishName: "Abraham", englishNameTranslation: "Abraham", revelationType: "Meccan", numberOfAyahs: 52 },
    { number: 15, name: "Al-Hijr", englishName: "The Rock", englishNameTranslation: "The Rock", revelationType: "Meccan", numberOfAyahs: 99 },
    { number: 16, name: "An-Nahl", englishName: "The Bee", englishNameTranslation: "The Bee", revelationType: "Meccan", numberOfAyahs: 128 },
    { number: 17, name: "Al-Isra", englishName: "The Night Journey", englishNameTranslation: "The Night Journey", revelationType: "Meccan", numberOfAyahs: 111 },
    { number: 18, name: "Al-Kahf", englishName: "The Cave", englishNameTranslation: "The Cave", revelationType: "Meccan", numberOfAyahs: 110 },
    { number: 19, name: "Maryam", englishName: "Mary", englishNameTranslation: "Mary", revelationType: "Meccan", numberOfAyahs: 98 },
    { number: 20, name: "Taha", englishName: "Ta-Ha", englishNameTranslation: "Ta-Ha", revelationType: "Meccan", numberOfAyahs: 135 },
    { number: 21, name: "Al-Anbya", englishName: "The Prophets", englishNameTranslation: "The Prophets", revelationType: "Meccan", numberOfAyahs: 112 },
    { number: 22, name: "Al-Hajj", englishName: "The Pilgrimage", englishNameTranslation: "The Pilgrimage", revelationType: "Medinan", numberOfAyahs: 78 },
    { number: 23, name: "Al-Mu'minun", englishName: "The Believers", englishNameTranslation: "The Believers", revelationType: "Meccan", numberOfAyahs: 118 },
    { number: 24, name: "An-Nur", englishName: "The Light", englishNameTranslation: "The Light", revelationType: "Medinan", numberOfAyahs: 64 },
    { number: 25, name: "Al-Furqan", englishName: "The Criterion", englishNameTranslation: "The Criterion", revelationType: "Meccan", numberOfAyahs: 77 },
    { number: 26, name: "Ash-Shu'ara", englishName: "The Poets", englishNameTranslation: "The Poets", revelationType: "Meccan", numberOfAyahs: 227 },
    { number: 27, name: "An-Naml", englishName: "The Ant", englishNameTranslation: "The Ant", revelationType: "Meccan", numberOfAyahs: 93 },
    { number: 28, name: "Al-Qasas", englishName: "The Stories", englishNameTranslation: "The Stories", revelationType: "Meccan", numberOfAyahs: 88 },
    { number: 29, name: "Al-'Ankabut", englishName: "The Spider", englishNameTranslation: "The Spider", revelationType: "Meccan", numberOfAyahs: 69 },
    { number: 30, name: "Ar-Rum", englishName: "The Romans", englishNameTranslation: "The Romans", revelationType: "Meccan", numberOfAyahs: 60 },
    { number: 31, name: "Luqman", englishName: "Luqman", englishNameTranslation: "Luqman", revelationType: "Meccan", numberOfAyahs: 34 },
    { number: 32, name: "As-Sajdah", englishName: "The Prostration", englishNameTranslation: "The Prostration", revelationType: "Meccan", numberOfAyahs: 30 },
    { number: 33, name: "Al-Ahzab", englishName: "The Clans", englishNameTranslation: "The Clans", revelationType: "Medinan", numberOfAyahs: 73 },
    { number: 34, name: "Saba", englishName: "Sheba", englishNameTranslation: "Sheba", revelationType: "Meccan", numberOfAyahs: 54 },
    { number: 35, name: "Fatir", englishName: "Originator", englishNameTranslation: "Originator", revelationType: "Meccan", numberOfAyahs: 45 },
    { number: 36, name: "Ya-Sin", englishName: "Ya Sin", englishNameTranslation: "Ya Sin", revelationType: "Meccan", numberOfAyahs: 83 },
    { number: 37, name: "As-Saffat", englishName: "Those who set the Ranks", englishNameTranslation: "Those who set the Ranks", revelationType: "Meccan", numberOfAyahs: 182 },
    { number: 38, name: "Sad", englishName: "The Letter Sad", englishNameTranslation: "The Letter Sad", revelationType: "Meccan", numberOfAyahs: 88 },
    { number: 39, name: "Az-Zumar", englishName: "The Troops", englishNameTranslation: "The Troops", revelationType: "Meccan", numberOfAyahs: 75 },
    { number: 40, name: "Ghafir", englishName: "The Forgiver", englishNameTranslation: "The Forgiver", revelationType: "Meccan", numberOfAyahs: 85 },
    { number: 41, name: "Fussilat", englishName: "Explained in Detail", englishNameTranslation: "Explained in Detail", revelationType: "Meccan", numberOfAyahs: 54 },
    { number: 42, name: "Ash-Shuraa", englishName: "The Consultation", englishNameTranslation: "The Consultation", revelationType: "Meccan", numberOfAyahs: 53 },
    { number: 43, name: "Az-Zukhruf", englishName: "The Ornaments of Gold", englishNameTranslation: "The Ornaments of Gold", revelationType: "Meccan", numberOfAyahs: 89 },
    { number: 44, name: "Ad-Dukhan", englishName: "The Smoke", englishNameTranslation: "The Smoke", revelationType: "Meccan", numberOfAyahs: 59 },
    { number: 45, name: "Al-Jathiyah", englishName: "The Crouching", englishNameTranslation: "The Crouching", revelationType: "Meccan", numberOfAyahs: 37 },
    { number: 46, name: "Al-Ahqaf", englishName: "The Dunes", englishNameTranslation: "The Dunes", revelationType: "Meccan", numberOfAyahs: 35 },
    { number: 47, name: "Muhammad", englishName: "Muhammad", englishNameTranslation: "Muhammad", revelationType: "Medinan", numberOfAyahs: 38 },
    { number: 48, name: "Al-Fath", englishName: "The Victory", englishNameTranslation: "The Victory", revelationType: "Medinan", numberOfAyahs: 29 },
    { number: 49, name: "Al-Hujurat", englishName: "The Rooms", englishNameTranslation: "The Rooms", revelationType: "Medinan", numberOfAyahs: 18 },
    { number: 50, name: "Qaf", englishName: "The Letter Qaf", englishNameTranslation: "The Letter Qaf", revelationType: "Meccan", numberOfAyahs: 45 },
    { number: 51, name: "Adh-Dhariyat", englishName: "The Winnowing Winds", englishNameTranslation: "The Winnowing Winds", revelationType: "Meccan", numberOfAyahs: 60 },
    { number: 52, name: "At-Tur", englishName: "The Mount", englishNameTranslation: "The Mount", revelationType: "Meccan", numberOfAyahs: 49 },
    { number: 53, name: "An-Najm", englishName: "The Star", englishNameTranslation: "The Star", revelationType: "Meccan", numberOfAyahs: 62 },
    { number: 54, name: "Al-Qamar", englishName: "The Moon", englishNameTranslation: "The Moon", revelationType: "Meccan", numberOfAyahs: 55 },
    { number: 55, name: "Ar-Rahman", englishName: "The Beneficent", englishNameTranslation: "The Beneficent", revelationType: "Medinan", numberOfAyahs: 78 },
    { number: 56, name: "Al-Waqi'ah", englishName: "The Event", englishNameTranslation: "The Event", revelationType: "Meccan", numberOfAyahs: 96 },
    { number: 57, name: "Al-Hadid", englishName: "The Iron", englishNameTranslation: "The Iron", revelationType: "Medinan", numberOfAyahs: 29 },
    { number: 58, name: "Al-Mujadila", englishName: "The Pleading Woman", englishNameTranslation: "The Pleading Woman", revelationType: "Medinan", numberOfAyahs: 22 },
    { number: 59, name: "Al-Hashr", englishName: "The Exile", englishNameTranslation: "The Exile", revelationType: "Medinan", numberOfAyahs: 24 },
    { number: 60, name: "Al-Mumtahanah", englishName: "She that is to be examined", englishNameTranslation: "She that is to be examined", revelationType: "Medinan", numberOfAyahs: 13 },
    { number: 61, name: "As-Saf", englishName: "The Ranks", englishNameTranslation: "The Ranks", revelationType: "Medinan", numberOfAyahs: 14 },
    { number: 62, name: "Al-Jumu'ah", englishName: "The Congregation", englishNameTranslation: "Friday", revelationType: "Medinan", numberOfAyahs: 11 },
    { number: 63, name: "Al-Munafiqun", englishName: "The Hypocrites", englishNameTranslation: "The Hypocrites", revelationType: "Medinan", numberOfAyahs: 11 },
    { number: 64, name: "At-Taghabun", englishName: "The Mutual Disillusion", englishNameTranslation: "The Mutual Disillusion", revelationType: "Medinan", numberOfAyahs: 18 },
    { number: 65, name: "At-Talaq", englishName: "The Divorce", englishNameTranslation: "The Divorce", revelationType: "Medinan", numberOfAyahs: 12 },
    { number: 66, name: "At-Tahrim", englishName: "The Prohibition", englishNameTranslation: "The Prohibition", revelationType: "Medinan", numberOfAyahs: 12 },
    { number: 67, name: "Al-Mulk", englishName: "The Sovereignty", englishNameTranslation: "The Sovereignty", revelationType: "Meccan", numberOfAyahs: 30 },
    { number: 68, name: "Al-Qalam", englishName: "The Pen", englishNameTranslation: "The Pen", revelationType: "Meccan", numberOfAyahs: 52 },
    { number: 69, name: "Al-Haqqah", englishName: "The Reality", englishNameTranslation: "The Reality", revelationType: "Meccan", numberOfAyahs: 52 },
    { number: 70, name: "Al-Ma'arij", englishName: "The Ascending Stairways", englishNameTranslation: "The Ascending Stairways", revelationType: "Meccan", numberOfAyahs: 44 },
    { number: 71, name: "Nuh", englishName: "Noah", englishNameTranslation: "Noah", revelationType: "Meccan", numberOfAyahs: 28 },
    { number: 72, name: "Al-Jinn", englishName: "The Jinn", englishNameTranslation: "The Jinn", revelationType: "Meccan", numberOfAyahs: 28 },
    { number: 73, name: "Al-Muzzammil", englishName: "The Enshrouded One", englishNameTranslation: "The Enshrouded One", revelationType: "Meccan", numberOfAyahs: 20 },
    { number: 74, name: "Al-Muddaththir", englishName: "The Cloaked One", englishNameTranslation: "The Cloaked One", revelationType: "Meccan", numberOfAyahs: 56 },
    { number: 75, name: "Al-Qiyamah", englishName: "The Resurrection", englishNameTranslation: "The Resurrection", revelationType: "Meccan", numberOfAyahs: 40 },
    { number: 76, name: "Al-Insan", englishName: "The Man", englishNameTranslation: "The Man", revelationType: "Medinan", numberOfAyahs: 31 },
    { number: 77, name: "Al-Mursalat", englishName: "The Emissaries", englishNameTranslation: "The Emissaries", revelationType: "Meccan", numberOfAyahs: 50 },
    { number: 78, name: "An-Naba", englishName: "The Tidings", englishNameTranslation: "The Tidings", revelationType: "Meccan", numberOfAyahs: 40 },
    { number: 79, name: "An-Nazi'at", englishName: "Those who drag forth", englishNameTranslation: "Those who drag forth", revelationType: "Meccan", numberOfAyahs: 46 },
    { number: 80, name: "Abasa", englishName: "He Frowned", englishNameTranslation: "He Frowned", revelationType: "Meccan", numberOfAyahs: 42 },
    { number: 81, name: "At-Takwir", englishName: "The Overthrowing", englishNameTranslation: "The Overthrowing", revelationType: "Meccan", numberOfAyahs: 29 },
    { number: 82, name: "Al-Infitar", englishName: "The Cleaving", englishNameTranslation: "The Cleaving", revelationType: "Meccan", numberOfAyahs: 19 },
    { number: 83, name: "Al-Mutaffifin", englishName: "The Defrauding", englishNameTranslation: "The Defrauding", revelationType: "Meccan", numberOfAyahs: 36 },
    { number: 84, name: "Al-Inshiqaq", englishName: "The Splitting Open", englishNameTranslation: "The Splitting Open", revelationType: "Meccan", numberOfAyahs: 25 },
    { number: 85, name: "Al-Buruj", englishName: "The Constellations", englishNameTranslation: "The Constellations", revelationType: "Meccan", numberOfAyahs: 22 },
    { number: 86, name: "At-Tariq", englishName: "The Morning Star", englishNameTranslation: "The Morning Star", revelationType: "Meccan", numberOfAyahs: 17 },
    { number: 87, name: "Al-A'la", englishName: "The Most High", englishNameTranslation: "The Most High", revelationType: "Meccan", numberOfAyahs: 19 },
    { number: 88, name: "Al-Ghashiyah", englishName: "The Overwhelming", englishNameTranslation: "The Overwhelming", revelationType: "Meccan", numberOfAyahs: 26 },
    { number: 89, name: "Al-Fajr", englishName: "The Dawn", englishNameTranslation: "The Dawn", revelationType: "Meccan", numberOfAyahs: 30 },
    { number: 90, name: "Al-Balad", englishName: "The City", englishNameTranslation: "The City", revelationType: "Meccan", numberOfAyahs: 20 },
    { number: 91, name: "Ash-Shams", englishName: "The Sun", englishNameTranslation: "The Sun", revelationType: "Meccan", numberOfAyahs: 15 },
    { number: 92, name: "Al-Layl", englishName: "The Night", englishNameTranslation: "The Night", revelationType: "Meccan", numberOfAyahs: 21 },
    { number: 93, name: "Ad-Dhuhaa", englishName: "The Morning Hours", englishNameTranslation: "The Morning Hours", revelationType: "Meccan", numberOfAyahs: 11 },
    { number: 94, name: "Ash-Sharh", englishName: "The Relief", englishNameTranslation: "The Relief", revelationType: "Meccan", numberOfAyahs: 8 },
    { number: 95, name: "At-Tin", englishName: "The Fig", englishNameTranslation: "The Fig", revelationType: "Meccan", numberOfAyahs: 8 },
    { number: 96, name: "Al-'Alaq", englishName: "The Clot", englishNameTranslation: "The Clot", revelationType: "Meccan", numberOfAyahs: 19 },
    { number: 97, name: "Al-Qadr", englishName: "The Power", englishNameTranslation: "The Power", revelationType: "Meccan", numberOfAyahs: 5 },
    { number: 98, name: "Al-Bayyinah", englishName: "The Clear Proof", englishNameTranslation: "The Clear Proof", revelationType: "Medinan", numberOfAyahs: 8 },
    { number: 99, name: "Az-Zalzalah", englishName: "The Earthquake", englishNameTranslation: "The Earthquake", revelationType: "Medinan", numberOfAyahs: 8 },
    { number: 100, name: "Al-'Adiyat", englishName: "The Courser", englishNameTranslation: "The Courser", revelationType: "Meccan", numberOfAyahs: 11 },
    { number: 101, name: "Al-Qari'ah", englishName: "The Calamity", englishNameTranslation: "The Calamity", revelationType: "Meccan", numberOfAyahs: 11 },
    { number: 102, name: "At-Takathur", englishName: "The Rivalry in world increase", englishNameTranslation: "The Rivalry in world increase", revelationType: "Meccan", numberOfAyahs: 8 },
    { number: 103, name: "Al-'Asr", englishName: "The Declining Day", englishNameTranslation: "The Declining Day", revelationType: "Meccan", numberOfAyahs: 3 },
    { number: 104, name: "Al-Humazah", englishName: "The Traducer", englishNameTranslation: "The Traducer", revelationType: "Meccan", numberOfAyahs: 9 },
    { number: 105, name: "Al-Fil", englishName: "The Elephant", englishNameTranslation: "The Elephant", revelationType: "Meccan", numberOfAyahs: 5 },
    { number: 106, name: "Quraysh", englishName: "Quraysh", englishNameTranslation: "Quraysh", revelationType: "Meccan", numberOfAyahs: 4 },
    { number: 107, name: "Al-Ma'un", englishName: "The Small Kindnesses", englishNameTranslation: "The Small Kindnesses", revelationType: "Meccan", numberOfAyahs: 7 },
    { number: 108, name: "Al-Kawthar", englishName: "The Abundance", englishNameTranslation: "The Abundance", revelationType: "Meccan", numberOfAyahs: 3 },
    { number: 109, name: "Al-Kafirun", englishName: "The Disbelievers", englishNameTranslation: "The Disbelievers", revelationType: "Meccan", numberOfAyahs: 6 },
    { number: 110, name: "An-Nasr", englishName: "The Divine Support", englishNameTranslation: "The Divine Support", revelationType: "Medinan", numberOfAyahs: 3 },
    { number: 111, name: "Al-Masad", englishName: "The Palm Fiber", englishNameTranslation: "The Palm Fiber", revelationType: "Meccan", numberOfAyahs: 5 },
    { number: 112, name: "Al-Ikhlas", englishName: "The Sincerity", englishNameTranslation: "The Sincerity", revelationType: "Meccan", numberOfAyahs: 4 },
    { number: 113, name: "Al-Falaq", englishName: "The Daybreak", englishNameTranslation: "The Daybreak", revelationType: "Meccan", numberOfAyahs: 5 },
    { number: 114, name: "An-Nas", englishName: "The Mankind", englishNameTranslation: "The Mankind", revelationType: "Meccan", numberOfAyahs: 6 },
  ];

  /**
   * Get all surahs
   */
  static getSurahList(): Surah[] {
    return this.SURAH_LIST;
  }

  /**
   * Get surah by number
   */
  static getSurahByNumber(number: number): Surah | undefined {
    return this.SURAH_LIST.find(s => s.number === number);
  }

  /**
   * Fetch verses for a specific surah
   */
  static async getSurahVerses(surahNumber: number): Promise<Ayah[]> {
    try {
      // Check cache first
      const cacheKey = `${CACHE_KEY_PREFIX}surah_${surahNumber}`;
      const cached = await this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch Arabic and English translation
      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`)
      ]);

      if (arabicResponse.data?.data && englishResponse.data?.data) {
        const arabicData = arabicResponse.data.data;
        const englishData = englishResponse.data.data;

        const verses: Ayah[] = arabicData.ayahs.map((arabicAyah: any, index: number) => {
          const englishAyah = englishData.ayahs[index];
          return {
            number: arabicAyah.number,
            numberInSurah: arabicAyah.numberInSurah,
            text: arabicAyah.text,
            translation: englishAyah.text,
            audio: arabicAyah.audio,
            page: arabicAyah.page,
            juz: arabicAyah.juz,
          };
        });

        // Cache the data
        await this.cacheData(cacheKey, verses);
        return verses;
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
  static async searchVerses(keyword: string, language: 'ar' | 'en' = 'en'): Promise<Ayah[]> {
    try {
      const edition = language === 'ar' ? 'ar.alafasy' : 'en.asad';
      const response = await axios.get(
        `https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/all/${edition}`
      );

      if (response.data?.data?.matches) {
        const matches = response.data.data.matches;

        // Limit to first 50 results
        return matches.slice(0, 50).map((match: any) => ({
          number: match.number,
          numberInSurah: match.numberInSurah,
          text: match.text,
          translation: language === 'en' ? match.text : undefined,
          surah: {
            number: match.surah.number,
            name: match.surah.name,
            englishName: match.surah.englishName,
          },
        }));
      }

      return [];
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  /**
   * Get today's verse (Ayah of the Day)
   */
  static async getDailyVerse(): Promise<Ayah> {
    try {
      // Use day of year to get a consistent daily verse
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const verseNumber = (dayOfYear % 6236) + 1; // Total verses in Quran

      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`https://api.alquran.cloud/v1/ayah/${verseNumber}/ar.alafasy`),
        axios.get(`https://api.alquran.cloud/v1/ayah/${verseNumber}/en.asad`)
      ]);

      if (arabicResponse.data?.data && englishResponse.data?.data) {
        const arabicData = arabicResponse.data.data;
        const englishData = englishResponse.data.data;

        return {
          number: arabicData.number,
          numberInSurah: arabicData.numberInSurah,
          text: arabicData.text,
          translation: englishData.text,
          audio: arabicData.audio,
          surah: {
            number: englishData.surah.number,
            name: englishData.surah.name,
            englishName: englishData.surah.englishName,
          },
        };
      }

      throw new Error('Failed to fetch daily verse');
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      throw error;
    }
  }

  /**
   * Save last read position
   */
  static async saveLastRead(surahNumber: number, ayahNumber: number, surahName: string): Promise<void> {
    try {
      const lastRead: LastRead = {
        surahNumber,
        ayahNumber,
        surahName,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(lastRead));
    } catch (error) {
      console.error('Error saving last read:', error);
    }
  }

  /**
   * Get last read position
   */
  static async getLastRead(): Promise<LastRead | null> {
    try {
      const data = await AsyncStorage.getItem(LAST_READ_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting last read:', error);
      return null;
    }
  }

  /**
   * Add bookmark
   */
  static async addBookmark(bookmark: Omit<Bookmark, 'timestamp'>): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const newBookmark: Bookmark = {
        ...bookmark,
        timestamp: Date.now(),
      };

      // Check if already bookmarked
      const exists = bookmarks.some(
        b => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber
      );

      if (!exists) {
        bookmarks.push(newBookmark);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  }

  /**
   * Remove bookmark
   */
  static async removeBookmark(surahNumber: number, ayahNumber: number): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filtered = bookmarks.filter(
        b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
      );
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  }

  /**
   * Get all bookmarks
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  /**
   * Check if verse is bookmarked
   */
  static async isBookmarked(surahNumber: number, ayahNumber: number): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.some(
      b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  }

  /**
   * Cache data
   */
  private static async cacheData(key: string, data: any): Promise<void> {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  private static async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const cacheItem = JSON.parse(cached);
        const age = Date.now() - cacheItem.timestamp;

        if (age < CACHE_DURATION) {
          return cacheItem.data;
        }
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }
    return null;
  }

  /**
   * Clear all cache
   */
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}