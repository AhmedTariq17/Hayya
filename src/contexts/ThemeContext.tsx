import React, {createContext, useContext, useState, ReactNode} from 'react';
import {colors, darkColors} from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: typeof colors;
  isDark: boolean;
  isDarkMode: boolean; // Alias for compatibility
  toggleTheme: () => void;
  toggleDarkMode: () => void; // Alias for compatibility
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const theme = isDark ? darkColors : colors;

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      isDarkMode: isDark, // Alias for compatibility
      toggleTheme,
      toggleDarkMode: toggleTheme // Alias for compatibility
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
