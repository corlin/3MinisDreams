import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppTheme } from '../types';
import { UserService } from '../services/userService';

interface ThemeContextType {
  theme: AppTheme;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const currentTheme = await UserService.getCurrentTheme();
      setThemeState(currentTheme);
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: AppTheme) => {
    try {
      await UserService.updateTheme(newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}