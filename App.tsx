import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { testStorageService } from './src/utils/testStorage';
import { testNotificationService } from './src/utils/testNotifications';
import { testUserService } from './src/utils/testUserService';
import { testPlatformFixes } from './src/utils/testPlatformFixes';
import { applySimpleWebFixes } from './src/utils/simpleWebFixes';
import { NotificationService } from './src/services/notificationService';

// Web端通知测试（动态导入避免在非Web环境中出错）
if (Platform.OS === 'web') {
  import('./src/utils/testWebNotifications');
}

export default function App() {
  useEffect(() => {
    // 应用简单的 Web 修复
    applySimpleWebFixes();
    
    // 初始化通知服务
    initializeNotifications();
    
    // 在开发模式下测试存储服务
    if (__DEV__) {
      testPlatformFixes();
      testStorageService();
      testNotificationService();
      testUserService();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      
      // 设置默认的每日提醒
      const settings = await NotificationService.getNotificationSettings();
      if (settings.enabled) {
        await NotificationService.scheduleDailyReminder(settings.dailyReminderTime);
      }
    } catch (error) {
      console.error('初始化通知服务失败:', error);
    }
  };

  return (
    <ThemeProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
