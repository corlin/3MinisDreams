import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../utils/platform';

interface WebCompatibleViewProps extends ViewProps {
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
}

/**
 * Web 兼容的 View 组件
 * 自动处理 pointerEvents 属性在 Web 环境中的正确设置
 */
export default function WebCompatibleView({ 
  pointerEvents, 
  style, 
  ...otherProps 
}: WebCompatibleViewProps) {
  if (isWeb && pointerEvents) {
    // 在 Web 环境中，将 pointerEvents 移到 style 中
    return (
      <View
        {...otherProps}
        style={[
          style,
          { pointerEvents }
        ]}
      />
    );
  }

  // 在原生环境中，正常使用 pointerEvents 属性
  return (
    <View
      {...otherProps}
      pointerEvents={pointerEvents}
      style={style}
    />
  );
}