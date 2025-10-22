// 用户服务测试
import { UserService } from '../services/userService';

export const testUserService = async (): Promise<void> => {
  try {
    console.log('🚀 开始用户服务测试...');

    // 测试获取或创建用户
    const user = await UserService.getCurrentUser();
    console.log('👤 获取用户:', user.nickname);

    // 测试更新昵称
    const updatedUser = await UserService.updateNickname('测试昵称');
    console.log('✏️ 更新昵称:', updatedUser.nickname === '测试昵称' ? '✅ 成功' : '❌ 失败');

    // 测试更新描述
    const userWithDescription = await UserService.updateDescription('这是测试描述');
    console.log('📝 更新描述:', userWithDescription.description === '这是测试描述' ? '✅ 成功' : '❌ 失败');

    // 测试更新主题
    const userWithDarkTheme = await UserService.updateTheme('dark');
    console.log('🌙 更新主题:', userWithDarkTheme.preferences.theme === 'dark' ? '✅ 成功' : '❌ 失败');

    // 测试获取当前主题
    const currentTheme = await UserService.getCurrentTheme();
    console.log('🎨 获取主题:', currentTheme === 'dark' ? '✅ 成功' : '❌ 失败');

    // 恢复浅色主题
    await UserService.updateTheme('light');
    console.log('☀️ 恢复浅色主题');

    console.log('🎉 用户服务测试完成！');

  } catch (error) {
    console.error('❌ 用户服务测试失败:', error);
  }
};