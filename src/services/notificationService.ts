import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { StorageService } from './storageService';

// 检查是否应该启用通知功能
const shouldEnableNotifications = () => {
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  
  // 在Android Expo Go中完全禁用通知功能
  if (isExpoGo && Platform.OS === 'android') {
    return false;
  }
  
  // Web端通知功能有限，但可以尝试使用
  if (Platform.OS === 'web') {
    // 检查浏览器是否支持通知API
    return typeof window !== 'undefined' && 'Notification' in window;
  }
  
  return true;
};

// Web端通知实现
const createWebNotifications = () => {
  const scheduledNotifications = new Map();
  
  return {
    getPermissionsAsync: async () => {
      if (!('Notification' in window)) {
        return { status: 'denied' };
      }
      const permission = Notification.permission;
      return { status: permission === 'granted' ? 'granted' : permission === 'denied' ? 'denied' : 'undetermined' };
    },
    
    requestPermissionsAsync: async () => {
      if (!('Notification' in window)) {
        return { status: 'denied' };
      }
      const permission = await Notification.requestPermission();
      return { status: permission === 'granted' ? 'granted' : 'denied' };
    },
    
    setNotificationChannelAsync: async () => {
      // Web端不需要通知渠道
    },
    
    scheduleNotificationAsync: async (request: any) => {
      console.log('🔔 Web端通知调度请求:', request);
      
      if (!('Notification' in window)) {
        console.error('❌ 浏览器不支持Notification API');
        throw new Error('浏览器不支持通知');
      }
      
      if (Notification.permission !== 'granted') {
        console.error('❌ 通知权限未授予，当前状态:', Notification.permission);
        throw new Error('通知权限未授予');
      }
      
      const { identifier, content, trigger } = request;
      console.log('📋 通知内容:', content);
      console.log('⏰ 触发器:', trigger);
      
      const createNotification = (title: string, body: string, tag: string) => {
        try {
          console.log('🚀 创建Web通知:', { title, body, tag });
          
          const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag,
            requireInteraction: false,
            silent: false,
          });
          
          // 添加事件监听器
          notification.onshow = () => {
            console.log('🎉 通知已显示:', title);
          };
          
          notification.onerror = (error) => {
            console.error('❌ 通知显示错误:', error);
          };
          
          notification.onclose = () => {
            console.log('🔒 通知已关闭:', title);
          };
          
          notification.onclick = () => {
            console.log('🖱️ 用户点击了通知:', title);
            window.focus();
            notification.close();
          };
          
          // 自动关闭
          setTimeout(() => {
            if (notification) {
              console.log('⏰ 自动关闭通知:', title);
              notification.close();
            }
          }, 8000);
          
          return notification;
        } catch (error) {
          console.error('❌ 创建通知失败:', error);
          throw error;
        }
      };
      
      if (!trigger) {
        // 立即显示通知
        console.log('📤 立即发送通知');
        createNotification(content.title, content.body, identifier || 'default');
        return;
      }
      
      // Web端不支持定时通知，只能模拟
      if (trigger.date) {
        const delay = new Date(trigger.date).getTime() - Date.now();
        console.log('⏱️ 延时通知，延迟时间:', delay, 'ms');
        
        if (delay > 0) {
          const timeoutId = setTimeout(() => {
            console.log('⏰ 延时通知触发');
            createNotification(content.title, content.body, identifier || 'default');
            scheduledNotifications.delete(identifier);
          }, delay);
          
          if (identifier) {
            scheduledNotifications.set(identifier, { timeoutId, content, trigger });
          }
        } else {
          console.warn('⚠️ 延时时间已过，立即显示通知');
          createNotification(content.title, content.body, identifier || 'default');
        }
      } else if (trigger.hour !== undefined && trigger.minute !== undefined) {
        // 每日重复通知在Web端不支持，只显示一次性通知
        console.warn('⚠️ Web端不支持重复通知，显示一次性通知');
        createNotification(content.title, content.body, identifier || 'default');
      }
    },
    
    cancelScheduledNotificationAsync: async (identifier: string) => {
      const scheduled = scheduledNotifications.get(identifier);
      if (scheduled) {
        clearTimeout(scheduled.timeoutId);
        scheduledNotifications.delete(identifier);
      }
    },
    
    getAllScheduledNotificationsAsync: async () => {
      return Array.from(scheduledNotifications.entries()).map(([id, data]) => ({
        identifier: id,
        content: data.content,
        trigger: data.trigger,
      }));
    },
    
    cancelAllScheduledNotificationsAsync: async () => {
      scheduledNotifications.forEach((data) => {
        clearTimeout(data.timeoutId);
      });
      scheduledNotifications.clear();
    },
    
    addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    AndroidImportance: { DEFAULT: 3 },
  };
};

// 通知功能的模拟实现（用于不支持的环境）
const createMockNotifications = () => ({
  getPermissionsAsync: async () => ({ status: 'denied' }),
  requestPermissionsAsync: async () => ({ status: 'denied' }),
  setNotificationChannelAsync: async () => {},
  scheduleNotificationAsync: async () => {
    throw new Error('通知功能在当前环境中不可用');
  },
  cancelScheduledNotificationAsync: async () => {},
  getAllScheduledNotificationsAsync: async () => [],
  cancelAllScheduledNotificationsAsync: async () => {},
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  AndroidImportance: { DEFAULT: 3 },
});

// 安全地获取通知模块
const getNotifications = async () => {
  if (!shouldEnableNotifications()) {
    console.log('🔔 通知功能在当前环境中被禁用');
    return createMockNotifications();
  }
  
  // Web端使用特殊的通知实现
  if (Platform.OS === 'web') {
    console.log('🌐 使用Web端通知实现');
    return createWebNotifications();
  }
  
  try {
    const Notifications = await import('expo-notifications');
    
    // 设置通知处理器
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    
    return Notifications;
  } catch (error) {
    console.error('加载通知模块失败，使用模拟实现:', error);
    return createMockNotifications();
  }
};

// 通知类型
export type NotificationType = 'daily_reminder' | 'review_reminder';

// 通知设置接口
export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // HH:MM 格式
  reviewReminderEnabled: boolean;
}

// 激励消息库
const MOTIVATIONAL_MESSAGES = {
  daily: [
    '🌅 新的一天，新的梦想！记录今天的愿望吧',
    '✨ 每个愿望都是未来的种子，今天种下什么呢？',
    '🎯 3分钟专注时间，让梦想更清晰',
    '💫 相信自己，今天的愿望明天就能实现',
    '🌟 美好的一天从记录愿望开始',
    '🚀 梦想不会逃跑，逃跑的是不敢追梦的人',
    '🌈 每一个愿望都值得被认真对待',
    '💪 坚持记录，见证自己的成长',
  ],
  review: [
    '🎉 一周过去了，来看看你的愿望实现得如何？',
    '📝 回顾是成长的开始，快来标记你的成就吧',
    '🏆 每一个实现的愿望都值得庆祝',
    '💎 反思让经验变成智慧',
    '🌱 看看这一周你成长了多少',
    '⭐ 无论结果如何，勇敢追梦就是胜利',
    '🎊 来记录这一周的收获和感悟吧',
  ],
};

export class NotificationService {
  private static readonly STORAGE_KEY = 'notification_settings';
  private static readonly DAILY_REMINDER_ID = 'daily_wish_reminder';
  private static readonly REVIEW_REMINDER_PREFIX = 'review_reminder_';

  // 检查是否在Expo Go环境中
  private static isExpoGo(): boolean {
    return Constants.executionEnvironment === 'storeClient';
  }

  // 检查通知功能是否可用
  private static isNotificationAvailable(): boolean {
    return shouldEnableNotifications();
  }

  // 初始化通知服务
  static async initialize(): Promise<void> {
    try {
      if (this.isExpoGo()) {
        console.log('🔔 在Expo Go环境中运行，通知功能有限');
        
        // 在Android Expo Go中直接返回，避免错误
        if (Platform.OS === 'android') {
          console.log('Android Expo Go：跳过通知初始化');
          return;
        }
      }

      if (!this.isNotificationAvailable()) {
        console.warn('通知功能不可用');
        return;
      }

      const notifications = await getNotifications();

      // 请求通知权限
      const { status: existingStatus } = await notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('通知权限未授予');
        return;
      }

      // 设置通知渠道 (Android)
      if (Platform.OS === 'android') {
        try {
          await notifications.setNotificationChannelAsync('default', {
            name: '愿望提醒',
            importance: notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        } catch (error) {
          console.warn('设置Android通知渠道失败:', error);
        }
      }

      console.log('通知服务初始化成功');
    } catch (error) {
      console.error('通知服务初始化失败:', error);
    }
  }

  // 获取通知设置
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settings = await StorageService.loadData<NotificationSettings>(this.STORAGE_KEY);
      return settings || {
        enabled: true,
        dailyReminderTime: '08:00',
        reviewReminderEnabled: true,
      };
    } catch (error) {
      console.error('获取通知设置失败:', error);
      return {
        enabled: true,
        dailyReminderTime: '08:00',
        reviewReminderEnabled: true,
      };
    }
  }

  // 保存通知设置
  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await StorageService.saveData(this.STORAGE_KEY, settings);
      
      // 重新设置通知
      if (settings.enabled) {
        await this.scheduleDailyReminder(settings.dailyReminderTime);
      } else {
        await this.cancelDailyReminder();
      }
    } catch (error) {
      console.error('保存通知设置失败:', error);
      throw error;
    }
  }

  // 获取随机激励消息
  static getRandomMotivationalMessage(type: 'daily' | 'review'): string {
    const messages = MOTIVATIONAL_MESSAGES[type];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  // 设置每日提醒
  static async scheduleDailyReminder(time: string): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        console.warn('通知功能不可用，跳过设置每日提醒');
        return;
      }

      const notifications = await getNotifications();

      // 先取消现有的提醒
      await this.cancelDailyReminder();

      const [hours, minutes] = time.split(':').map(Number);
      
      // 创建触发器 - 每天在指定时间触发
      const trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      await notifications.scheduleNotificationAsync({
        identifier: this.DAILY_REMINDER_ID,
        content: {
          title: '清晨梦想日记',
          body: this.getRandomMotivationalMessage('daily'),
          sound: 'default',
          data: {
            type: 'daily_reminder',
            screen: 'WishEntry',
          },
        },
        trigger: trigger as any, // 临时类型断言，避免类型错误
      });

      console.log(`每日提醒已设置: ${time}`);
    } catch (error) {
      console.error('设置每日提醒失败:', error);
      if (this.isExpoGo()) {
        console.warn('在Expo Go中，某些通知功能可能不可用');
      }
      // 不抛出错误，避免阻塞应用
    }
  }

  // 取消每日提醒
  static async cancelDailyReminder(): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        return;
      }
      const notifications = await getNotifications();
      await notifications.cancelScheduledNotificationAsync(this.DAILY_REMINDER_ID);
      console.log('每日提醒已取消');
    } catch (error) {
      console.error('取消每日提醒失败:', error);
    }
  }

  // 设置回顾提醒（一周后）
  static async scheduleReviewReminder(wishId: string, targetDate: Date): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        console.warn('通知功能不可用，跳过设置回顾提醒');
        return;
      }

      const notifications = await getNotifications();

      const settings = await this.getNotificationSettings();
      if (!settings.reviewReminderEnabled) {
        return;
      }

      const reminderId = `${this.REVIEW_REMINDER_PREFIX}${wishId}`;
      
      // 设置在目标日期当天的提醒
      const trigger = {
        date: targetDate,
      };

      await notifications.scheduleNotificationAsync({
        identifier: reminderId,
        content: {
          title: '愿望回顾时间到了！',
          body: this.getRandomMotivationalMessage('review'),
          sound: 'default',
          data: {
            type: 'review_reminder',
            wishId,
            screen: 'Review',
          },
        },
        trigger: trigger as any, // 临时类型断言，避免类型错误
      });

      console.log(`回顾提醒已设置: ${wishId} at ${targetDate}`);
    } catch (error) {
      console.error('设置回顾提醒失败:', error);
      if (this.isExpoGo()) {
        console.warn('在Expo Go中，某些通知功能可能不可用');
      }
    }
  }

  // 取消回顾提醒
  static async cancelReviewReminder(wishId: string): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        return;
      }
      const notifications = await getNotifications();
      const reminderId = `${this.REVIEW_REMINDER_PREFIX}${wishId}`;
      await notifications.cancelScheduledNotificationAsync(reminderId);
      console.log(`回顾提醒已取消: ${wishId}`);
    } catch (error) {
      console.error('取消回顾提醒失败:', error);
    }
  }

  // 获取所有已安排的通知
  static async getAllScheduledNotifications(): Promise<any[]> {
    try {
      if (!this.isNotificationAvailable()) {
        return [];
      }
      const notifications = await getNotifications();
      return await notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('获取已安排通知失败:', error);
      return [];
    }
  }

  // 取消所有通知
  static async cancelAllNotifications(): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        return;
      }
      const notifications = await getNotifications();
      await notifications.cancelAllScheduledNotificationsAsync();
      console.log('所有通知已取消');
    } catch (error) {
      console.error('取消所有通知失败:', error);
    }
  }

  // 立即发送测试通知
  static async sendTestNotification(type: NotificationType): Promise<void> {
    try {
      if (!this.isNotificationAvailable()) {
        throw new Error('通知功能在当前环境中不可用（Android Expo Go）');
      }

      const notifications = await getNotifications();

      const message = this.getRandomMotivationalMessage(
        type === 'daily_reminder' ? 'daily' : 'review'
      );

      await notifications.scheduleNotificationAsync({
        content: {
          title: '清晨梦想日记 (测试)',
          body: message,
          sound: 'default',
          data: {
            type,
            test: true,
          },
        },
        trigger: null, // 立即发送
      });

      console.log('测试通知已发送');
    } catch (error) {
      console.error('发送测试通知失败:', error);
      if (this.isExpoGo()) {
        throw new Error('在Expo Go中测试通知功能有限，建议使用开发构建版本');
      }
      throw error;
    }
  }

  // 处理通知点击事件
  static async addNotificationResponseListener(
    listener: (response: any) => void
  ): Promise<any> {
    if (!this.isNotificationAvailable()) {
      return null;
    }
    const notifications = await getNotifications();
    return notifications.addNotificationResponseReceivedListener(listener);
  }

  // 处理前台通知接收事件
  static async addNotificationReceivedListener(
    listener: (notification: any) => void
  ): Promise<any> {
    if (!this.isNotificationAvailable()) {
      return null;
    }
    const notifications = await getNotifications();
    return notifications.addNotificationReceivedListener(listener);
  }
}