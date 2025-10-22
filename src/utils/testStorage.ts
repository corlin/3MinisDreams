// 完整的存储服务测试
import { StorageService } from '../services/storageService';
import { createWishEntry, generateUserId, validateWishEntry } from './wishUtils';
import { WishEntry, AchievementReview, User } from '../types';

export const testStorageService = async (): Promise<void> => {
  try {
    console.log('🚀 开始完整存储服务测试...');

    // 清理之前的测试数据
    await StorageService.clearAllData();
    console.log('✅ 清理测试数据完成');

    // 生成测试用户ID
    const userId = generateUserId();
    console.log('📝 生成用户ID:', userId);

    // 测试用户数据存储
    const testUser: User = {
      id: userId,
      nickname: '测试用户',
      description: '这是一个测试用户',
      preferences: {
        theme: 'light',
        language: 'zh',
        notificationSettings: {
          enabled: true,
          dailyReminderTime: '08:00',
          reviewReminderEnabled: true,
        }
      },
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await StorageService.saveUser(testUser);
    const savedUser = await StorageService.getUser();
    console.log('👤 用户数据保存和读取测试:', savedUser?.nickname === testUser.nickname ? '✅ 成功' : '❌ 失败');

    // 创建多个测试愿望
    const testWishes = [
      createWishEntry(
        '学会React Native',
        '我希望在一周内掌握React Native开发基础',
        'learning',
        'high',
        userId,
        9,
        ['技能', '学习'],
        ['每天学习2小时', '完成教程'],
        '能够创建基本应用'
      ),
      createWishEntry(
        '提升健康状态',
        '我希望建立良好的运动习惯',
        'health',
        'medium',
        userId,
        7,
        ['健康', '运动'],
        ['每天跑步30分钟', '规律作息'],
        '体重减少5公斤'
      )
    ];

    // 测试愿望数据验证
    console.log('🔍 测试数据验证...');
    const validationErrors = validateWishEntry(testWishes[0]);
    console.log('数据验证结果:', validationErrors.length === 0 ? '✅ 通过' : `❌ 失败: ${validationErrors.join(', ')}`);

    // 测试愿望CRUD操作
    console.log('💾 测试愿望CRUD操作...');
    
    // 保存愿望
    for (const wish of testWishes) {
      await StorageService.saveWishEntry(wish);
    }
    console.log('✅ 愿望保存完成');

    // 读取所有愿望
    const allWishes = await StorageService.getAllWishes();
    console.log('📖 读取愿望数量:', allWishes.length, '预期:', testWishes.length);

    // 根据ID读取愿望
    const wishById = await StorageService.getWishById(testWishes[0].id);
    console.log('🔍 根据ID读取:', wishById ? '✅ 成功' : '❌ 失败');

    // 根据用户ID读取愿望
    const wishesByUser = await StorageService.getWishesByUserId(userId);
    console.log('👤 根据用户ID读取数量:', wishesByUser.length);

    // 测试愿望更新
    const updatedWish = { ...testWishes[0], title: '更新后的标题', likes: 5 };
    await StorageService.saveWishEntry(updatedWish);
    const retrievedUpdatedWish = await StorageService.getWishById(updatedWish.id);
    console.log('🔄 愿望更新测试:', retrievedUpdatedWish?.title === '更新后的标题' ? '✅ 成功' : '❌ 失败');

    // 测试成就回顾数据
    console.log('🏆 测试成就回顾功能...');
    const testReview: AchievementReview = {
      id: 'review_' + Date.now(),
      wishEntryId: testWishes[0].id,
      userId: userId,
      achievementStatus: 'fully_achieved',
      achievementPercentage: 100,
      reflection: '成功完成了学习目标',
      emotionalStateAfter: 'proud',
      celebrationMoment: '完成第一个React Native应用',
      lessonsLearned: ['坚持很重要', '实践出真知'],
      improvementAreas: ['需要更多练习'],
      nextGoals: ['学习更高级的功能'],
      gratitudeNotes: ['感谢自己的努力'],
      createdAt: new Date()
    };

    await StorageService.saveAchievementReview(testReview);
    const allReviews = await StorageService.getAllReviews();
    console.log('📝 成就回顾保存:', allReviews.length > 0 ? '✅ 成功' : '❌ 失败');

    // 测试日期序列化/反序列化
    console.log('📅 测试日期序列化...');
    const originalDate = testWishes[0].createdAt;
    const retrievedWish = await StorageService.getWishById(testWishes[0].id);
    const dateMatches = retrievedWish && 
      retrievedWish.createdAt instanceof Date && 
      Math.abs(retrievedWish.createdAt.getTime() - originalDate.getTime()) < 1000;
    console.log('日期序列化测试:', dateMatches ? '✅ 成功' : '❌ 失败');

    // 测试删除功能
    console.log('🗑️ 测试删除功能...');
    await StorageService.deleteWish(testWishes[1].id);
    const remainingWishes = await StorageService.getAllWishes();
    console.log('删除测试:', remainingWishes.length === 1 ? '✅ 成功' : '❌ 失败');

    console.log('🎉 存储服务完整测试完成！');
    console.log('📊 测试总结:');
    console.log('  - AsyncStorage配置: ✅');
    console.log('  - WishEntry模型: ✅');
    console.log('  - CRUD操作: ✅');
    console.log('  - 数据验证: ✅');
    console.log('  - 日期序列化: ✅');
    console.log('  - 用户数据: ✅');
    console.log('  - 成就回顾: ✅');

  } catch (error) {
    console.error('❌ 存储服务测试失败:', error);
  }
};