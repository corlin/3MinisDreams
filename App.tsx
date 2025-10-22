import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { testStorageService } from './src/utils/testStorage';

export default function App() {
  useEffect(() => {
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
