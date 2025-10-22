import { WishEntry } from '../types';
import { StorageService } from '../services/storageService';
import { getDateOneWeekAgo } from './dateUtils';

// 创建测试用的一周前愿望
export const createTestWishForReview = async (): Promise<void> => {
  const oneWeekAgo = getDateOneWeekAgo();
  const testWish: WishEntry = {
    id: `test_wish_${Date.now()}`,
    userId: 'test_user',
    title: '测试愿望 - 学会新技能',
    content: '我希望在一周内学会一项新的编程技能，提升自己的能力。',
    targetDate: new Date(), // 目标日期是今天（一周后）
    createdAt: oneWeekAgo, // 创建日期是一周前
    updatedAt: oneWeekAgo,
    status: 'pending',
    category: 'learning',
    priority: 'medium',
    motivationLevel: 8,
    likes: 0,
    isLiked: false,
    tags: ['学习', '技能'],
    specificActions: ['每天练习1小时', '完成在线课程'],
    successCriteria: '能够独立完成一个小项目',
    focusTime: 180, // 3分钟
  };

  await StorageService.saveWishEntry(testWish);
  console.log('测试愿望已创建:', testWish.title);
};

// 创建多个不同日期的测试愿望
export const createMultipleTestWishes = async (): Promise<void> => {
  const wishes: WishEntry[] = [
    {
      id: `test_wish_1_${Date.now()}`,
      userId: 'test_user',
      title: '8天前的愿望',
      content: '这是8天前创建的愿望，应该可以回顾。',
      targetDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 昨天
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8天前
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'personal_growth',
      priority: 'high',
      motivationLevel: 9,
      likes: 0,
      isLiked: false,
      tags: ['测试'],
      specificActions: [],
      successCriteria: '完成目标',
      focusTime: 180,
    },
    {
      id: `test_wish_2_${Date.now()}`,
      userId: 'test_user',
      title: '7天前的愿望',
      content: '这是恰好7天前创建的愿望，应该可以回顾。',
      targetDate: new Date(), // 今天
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'health',
      priority: 'medium',
      motivationLevel: 7,
      likes: 0,
      isLiked: false,
      tags: ['健康'],
      specificActions: [],
      successCriteria: '达成健康目标',
      focusTime: 180,
    },
    {
      id: `test_wish_3_${Date.now()}`,
      userId: 'test_user',
      title: '5天前的愿望',
      content: '这是5天前创建的愿望，还不能回顾。',
      targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 后天
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
      category: 'career',
      priority: 'low',
      motivationLevel: 6,
      likes: 0,
      isLiked: false,
      tags: ['工作'],
      specificActions: [],
      successCriteria: '职业发展',
      focusTime: 180,
    },
  ];

  for (const wish of wishes) {
    await StorageService.saveWishEntry(wish);
    console.log(`测试愿望已创建: ${wish.title} (${wish.createdAt.toLocaleDateString()})`);
  }
};

// 清除所有测试数据
export const clearTestData = async (): Promise<void> => {
  const allWishes = await StorageService.getAllWishes();
  const testWishes = allWishes.filter(wish => wish.title.includes('测试') || wish.userId === 'test_user');
  
  for (const wish of testWishes) {
    await StorageService.deleteWish(wish.id);
  }
  
  // 也清除相关的回顾数据
  const allReviews = await StorageService.getAllReviews();
  const testReviews = allReviews.filter(review => review.userId === 'test_user');
  // 注意：StorageService 没有删除单个回顾的方法，这里只是记录
  
  console.log(`已清除 ${testWishes.length} 个测试愿望和 ${testReviews.length} 个测试回顾`);
};

// 检查愿望状态更新
export const checkWishStatusUpdates = async (): Promise<void> => {
  const allWishes = await StorageService.getAllWishes();
  const testWishes = allWishes.filter(wish => wish.userId === 'test_user');
  
  console.log('=== 愿望状态检查 ===');
  testWishes.forEach(wish => {
    console.log(`愿望: "${wish.title}" - 状态: ${wish.status} - 更新时间: ${wish.updatedAt.toLocaleString()}`);
  });
  
  const allReviews = await StorageService.getAllReviews();
  const testReviews = allReviews.filter(review => review.userId === 'test_user');
  
  console.log('=== 回顾记录检查 ===');
  testReviews.forEach(review => {
    const relatedWish = testWishes.find(wish => wish.id === review.wishEntryId);
    console.log(`回顾: 愿望"${relatedWish?.title}" - 成就状态: ${review.achievementStatus} - 回顾时间: ${review.createdAt.toLocaleString()}`);
  });
};