// 日期工具函数

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// 获取一周前的日期
export const getDateOneWeekAgo = (fromDate?: Date): Date => {
  const date = fromDate || new Date();
  const oneWeekAgo = new Date(date);
  oneWeekAgo.setDate(date.getDate() - 7);
  return oneWeekAgo;
};

// 获取一周后的日期
export const getDateOneWeekLater = (fromDate?: Date): Date => {
  const date = fromDate || new Date();
  const oneWeekLater = new Date(date);
  oneWeekLater.setDate(date.getDate() + 7);
  return oneWeekLater;
};

// 检查日期是否在指定范围内
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  return date >= startDate && date <= endDate;
};

// 检查愿望是否可以回顾（创建日期满一周或更久）
export const isWishReviewable = (wishCreatedAt: Date, currentDate?: Date): boolean => {
  const now = currentDate || new Date();
  const oneWeekAgo = getDateOneWeekAgo(now);
  
  // 愿望创建时间必须在一周前或更早
  return wishCreatedAt <= oneWeekAgo;
};

// 计算两个日期之间的天数差
export const getDaysDifference = (date1: Date, date2: Date): number => {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// 格式化相对时间（如"3天前"）
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const daysDiff = getDaysDifference(date, now);
  
  if (daysDiff === 0) {
    return '今天';
  } else if (daysDiff === 1) {
    return '昨天';
  } else if (daysDiff <= 7) {
    return `${daysDiff}天前`;
  } else if (daysDiff <= 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks}周前`;
  } else {
    return formatDate(date);
  }
};