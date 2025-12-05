import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_STORAGE_KEY = '@islamic_app_statistics';
const DAILY_STATS_KEY = '@islamic_app_daily_stats';

interface DailyStats {
  date: string;
  prayersCompleted: string[];
  dhikrCount: number;
  quranPagesRead: number;
  tasbihCount: number;
}

interface OverallStats {
  totalPrayers: number;
  totalDhikr: number;
  totalQuranPages: number;
  totalTasbih: number;
  streak: number;
  longestStreak: number;
  startDate: string;
  lastUpdated: string;
}

export class StatisticsService {
  /**
   * Initialize statistics if not exists
   */
  static async initializeStats(): Promise<void> {
    try {
      const stats = await this.getOverallStats();
      if (!stats) {
        const initialStats: OverallStats = {
          totalPrayers: 0,
          totalDhikr: 0,
          totalQuranPages: 0,
          totalTasbih: 0,
          streak: 0,
          longestStreak: 0,
          startDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(initialStats));
      }

      // Initialize today's stats if not exists
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today);
      if (!dailyStats) {
        const initialDailyStats: DailyStats = {
          date: today,
          prayersCompleted: [],
          dhikrCount: 0,
          quranPagesRead: 0,
          tasbihCount: 0,
        };
        await this.saveDailyStats(initialDailyStats);
      }
    } catch (error) {
      console.error('Error initializing statistics:', error);
    }
  }

  /**
   * Mark a prayer as completed
   */
  static async markPrayerCompleted(prayerName: string): Promise<void> {
    try {
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today) || {
        date: today,
        prayersCompleted: [],
        dhikrCount: 0,
        quranPagesRead: 0,
        tasbihCount: 0,
      };

      // Add prayer if not already marked
      if (!dailyStats.prayersCompleted.includes(prayerName)) {
        dailyStats.prayersCompleted.push(prayerName);
        await this.saveDailyStats(dailyStats);

        // Update overall stats
        const overallStats = await this.getOverallStats();
        if (overallStats) {
          overallStats.totalPrayers++;
          overallStats.lastUpdated = new Date().toISOString();
          await this.saveOverallStats(overallStats);
        }
      }
    } catch (error) {
      console.error('Error marking prayer completed:', error);
    }
  }

  /**
   * Increment dhikr count
   */
  static async incrementDhikr(count: number = 1): Promise<void> {
    try {
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today) || {
        date: today,
        prayersCompleted: [],
        dhikrCount: 0,
        quranPagesRead: 0,
        tasbihCount: 0,
      };

      dailyStats.dhikrCount += count;
      await this.saveDailyStats(dailyStats);

      // Update overall stats
      const overallStats = await this.getOverallStats();
      if (overallStats) {
        overallStats.totalDhikr += count;
        overallStats.lastUpdated = new Date().toISOString();
        await this.saveOverallStats(overallStats);
      }
    } catch (error) {
      console.error('Error incrementing dhikr:', error);
    }
  }

  /**
   * Increment Tasbih count
   */
  static async incrementTasbih(count: number = 1): Promise<void> {
    try {
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today) || {
        date: today,
        prayersCompleted: [],
        dhikrCount: 0,
        quranPagesRead: 0,
        tasbihCount: 0,
      };

      dailyStats.tasbihCount += count;
      dailyStats.dhikrCount += count; // Also count as dhikr
      await this.saveDailyStats(dailyStats);

      // Update overall stats
      const overallStats = await this.getOverallStats();
      if (overallStats) {
        overallStats.totalTasbih += count;
        overallStats.totalDhikr += count;
        overallStats.lastUpdated = new Date().toISOString();
        await this.saveOverallStats(overallStats);
      }
    } catch (error) {
      console.error('Error incrementing tasbih:', error);
    }
  }

  /**
   * Add Quran pages read
   */
  static async addQuranPages(pages: number): Promise<void> {
    try {
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today) || {
        date: today,
        prayersCompleted: [],
        dhikrCount: 0,
        quranPagesRead: 0,
        tasbihCount: 0,
      };

      dailyStats.quranPagesRead += pages;
      await this.saveDailyStats(dailyStats);

      // Update overall stats
      const overallStats = await this.getOverallStats();
      if (overallStats) {
        overallStats.totalQuranPages += pages;
        overallStats.lastUpdated = new Date().toISOString();
        await this.saveOverallStats(overallStats);
      }
    } catch (error) {
      console.error('Error adding Quran pages:', error);
    }
  }

  /**
   * Get today's statistics
   */
  static async getTodayStats(): Promise<DailyStats | null> {
    const today = new Date().toDateString();
    return await this.getDailyStats(today);
  }

  /**
   * Get daily statistics for a specific date
   */
  static async getDailyStats(date: string): Promise<DailyStats | null> {
    try {
      const key = `${DAILY_STATS_KEY}_${date}`;
      const stats = await AsyncStorage.getItem(key);
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return null;
    }
  }

  /**
   * Save daily statistics
   */
  private static async saveDailyStats(stats: DailyStats): Promise<void> {
    try {
      const key = `${DAILY_STATS_KEY}_${stats.date}`;
      await AsyncStorage.setItem(key, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving daily stats:', error);
    }
  }

  /**
   * Get overall statistics
   */
  static async getOverallStats(): Promise<OverallStats | null> {
    try {
      const stats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      return stats ? JSON.parse(stats) : null;
    } catch (error) {
      console.error('Error getting overall stats:', error);
      return null;
    }
  }

  /**
   * Save overall statistics
   */
  private static async saveOverallStats(stats: OverallStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving overall stats:', error);
    }
  }

  /**
   * Record app open for today
   */
  static async recordAppOpen(): Promise<void> {
    try {
      const today = new Date().toDateString();
      const dailyStats = await this.getDailyStats(today) || {
        date: today,
        prayersCompleted: [],
        dhikrCount: 0,
        quranPagesRead: 0,
        tasbihCount: 0,
      };

      // Save today's stats to mark app was opened
      await this.saveDailyStats(dailyStats);
    } catch (error) {
      console.error('Error recording app open:', error);
    }
  }

  /**
   * Calculate and update streak based on consecutive days app was opened
   */
  static async updateStreak(): Promise<number> {
    try {
      const overallStats = await this.getOverallStats();
      if (!overallStats) return 0;

      let streak = 0;
      const today = new Date();
      const checkDate = new Date(today);

      // Check backwards to find streak
      while (true) {
        const dateStr = checkDate.toDateString();
        const dailyStats = await this.getDailyStats(dateStr);

        // Check if user opened the app this day (daily stats exist)
        if (dailyStats) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }

        // Safety check to prevent infinite loop
        if (streak > 365) break;
      }

      // Update overall stats
      overallStats.streak = streak;
      if (streak > overallStats.longestStreak) {
        overallStats.longestStreak = streak;
      }
      await this.saveOverallStats(overallStats);

      return streak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return 0;
    }
  }

  /**
   * Get statistics summary for display
   */
  static async getStatsSummary(): Promise<{
    today: DailyStats | null;
    overall: OverallStats | null;
    streak: number;
  }> {
    const today = await this.getTodayStats();
    const overall = await this.getOverallStats();
    const streak = await this.updateStreak();

    return {
      today,
      overall,
      streak,
    };
  }

  /**
   * Reset all statistics
   */
  static async resetStats(): Promise<void> {
    try {
      // Clear overall stats
      await AsyncStorage.removeItem(STATS_STORAGE_KEY);

      // Clear all daily stats (last 365 days)
      const keys = await AsyncStorage.getAllKeys();
      const dailyKeys = keys.filter(key => key.startsWith(DAILY_STATS_KEY));
      await AsyncStorage.multiRemove(dailyKeys);

      // Re-initialize
      await this.initializeStats();
    } catch (error) {
      console.error('Error resetting stats:', error);
    }
  }

  /**
   * Export statistics as JSON
   */
  static async exportStats(): Promise<string> {
    try {
      const overall = await this.getOverallStats();
      const keys = await AsyncStorage.getAllKeys();
      const dailyKeys = keys.filter(key => key.startsWith(DAILY_STATS_KEY));
      const dailyStats: DailyStats[] = [];

      for (const key of dailyKeys) {
        const stat = await AsyncStorage.getItem(key);
        if (stat) {
          dailyStats.push(JSON.parse(stat));
        }
      }

      return JSON.stringify({
        overall,
        daily: dailyStats,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Error exporting stats:', error);
      return '{}';
    }
  }
}