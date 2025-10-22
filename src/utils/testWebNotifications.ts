// Web端通知功能测试工具
import { Platform } from 'react-native';

export const testWebNotificationSupport = () => {
  // 只在Web平台执行
  if (Platform.OS !== 'web') {
    return false;
  }
  
  console.log('🌐 开始Web端通知支持测试...');
  
  // 检查浏览器支持
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.error('❌ 浏览器不支持Notification API');
    return false;
  }
  
  console.log('✅ 浏览器支持Notification API');
  console.log('📋 当前通知权限状态:', Notification.permission);
  
  return true;
};

export const requestWebNotificationPermission = async (): Promise<boolean> => {
  // 只在Web平台执行
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window)) {
    console.error('❌ 浏览器不支持通知');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    console.log('✅ 通知权限已授予');
    return true;
  }
  
  if (Notification.permission === 'denied') {
    console.warn('❌ 通知权限被拒绝');
    return false;
  }
  
  try {
    console.log('📝 请求通知权限...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ 用户授予了通知权限');
      return true;
    } else {
      console.warn('❌ 用户拒绝了通知权限');
      return false;
    }
  } catch (error) {
    console.error('❌ 请求通知权限失败:', error);
    return false;
  }
};

export const sendTestWebNotification = (title: string, body: string): boolean => {
  // 只在Web平台执行
  if (Platform.OS !== 'web') {
    return false;
  }
  
  console.log('🔔 开始发送Web通知...');
  console.log('📋 通知内容:', { title, body });
  
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.error('❌ 浏览器不支持通知');
    return false;
  }
  
  console.log('📋 当前通知权限:', Notification.permission);
  
  if (Notification.permission !== 'granted') {
    console.error('❌ 没有通知权限，当前状态:', Notification.permission);
    return false;
  }
  
  try {
    console.log('🚀 创建通知对象...');
    
    // 检查页面是否在前台
    if (document.hidden) {
      console.warn('⚠️ 页面在后台，通知可能不会显示');
    }
    
    // 检查浏览器焦点
    if (!document.hasFocus()) {
      console.warn('⚠️ 页面失去焦点，通知可能不会显示');
    }
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false, // 不要求用户交互
      silent: false, // 允许声音
    });
    
    console.log('✅ 通知对象已创建:', notification);
    
    // 监听通知事件
    notification.onshow = () => {
      console.log('🎉 通知已显示');
    };
    
    notification.onerror = (error) => {
      console.error('❌ 通知显示错误:', error);
    };
    
    notification.onclose = () => {
      console.log('🔒 通知已关闭');
    };
    
    // 设置点击事件
    notification.onclick = () => {
      console.log('🖱️ 用户点击了通知');
      window.focus(); // 聚焦到窗口
      notification.close();
    };
    
    // 自动关闭通知
    setTimeout(() => {
      if (notification) {
        console.log('⏰ 自动关闭通知');
        notification.close();
      }
    }, 8000); // 延长到8秒
    
    console.log('✅ 测试通知已发送');
    return true;
  } catch (error) {
    console.error('❌ 发送通知失败:', error);
    console.error('错误详情:', error);
    return false;
  }
};

export const scheduleDelayedWebNotification = (
  title: string, 
  body: string, 
  delayMs: number
): ReturnType<typeof setTimeout> | null => {
  // 只在Web平台执行
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    console.error('❌ 无法安排延时通知：权限不足');
    return null;
  }
  
  const timeoutId = setTimeout(() => {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'delayed-notification',
      });
      
      notification.onclick = () => {
        console.log('🖱️ 用户点击了延时通知');
        notification.close();
      };
      
      setTimeout(() => {
        notification.close();
      }, 5000);
      
      console.log('⏰ 延时通知已显示');
    } catch (error) {
      console.error('❌ 显示延时通知失败:', error);
    }
  }, delayMs);
  
  console.log(`⏱️ 延时通知已安排，将在 ${delayMs}ms 后显示`);
  return timeoutId;
};

// 在开发模式下自动测试
if (Platform.OS === 'web' && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟执行，确保页面加载完成
  setTimeout(async () => {
    console.log('🧪 开始Web端通知自动测试...');
    
    if (testWebNotificationSupport()) {
      // 如果已有权限，发送测试通知
      if (Notification.permission === 'granted') {
        console.log('🔔 权限已授予，发送测试通知...');
        const success = sendTestWebNotification(
          '清晨梦想日记 - Web端测试',
          '🌐 Web端通知功能正常工作！'
        );
        
        if (!success) {
          console.warn('⚠️ 测试通知发送失败，建议运行诊断工具');
        }
      } else {
        console.log('📝 通知权限未授予，跳过自动测试');
      }
    }
  }, 2000);
}