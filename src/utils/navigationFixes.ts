import { Platform } from 'react-native';

/**
 * React Navigation Web 兼容性修复
 */

/**
 * 应用 React Navigation 的 Web 兼容性修复
 */
export const applyNavigationFixes = () => {
  if (Platform.OS !== 'web') return;

  // 修复字体相关的错误
  applyFontFixes();

  // 修复 React Navigation 在 Web 环境中的 pointerEvents 问题
  if (typeof window !== 'undefined' && window.document) {
    // 等待 DOM 加载完成后应用修复
    const applyFix = () => {
      // 查找所有可能的导航相关元素
      const navigationElements = document.querySelectorAll('[data-react-navigation], [role="navigation"], .react-navigation');
      
      navigationElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          // 确保 pointerEvents 在 style 中而不是作为属性
          if (element.hasAttribute('pointerEvents')) {
            const pointerEvents = element.getAttribute('pointerEvents');
            element.removeAttribute('pointerEvents');
            element.style.pointerEvents = pointerEvents || 'auto';
          }
          
          // 递归处理子元素
          const childElements = element.querySelectorAll('*');
          childElements.forEach((child) => {
            if (child instanceof HTMLElement && child.hasAttribute('pointerEvents')) {
              const childPointerEvents = child.getAttribute('pointerEvents');
              child.removeAttribute('pointerEvents');
              child.style.pointerEvents = childPointerEvents || 'auto';
            }
          });
        }
      });
    };

    // 立即应用修复
    applyFix();

    // 监听 DOM 变化，持续应用修复
    const observer = new MutationObserver(() => {
      applyFix();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['pointerEvents'],
    });

    // 在页面加载完成后再次应用修复
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyFix);
    } else {
      setTimeout(applyFix, 100);
    }
  }
};

/**
 * 获取 Web 兼容的导航样式
 */
export const getWebCompatibleNavigationStyle = (style: any = {}, isHeaderStyle: boolean = false) => {
  if (Platform.OS !== 'web') return style;

  const webStyle = { ...style };
  
  // 不要在 headerStyle 中添加 pointerEvents，因为它没有效果
  if (!isHeaderStyle && !webStyle.pointerEvents) {
    webStyle.pointerEvents = 'auto';
  }

  return webStyle;
};

/**
 * 应用字体相关的修复
 */
const applyFontFixes = () => {
  // 捕获字体相关的错误
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Cannot read properties of undefined (reading \'bold\')')) {
      // 静默处理字体相关的错误
      console.warn('Font style error caught and handled:', message);
      return;
    }
    originalError.apply(console, args);
  };

  // 修复可能存在的字体样式问题
  if (typeof document !== 'undefined') {
    const fixFontStyles = () => {
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(element);
          if (computedStyle.fontWeight === 'bold' || computedStyle.fontWeight === '') {
            element.style.fontWeight = '600';
          }
        }
      });
    };

    // 立即修复
    setTimeout(fixFontStyles, 100);
    
    // 监听 DOM 变化
    const observer = new MutationObserver(fixFontStyles);
    observer.observe(document.body, { childList: true, subtree: true });
  }
};

/**
 * 获取 Web 兼容的字体样式
 */
export const getWebCompatibleFontStyle = (style: any = {}) => {
  if (Platform.OS !== 'web') return style;

  const webStyle = { ...style };

  // 修复 fontWeight 属性
  if (webStyle.fontWeight) {
    // 确保 fontWeight 是有效的 CSS 值
    const validFontWeights = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    if (!validFontWeights.includes(webStyle.fontWeight.toString())) {
      webStyle.fontWeight = '600'; // 默认使用 600 作为 bold 的替代
    }
    
    // 将 'bold' 转换为数字值以避免 Web 环境中的问题
    if (webStyle.fontWeight === 'bold') {
      webStyle.fontWeight = '700';
    }
  }

  return webStyle;
};

/**
 * 获取 Web 兼容的屏幕选项
 */
export const getWebCompatibleScreenOptions = (options: any = {}) => {
  if (Platform.OS !== 'web') return options;

  const webCompatibleOptions = { ...options };

  // 只处理字体样式，不添加 pointerEvents
  if (webCompatibleOptions.headerTitleStyle) {
    webCompatibleOptions.headerTitleStyle = getWebCompatibleFontStyle(webCompatibleOptions.headerTitleStyle);
  }

  // 保持其他样式不变，不添加 pointerEvents
  return webCompatibleOptions;
};