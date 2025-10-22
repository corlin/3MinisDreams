// 应用常量
import { AppTheme } from '../types';

export const LIGHT_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#10b981',
};

export const DARK_COLORS = {
  primary: '#818cf8',
  secondary: '#a78bfa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  error: '#f87171',
  success: '#34d399',
};

export const getColors = (theme: AppTheme) => {
  return theme === 'light' ? LIGHT_COLORS : DARK_COLORS;
};

// Default colors for backward compatibility
export const COLORS = LIGHT_COLORS;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};

export const FONT_WEIGHTS = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};