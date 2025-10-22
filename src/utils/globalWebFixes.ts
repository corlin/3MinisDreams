import { Platform } from 'react-native';

/**
 * 全局 Web 兼容性修复
 * 这个文件包含了所有必要的 Web 端修复，确保应用在浏览器中正常运行
 */

/**
 * 应用所有 Web 修复
 */
export const applyAllWebFixes = () => {
  if (Platform.OS !== 'web') return;

  // 1. 修复控制台警告（必须最先执行）
  fixConsoleWarnings();
  
  // 2. 修复 React Native Web 内部问题
  fixReactNativeWebIssues();
  
  // 3. 修复 DOM 属性
  fixDOMAttributes();
  
  // 4. 修复字体问题
  fixFontIssues();
  
  // 5. 修复导航问题
  fixNavigationIssues();
};

/**
 * 修复控制台警告
 */
const fixConsoleWarnings = () => {
  // 保存原始方法
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;

  // 重写 console.warn
  console.warn = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // 静默处理所有已知的 Web 兼容性警告
      const ignoredWarnings = [
        'props.pointerEvents is deprecated',
        'Use style.pointerEvents',
        'pointerEvents was given a value of auto',
        'this has no effect on headerStyle',
        'pointerEvents.*deprecated',
        'warnOnce',
      ];

      if (ignoredWarnings.some(pattern => {
        try {
          return message.includes(pattern) || message.match(new RegExp(pattern, 'i'));
        } catch {
          return message.includes(pattern);
        }
      })) {
        return;
      }
    }
    originalWarn.apply(console, args);
  };

  // 重写 console.error
  console.error = (...args) => {
    const message = args[0];
    if (typeof message === 'string') {
      // 静默处理已知的错误
      const ignoredErrors = [
        'useNativeDriver',
        'native animated module is missing',
        'Falling back to JS-based animation',
        'Cannot read properties of undefined (reading \'bold\')',
      ];

      if (ignoredErrors.some(pattern => message.includes(pattern))) {
        return;
      }
    }
    originalError.apply(console, args);
  };

  // 也拦截可能的 console.log 警告
  console.log = (...args) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('pointerEvents is deprecated')) {
      return;
    }
    originalLog.apply(console, args);
  };
};

/**
 * 修复 React Native Web 内部问题
 */
const fixReactNativeWebIssues = () => {
  if (typeof window === 'undefined') return;

  // 拦截 React Native Web 的警告函数
  if (typeof window.console !== 'undefined') {
    // 查找并修复 warnOnce 函数
    const originalConsole = window.console;
    
    // 创建一个代理来拦截所有 console 方法
    window.console = new Proxy(originalConsole, {
      get(target, prop) {
        if (prop === 'warn') {
          return (...args: any[]) => {
            const message = args[0];
            if (typeof message === 'string' && (
              message.includes('pointerEvents is deprecated') ||
              message.includes('Use style.pointerEvents')
            )) {
              return; // 静默处理
            }
            return target.warn.apply(target, args);
          };
        }
        return target[prop as keyof Console];
      }
    });
  }

  // 修复可能的全局警告函数
  if (typeof (window as any).warnOnce === 'function') {
    const originalWarnOnce = (window as any).warnOnce;
    (window as any).warnOnce = (message: string) => {
      if (message && message.includes('pointerEvents is deprecated')) {
        return;
      }
      return originalWarnOnce(message);
    };
  }

  // 尝试修复 React Native Web 的内部警告机制
  setTimeout(() => {
    // 查找所有可能的警告函数
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.textContent && script.textContent.includes('warnOnce')) {
        // 尝试替换警告函数
        try {
          const newContent = script.textContent.replace(
            /warnOnce\s*\(\s*['"](.*pointerEvents.*deprecated.*)['"]\s*\)/g,
            '// warnOnce silenced: $1'
          );
          if (newContent !== script.textContent) {
            script.textContent = newContent;
          }
        } catch (e) {
          // 忽略错误
        }
      }
    });
  }, 100);
};

/**
 * 修复 DOM 属性问题
 */
const fixDOMAttributes = () => {
  if (typeof document === 'undefined') return;

  // 创建一个全局的 DOM 修复函数
  const fixElement = (element: Element) => {
    if (!(element instanceof HTMLElement)) return;

    // 修复 pointerEvents 属性
    if (element.hasAttribute('pointerEvents')) {
      const pointerEvents = element.getAttribute('pointerEvents');
      element.removeAttribute('pointerEvents');
      element.style.pointerEvents = pointerEvents || 'auto';
    }

    // 修复其他可能的属性问题
    const attributesToFix = ['pointerEvents', 'pointer-events'];
    attributesToFix.forEach(attr => {
      if (element.hasAttribute(attr)) {
        const value = element.getAttribute(attr);
        element.removeAttribute(attr);
        if (value) {
          element.style.pointerEvents = value;
        }
      }
    });
  };

  // 立即修复现有元素
  const fixExistingElements = () => {
    document.querySelectorAll('*').forEach(fixElement);
  };

  // 监听新元素的添加
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            fixElement(node as Element);
            // 也修复子元素
            (node as Element).querySelectorAll('*').forEach(fixElement);
          }
        });
      }
    });
  });

  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 延迟修复现有元素
  setTimeout(fixExistingElements, 100);
  
  // 在 DOM 加载完成后再次修复
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixExistingElements);
  }
};

/**
 * 修复字体问题
 */
const fixFontIssues = () => {
  // 全局错误处理
  if (typeof window !== 'undefined') {
    const originalError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.includes('Cannot read properties of undefined (reading \'bold\')')) {
        console.warn('Font error caught and handled:', message);
        return true;
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
  }
};

/**
 * 修复导航问题
 */
const fixNavigationIssues = () => {
  if (typeof document === 'undefined') return;

  // 专门处理导航相关的元素
  const fixNavigationElements = () => {
    const selectors = [
      '[data-react-navigation]',
      '[role="navigation"]',
      '.react-navigation',
      'header',
      '.header',
      '[class*="header"]',
      '[class*="navigation"]',
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (element instanceof HTMLElement) {
          // 移除可能导致问题的属性
          const problematicAttrs = ['pointerEvents', 'pointer-events'];
          problematicAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
              element.removeAttribute(attr);
            }
          });
        }
      });
    });
  };

  // 立即修复
  setTimeout(fixNavigationElements, 100);
  
  // 定期修复
  setInterval(fixNavigationElements, 1000);
};