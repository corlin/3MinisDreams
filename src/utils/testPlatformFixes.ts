// 平台修复测试
import { Platform } from 'react-native';

export const testPlatformFixes = () => {
  console.log('🔧 开始平台修复测试...');
  console.log('📱 当前平台:', Platform.OS);
  
  if (Platform.OS === 'web') {
    console.log('🌐 Web平台 - Web通知功能可用');
    
    // 只在Web平台测试Web功能
    try {
      const { testWebNotificationSupport } = require('./testWebNotifications');
      const supported = testWebNotificationSupport();
      console.log('🔔 Web通知支持:', supported ? '✅' : '❌');
    } catch (error) {
      console.log('⚠️ Web通知测试跳过:', error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log('📱 原生平台 - Web通知功能已禁用');
    console.log('✅ 平台检查正常工作');
  }
  
  console.log('🎉 平台修复测试完成');
};