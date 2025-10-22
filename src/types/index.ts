// 基础类型定义

export type WishCategory = 'personal_growth' | 'career' | 'health' | 'relationships' | 'learning' | 'creativity';
export type Priority = 'low' | 'medium' | 'high';
export type WishStatus = 'pending' | 'achieved' | 'partially_achieved' | 'not_achieved';
export type AchievementStatus = 'fully_achieved' | 'partially_achieved' | 'not_achieved' | 'in_progress';
export type EmotionalState = 'proud' | 'satisfied' | 'motivated' | 'disappointed' | 'determined';

export interface WishEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  targetDate: Date; // 预期实现日期（记录日期+7天）
  createdAt: Date;
  updatedAt: Date;
  status: WishStatus;
  category: WishCategory;
  priority: Priority;
  motivationLevel: number; // 1-10 记录时的动机强度
  likes: number;
  isLiked: boolean;
  tags: string[];
  specificActions: string[]; // 具体行动步骤
  successCriteria: string; // 成功标准
  focusTime?: number; // 专注时间（秒）
}

export interface AchievementReview {
  id: string;
  wishEntryId: string;
  userId: string;
  achievementStatus: AchievementStatus;
  achievementPercentage: number; // 0-100
  reflection: string;
  emotionalStateAfter: EmotionalState;
  celebrationMoment: string; // 庆祝时刻描述
  lessonsLearned: string[];
  improvementAreas: string[];
  nextGoals: string[]; // 下一步目标
  gratitudeNotes: string[]; // 感恩记录
  createdAt: Date;
}

export interface User {
  id: string;
  nickname: string;
  description: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: AppTheme;
  language: 'zh' | 'en';
  notificationSettings: NotificationSettings;
}

export type AppTheme = 'light' | 'dark';

// 通知相关类型
export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // HH:MM 格式
  reviewReminderEnabled: boolean;
}

export type NotificationType = 'daily_reminder' | 'review_reminder';