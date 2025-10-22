import { WishEntry, WishCategory, Priority, WishStatus, AchievementReview } from '../types';

// 格式化日期显示
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 生成用户ID（简单版本，后续会被认证系统替换）
export const generateUserId = (): string => {
  return 'user_' + generateId();
};

// 创建新的愿望条目
export const createWishEntry = (
  title: string,
  content: string,
  category: WishCategory,
  priority: Priority = 'medium',
  userId: string,
  motivationLevel: number = 5,
  tags: string[] = [],
  specificActions: string[] = [],
  successCriteria: string = '',
  focusTime: number = 0
): WishEntry => {
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + 7); // 一周后

  return {
    id: generateId(),
    userId,
    title: title.trim(),
    content: content.trim(),
    targetDate,
    createdAt: now,
    updatedAt: now,
    status: 'pending' as WishStatus,
    category,
    priority,
    motivationLevel: Math.max(1, Math.min(10, motivationLevel)), // 确保在1-10范围内
    likes: 0,
    isLiked: false,
    tags: tags.filter(tag => tag.trim().length > 0),
    specificActions: specificActions.filter(action => action.trim().length > 0),
    successCriteria: successCriteria.trim(),
    focusTime: Math.max(0, focusTime), // 确保专注时间不为负数
  };
};

// 验证愿望条目数据
export const validateWishEntry = (wish: Partial<WishEntry>): string[] => {
  const errors: string[] = [];

  if (!wish.title || wish.title.trim().length === 0) {
    errors.push('愿望标题不能为空');
  }

  if (!wish.content || wish.content.trim().length === 0) {
    errors.push('愿望内容不能为空');
  }

  if (wish.title && wish.title.length > 100) {
    errors.push('愿望标题不能超过100个字符');
  }

  if (wish.content && wish.content.length > 1000) {
    errors.push('愿望内容不能超过1000个字符');
  }

  if (wish.motivationLevel && (wish.motivationLevel < 1 || wish.motivationLevel > 10)) {
    errors.push('动机强度必须在1-10之间');
  }

  return errors;
};

// 序列化愿望条目（处理Date对象）
export const serializeWishEntry = (wish: WishEntry): any => {
  return {
    ...wish,
    targetDate: wish.targetDate.toISOString(),
    createdAt: wish.createdAt.toISOString(),
    updatedAt: wish.updatedAt.toISOString(),
  };
};

// 反序列化愿望条目（恢复Date对象）
export const deserializeWishEntry = (data: any): WishEntry => {
  return {
    ...data,
    targetDate: new Date(data.targetDate),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    // 确保旧数据也有点赞相关字段
    likes: data.likes ?? 0,
    isLiked: data.isLiked ?? false,
  };
};

// 序列化愿望列表
export const serializeWishList = (wishes: WishEntry[]): any[] => {
  return wishes.map(serializeWishEntry);
};

// 反序列化愿望列表
export const deserializeWishList = (data: any[]): WishEntry[] => {
  return data.map(deserializeWishEntry);
};

// 检查愿望是否需要回顾（是否已经过了目标日期）
export const isWishReadyForReview = (wish: WishEntry): boolean => {
  const now = new Date();
  return now >= wish.targetDate && wish.status === 'pending';
};

// 获取愿望的剩余天数
export const getDaysUntilTarget = (wish: WishEntry): number => {
  const now = new Date();
  const diffTime = wish.targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 格式化愿望分类显示名称
export const getCategoryDisplayName = (category: WishCategory): string => {
  const categoryNames: Record<WishCategory, string> = {
    personal_growth: '个人成长',
    career: '事业发展',
    health: '健康生活',
    relationships: '人际关系',
    learning: '学习进步',
    creativity: '创意表达',
  };
  return categoryNames[category] || category;
};

// 格式化优先级显示名称
export const getPriorityDisplayName = (priority: Priority): string => {
  const priorityNames: Record<Priority, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return priorityNames[priority] || priority;
};

// 格式化状态显示名称
export const getStatusDisplayName = (status: WishStatus): string => {
  const statusNames: Record<WishStatus, string> = {
    pending: '待实现',
    achieved: '已实现',
    partially_achieved: '部分实现',
    not_achieved: '未实现',
  };
  return statusNames[status] || status;
};

// 序列化成就回顾（处理Date对象）
export const serializeAchievementReview = (review: AchievementReview): any => {
  return {
    ...review,
    createdAt: review.createdAt.toISOString(),
  };
};

// 反序列化成就回顾（恢复Date对象）
export const deserializeAchievementReview = (data: any): AchievementReview => {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// 序列化成就回顾列表
export const serializeReviewList = (reviews: AchievementReview[]): any[] => {
  return reviews.map(serializeAchievementReview);
};

// 反序列化成就回顾列表
export const deserializeReviewList = (data: any[]): AchievementReview[] => {
  return data.map(deserializeAchievementReview);
};