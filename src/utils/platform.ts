import { Platform } from 'react-native';

/**
 * 检测是否在 Web 环境中运行
 */
export const isWeb = Platform.OS === 'web';

/**
 * 获取适合当前平台的动画配置
 * 在 Web 环境中禁用 useNativeDriver 以避免警告
 */
export const getAnimationConfig = (useNativeDriver: boolean = true) => ({
  useNativeDriver: isWeb ? false : useNativeDriver,
});

/**
 * 获取适合 Web 的样式属性
 * 将 pointerEvents 移到 style 中以避免警告
 */
export const getWebCompatibleStyle = (style: any, pointerEvents?: string) => {
  if (isWeb && pointerEvents) {
    return {
      ...style,
      pointerEvents,
    };
  }
  return style;
};

/**
 * 获取适合 Web 的 View 属性
 * 确保 pointerEvents 在 style 中而不是作为组件属性
 */
export const getWebCompatibleViewProps = (props: any) => {
  if (!isWeb) return props;
  
  const { pointerEvents, style, ...otherProps } = props;
  
  if (pointerEvents) {
    return {
      ...otherProps,
      style: {
        ...style,
        pointerEvents,
      },
    };
  }
  
  return props;
};