import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { testStorageService } from './src/utils/testStorage';
import { applySimpleWebFixes } from './src/utils/simpleWebFixes';

export default function App() {
  useEffect(() => {
    // 应用简单的 Web 修复
    applySimpleWebFixes();
    
    // 在开发模式下测试存储服务
    if (__DEV__) {
      testStorageService();
    }
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
