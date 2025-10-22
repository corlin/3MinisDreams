import { User, UserPreferences, AppTheme } from '../types';
import { StorageService } from './storageService';

export class UserService {
  // 获取当前用户
  static async getCurrentUser(): Promise<User> {
    return await StorageService.getOrCreateUser();
  }

  // 更新用户信息
  static async updateUser(updates: Partial<User>): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      const updatedUser: User = {
        ...currentUser,
        ...updates,
        lastLoginAt: new Date(),
      };
      
      await StorageService.saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // 更新用户昵称
  static async updateNickname(nickname: string): Promise<User> {
    return await this.updateUser({ nickname });
  }

  // 更新用户描述
  static async updateDescription(description: string): Promise<User> {
    return await this.updateUser({ description });
  }

  // 更新用户偏好设置
  static async updatePreferences(preferences: Partial<UserPreferences>): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      const updatedPreferences: UserPreferences = {
        ...currentUser.preferences,
        ...preferences,
      };
      
      return await this.updateUser({ preferences: updatedPreferences });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // 更新主题
  static async updateTheme(theme: AppTheme): Promise<User> {
    return await this.updatePreferences({ theme });
  }

  // 获取用户偏好设置
  static async getUserPreferences(): Promise<UserPreferences> {
    const user = await this.getCurrentUser();
    return user.preferences;
  }

  // 获取当前主题
  static async getCurrentTheme(): Promise<AppTheme> {
    const preferences = await this.getUserPreferences();
    return preferences.theme;
  }
}