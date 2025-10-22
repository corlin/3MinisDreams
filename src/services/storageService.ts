import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishEntry, AchievementReview, User } from '../types';
import { serializeWishList, deserializeWishList } from '../utils/wishUtils';

// 存储键常量
const STORAGE_KEYS = {
  WISHES: 'wishes',
  REVIEWS: 'reviews',
  USER: 'user',
  USER_PREFERENCES: 'user_preferences',
} as const;

export class StorageService {
  // 通用数据保存方法
  static async saveData(key: string, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  // 通用数据加载方法
  static async loadData<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return null;
      }
      return JSON.parse(jsonData) as T;
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
      throw error;
    }
  }

  // 通用数据删除方法
  static async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  // 愿望相关方法
  static async saveWishEntry(wish: WishEntry): Promise<void> {
    try {
      const wishes = await this.getAllWishes();
      const existingIndex = wishes.findIndex(w => w.id === wish.id);
      
      if (existingIndex >= 0) {
        wishes[existingIndex] = { ...wish, updatedAt: new Date() };
      } else {
        wishes.push(wish);
      }
      
      // 序列化日期对象后保存
      const serializedWishes = serializeWishList(wishes);
      await this.saveData(STORAGE_KEYS.WISHES, serializedWishes);
    } catch (error) {
      console.error('Error saving wish entry:', error);
      throw error;
    }
  }

  static async getAllWishes(): Promise<WishEntry[]> {
    try {
      const wishesData = await this.loadData<any[]>(STORAGE_KEYS.WISHES);
      if (!wishesData) {
        return [];
      }
      // 反序列化日期对象
      return deserializeWishList(wishesData);
    } catch (error) {
      console.error('Error loading wishes:', error);
      return [];
    }
  }

  static async getWishById(id: string): Promise<WishEntry | null> {
    try {
      const wishes = await this.getAllWishes();
      return wishes.find(wish => wish.id === id) || null;
    } catch (error) {
      console.error('Error getting wish by id:', error);
      return null;
    }
  }

  static async getWishesByUserId(userId: string): Promise<WishEntry[]> {
    try {
      const wishes = await this.getAllWishes();
      return wishes.filter(wish => wish.userId === userId);
    } catch (error) {
      console.error('Error getting wishes by user id:', error);
      return [];
    }
  }

  static async deleteWish(id: string): Promise<void> {
    try {
      const wishes = await this.getAllWishes();
      const filteredWishes = wishes.filter(wish => wish.id !== id);
      await this.saveData(STORAGE_KEYS.WISHES, filteredWishes);
    } catch (error) {
      console.error('Error deleting wish:', error);
      throw error;
    }
  }

  // 成就回顾相关方法
  static async saveAchievementReview(review: AchievementReview): Promise<void> {
    try {
      const reviews = await this.getAllReviews();
      const existingIndex = reviews.findIndex(r => r.id === review.id);
      
      if (existingIndex >= 0) {
        reviews[existingIndex] = review;
      } else {
        reviews.push(review);
      }
      
      await this.saveData(STORAGE_KEYS.REVIEWS, reviews);
    } catch (error) {
      console.error('Error saving achievement review:', error);
      throw error;
    }
  }

  static async getAllReviews(): Promise<AchievementReview[]> {
    try {
      const reviews = await this.loadData<AchievementReview[]>(STORAGE_KEYS.REVIEWS);
      return reviews || [];
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  }

  static async getReviewsByUserId(userId: string): Promise<AchievementReview[]> {
    try {
      const reviews = await this.getAllReviews();
      return reviews.filter(review => review.userId === userId);
    } catch (error) {
      console.error('Error getting reviews by user id:', error);
      return [];
    }
  }

  // 用户相关方法
  static async saveUser(user: User): Promise<void> {
    try {
      await this.saveData(STORAGE_KEYS.USER, user);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      return await this.loadData<User>(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}