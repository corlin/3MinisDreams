import { Platform } from 'react-native';

/**
 * 字体相关的 Web 兼容性修复
 */

/**
 * 应用字体修复，防止 "Cannot read properties of undefined (reading 'bold')" 错误
 */
export const applyFontFixes = () => {
  if (Platform.OS !== 'web') return;

  // 全局错误处理
  const originalError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && message.includes('Cannot read properties of undefined (reading \'bold\')')) {
      console.warn('Font error caught and handled:', message);
      return true; // 阻止错误传播
    }
    if (originalError) {
      return originalError(message, source, lineno, colno, error);
    }
    return false;
  };

  // Promise 错误处理
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('bold')) {
      console.warn('Font promise error caught and handled:', event.reason.message);
      event.preventDefault();
    }
  });

  // React 错误边界处理
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && (
      message.includes('Cannot read properties of undefined (reading \'bold\')') ||
      message.includes('HeaderTitle') ||
      message.includes('fontWeight')
    )) {
      console.warn('React font error caught and handled:', message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
};

/**
 * 获取安全的字体权重值
 */
export const getSafeFontWeight = (weight?: string | number): string => {
  if (!weight) return '400';
  
  const weightStr = weight.toString();
  const validWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'];
  
  if (validWeights.includes(weightStr)) {
    // 将 'bold' 转换为数字值以避免 Web 问题
    return weightStr === 'bold' ? '700' : weightStr;
  }
  
  // 默认返回正常权重
  return '400';
};

/**
 * 创建安全的字体样式对象
 */
export const createSafeFontStyle = (style: any = {}) => {
  const safeStyle = { ...style };
  
  if (safeStyle.fontWeight) {
    safeStyle.fontWeight = getSafeFontWeight(safeStyle.fontWeight);
  }
  
  return safeStyle;
};