// 测试点赞功能的简单脚本
import { StorageService } from '../services/storageService';
import { createWishEntry } from './wishUtils';

export const testLikeFeature = async () => {
  console.log('开始测试点赞功能...');
  
  try {
    // 创建测试愿望
    const testWish = createWishEntry(
      '测试愿望',
      '这是一个用于测试点赞功能的愿望',
      'personal_growth',
      'medium',
      'test-user',
      8,
      ['测试', '点赞'],
      ['创建愿望', '测试点赞'],
      '成功点赞并显示激励信息'
    );

    // 保存愿望
    await StorageService.saveWishEntry(testWish);
    console.log('✅ 测试愿望已创建:', testWish.id);

    // 读取愿望
    const savedWish = await StorageService.getWishById(testWish.id);
    if (!savedWish) {
      throw new Error('无法读取保存的愿望');
    }
    console.log('✅ 愿望读取成功');
    console.log('初始点赞状态:', { likes: savedWish.likes, isLiked: savedWish.isLiked });

    // 测试点赞
    const likedWish = {
      ...savedWish,
      likes: savedWish.likes + 1,
      isLiked: true,
      updatedAt: new Date(),
    };

    await StorageService.saveWishEntry(likedWish);
    console.log('✅ 点赞操作完成');

    // 验证点赞结果
    const updatedWish = await StorageService.getWishById(testWish.id);
    if (!updatedWish) {
      throw new Error('无法读取更新后的愿望');
    }

    console.log('更新后点赞状态:', { likes: updatedWish.likes, isLiked: updatedWish.isLiked });

    if (updatedWish.likes === 1 && updatedWish.isLiked === true) {
      console.log('✅ 点赞功能测试通过！');
    } else {
      throw new Error('点赞状态不正确');
    }

    // 测试取消点赞
    const unlikedWish = {
      ...updatedWish,
      likes: updatedWish.likes - 1,
      isLiked: false,
      updatedAt: new Date(),
    };

    await StorageService.saveWishEntry(unlikedWish);
    console.log('✅ 取消点赞操作完成');

    // 验证取消点赞结果
    const finalWish = await StorageService.getWishById(testWish.id);
    if (!finalWish) {
      throw new Error('无法读取最终的愿望');
    }

    console.log('最终点赞状态:', { likes: finalWish.likes, isLiked: finalWish.isLiked });

    if (finalWish.likes === 0 && finalWish.isLiked === false) {
      console.log('✅ 取消点赞功能测试通过！');
    } else {
      throw new Error('取消点赞状态不正确');
    }

    // 清理测试数据
    await StorageService.deleteWish(testWish.id);
    console.log('✅ 测试数据已清理');

    console.log('🎉 所有点赞功能测试通过！');
    return true;

  } catch (error) {
    console.error('❌ 点赞功能测试失败:', error);
    return false;
  }
};

// 测试激励消息
export const testEncouragementMessages = () => {
  console.log('测试激励消息...');
  
  const encouragements = [
    '为自己点赞！你值得被鼓励 ❤️',
    '相信自己，你一定可以实现这个愿望！✨',
    '每一个点赞都是对自己的肯定 👏',
    '你的努力值得被看见和认可！🌟',
    '给自己一些正能量，继续加油！💪',
  ];

  console.log('激励消息库包含', encouragements.length, '条消息:');
  encouragements.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg}`);
  });

  // 测试随机选择
  const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
  console.log('随机选择的激励消息:', randomMsg);
  
  console.log('✅ 激励消息测试完成');
  return true;
};