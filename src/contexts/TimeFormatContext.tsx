/**
 * Time Format Context
 * Manages 12/24 hour time format preference across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimeFormatContextType {
  use24HourFormat: boolean;
  setUse24HourFormat: (value: boolean) => void;
  formatTime: (time: string) => string;
}

const TimeFormatContext = createContext<TimeFormatContextType | undefined>(undefined);

export const useTimeFormat = (): TimeFormatContextType => {
  const context = useContext(TimeFormatContext);
  if (!context) {
    throw new Error('useTimeFormat must be used within a TimeFormatProvider');
  }
  return context;
};

interface TimeFormatProviderProps {
  children: ReactNode;
}

export const TimeFormatProvider: React.FC<TimeFormatProviderProps> = ({ children }) => {
  const [use24HourFormat, setUse24HourFormatState] = useState(true);

  useEffect(() => {
    // Load saved preference on mount
    loadTimeFormatPreference();
  }, []);

  const loadTimeFormatPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('use24HourFormat');
      if (saved !== null) {
        setUse24HourFormatState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading time format preference:', error);
    }
  };

  const setUse24HourFormat = async (value: boolean) => {
    try {
      setUse24HourFormatState(value);
      await AsyncStorage.setItem('use24HourFormat', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving time format preference:', error);
    }
  };

  const formatTime = (time: string): string => {
    if (!time) return '';

    // Handle various input formats
    let hours: number;
    let minutes: number;

    // Check if time is already formatted (e.g., "2:30 PM" or "14:30")
    const ampmMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (ampmMatch) {
      hours = parseInt(ampmMatch[1]);
      minutes = parseInt(ampmMatch[2]);
      const period = ampmMatch[3].toUpperCase();

      // Convert to 24-hour for processing
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      // Assume 24-hour format input (e.g., "14:30" or "2:30")
      const parts = time.split(':');
      hours = parseInt(parts[0]);
      minutes = parseInt(parts[1] || '0');
    }

    // Format based on preference
    if (use24HourFormat) {
      // 24-hour format
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // 12-hour format
      let displayHours = hours;
      let period = 'AM';

      if (hours === 0) {
        displayHours = 12;
      } else if (hours === 12) {
        period = 'PM';
      } else if (hours > 12) {
        displayHours = hours - 12;
        period = 'PM';
      }

      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  };

  return (
    <TimeFormatContext.Provider value={{ use24HourFormat, setUse24HourFormat, formatTime }}>
      {children}
    </TimeFormatContext.Provider>
  );
};