import { Platform } from 'react-native';

/**
 * Web 端兼容性修复工具
 */

// 保存原始的 console 方法
let originalWarn: typeof console.warn;
let originalError: typeof console.error;

/**
 * 修复 React Native Web 中的 pointerEvents 警告
 * 这个函数可以在应用启动时调用来应用全局修复
 */
export const applyWebFixes = () => {
  if (Platform.OS !== 'web') return;

  // 保存原始方法
  originalWarn = console.warn;
  originalError = console.error;

  // 修复 pointerEvents 警告
  // 这个修复会拦截 React Native Web 的警告并静默处理
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // 静默处理已知的 Web 兼容性警告
      if (
        message.includes('props.pointerEvents is deprecated') ||
        message.includes('Use style.pointerEvents') ||
        (message.includes('pointerEvents') && message.includes('deprecated')) ||
        (message.includes('pointerEvents was given a value of auto') && message.includes('headerStyle')) ||
        message.includes('this has no effect on headerStyle')
      ) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };

  // 修复 useNativeDriver 和其他动画相关警告
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // 静默处理已知的动画相关警告
      if (
        message.includes('useNativeDriver') ||
        message.includes('native animated module is missing') ||
        message.includes('Falling back to JS-based animation')
      ) {
        return;
      }
    }
    originalError.apply(console, args);
  };

  // 应用 DOM 级别的修复
  applyDOMFixes();
};

/**
 * 应用 DOM 级别的修复
 */
const applyDOMFixes = () => {
  // 修复 React Native Web 在创建 DOM 元素时的 pointerEvents 处理
  if (typeof document !== 'undefined') {
    // 监听 DOM 变化，自动修复 pointerEvents 属性
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // 检查是否有 pointerEvents 属性需要修复
              if (element.hasAttribute && element.hasAttribute('pointerEvents')) {
                const pointerEvents = element.getAttribute('pointerEvents');
                element.removeAttribute('pointerEvents');
                if (element instanceof HTMLElement) {
                  element.style.pointerEvents = pointerEvents || 'auto';
                }
              }
            }
          });
        }
      });
    });

    // 开始观察 DOM 变化
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
};

/**
 * 恢复原始的 console 方法
 */
export const restoreConsoleMethods = () => {
  if (Platform.OS !== 'web') return;
  
  if (originalWarn) {
    console.warn = originalWarn;
  }
  if (originalError) {
    console.error = originalError;
  }
};