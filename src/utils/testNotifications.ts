import { NotificationService } from '../services/notificationService';

export async function testNotificationService() {
  console.log('🔔 开始通知服务测试...');
  
  try {
    // 测试获取设置
    const settings = await NotificationService.getNotificationSettings();
    console.log('📋 当前通知设置:', settings);
    
    // 测试激励消息
    const dailyMessage = NotificationService.getRandomMotivationalMessage('daily');
    const reviewMessage = NotificationService.getRandomMotivationalMessage('review');
    console.log('💬 每日激励消息:', dailyMessage);
    console.log('💬 回顾激励消息:', reviewMessage);
    
    // 测试获取已安排的通知
    const scheduledNotifications = await NotificationService.getAllScheduledNotifications();
    console.log('📅 已安排通知数量:', scheduledNotifications.length);
    
    // 测试发送测试通知
    console.log('📤 发送测试通知...');
    await NotificationService.sendTestNotification('daily_reminder');
    
    console.log('✅ 通知服务测试完成！');
  } catch (error) {
    console.error('❌ 通知服务测试失败:', error);
  }
}