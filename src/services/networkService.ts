/**
 * Network Service
 * Monitors network connectivity and provides offline support
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NetworkService {
  private static instance: NetworkService;
  private isConnected: boolean = true;
  private connectionType: string = 'unknown';
  private listeners: Set<(isConnected: boolean) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private async initialize() {
    // Subscribe to network state updates
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      this.handleConnectivityChange(state);
    });

    // Get initial state
    const state = await NetInfo.fetch();
    this.handleConnectivityChange(state);
  }

  private handleConnectivityChange(state: NetInfoState) {
    const wasConnected = this.isConnected;
    this.isConnected = state.isConnected ?? false;
    this.connectionType = state.type;

    // Notify listeners if connection status changed
    if (wasConnected !== this.isConnected) {
      this.notifyListeners();

      // Log connection status
      if (this.isConnected) {
        console.log('Network connected:', this.connectionType);
      } else {
        console.log('Network disconnected');
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.isConnected);
    });
  }

  /**
   * Subscribe to connectivity changes
   */
  public subscribe(listener: (isConnected: boolean) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if network is connected
   */
  public isNetworkConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current connection type
   */
  public getConnectionType(): string {
    return this.connectionType;
  }

  /**
   * Check if connection is WiFi
   */
  public isWiFi(): boolean {
    return this.connectionType === 'wifi';
  }

  /**
   * Check if connection is cellular
   */
  public isCellular(): boolean {
    return this.connectionType === 'cellular';
  }

  /**
   * Fetch data with offline fallback
   */
  public async fetchWithFallback<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: {
      cacheTime?: number; // Cache duration in milliseconds
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const cacheTime = options?.cacheTime || 3600000; // Default 1 hour
    const forceRefresh = options?.forceRefresh || false;

    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = await this.getCachedData<T>(key);
        if (cached && this.isCacheValid(cached, cacheTime)) {
          console.log(`Using cached data for ${key}`);
          return cached.data;
        }
      }

      // If connected, fetch fresh data
      if (this.isConnected) {
        const data = await fetchFunction();
        await this.cacheData(key, data);
        return data;
      } else {
        // If offline, try to use cached data even if expired
        const cached = await this.getCachedData<T>(key);
        if (cached) {
          console.warn(`Using expired cache for ${key} due to offline status`);
          return cached.data;
        }
        throw new Error('No network connection and no cached data available');
      }
    } catch (error) {
      // On error, try to use cached data as fallback
      const cached = await this.getCachedData<T>(key);
      if (cached) {
        console.warn(`Using cached data for ${key} due to error:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Cache data with timestamp
   */
  private async cacheData<T>(key: string, data: T): Promise<void> {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(`@network_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData<T>(key: string): Promise<{ data: T; timestamp: number } | null> {
    try {
      const cached = await AsyncStorage.getItem(`@network_cache_${key}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to get cached data:', error);
    }
    return null;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cached: { timestamp: number }, maxAge: number): boolean {
    return Date.now() - cached.timestamp < maxAge;
  }

  /**
   * Clear all cached data
   */
  public async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('@network_cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('Network cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }
}

export default NetworkService.getInstance();