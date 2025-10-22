import { Platform } from 'react-native';

/**
 * 简单的 Web 兼容性修复
 * 只处理最基本的警告，不会影响应用的正常运行
 */

/**
 * 应用简单的 Web 修复
 */
export const applySimpleWebFixes = () => {
  if (Platform.OS !== 'web') return;

  // 只修复控制台警告，不修改任何内部行为
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // 只静默处理已知的无害警告
      if (
        message.includes('props.pointerEvents is deprecated') ||
        message.includes('Use style.pointerEvents')
      ) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };

  // 修复动画警告
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      if (
        message.includes('useNativeDriver') ||
        message.includes('native animated module is missing')
      ) {
        return;
      }
    }
    originalError.apply(console, args);
  };
};